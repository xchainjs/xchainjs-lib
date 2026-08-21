import { OfflineAminoSigner } from '@cosmjs/amino'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { LedgerSigner } from '@cosmjs/ledger-amino'
import { DecodedTxRaw, EncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'
import CosmosApp from '@ledgerhq/hw-app-cosmos'
import type Transport from '@ledgerhq/hw-transport'
import { TxHash } from '@xchainjs/xchain-client'
import { MsgTypes, roundRobinTry } from '@xchainjs/xchain-cosmos-sdk'
import { Address } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'

import { Client, CosmosClientParams } from './client'
import { TxParams } from './types'

export class ClientLedger extends Client {
  private transport: Transport // TODO: Parametrize
  private app: CosmosApp | undefined

  constructor(params: CosmosClientParams & { transport: Transport }) {
    super(params)
    this.transport = params.transport
  }

  // Get the current address synchronously
  public getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  public async getApp(): Promise<CosmosApp> {
    if (this.app) {
      return this.app
    }
    this.app = new CosmosApp(this.transport)
    return this.app
  }

  public async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getAddress(this.getFullDerivationPath(index), this.prefix, verify)
    return result.address
  }

  /**
   * Transfer Cosmos.
   *
   * @param {TxParams} params The transfer options including the fee rate.
   * @returns {Promise<TxHash|string>} A promise that resolves to the transaction hash or an error message.
   */
  async transfer({
    walletIndex,
    asset,
    amount,
    recipient,
    memo,
  }: TxParams & { gasLimit?: BigNumber }): Promise<TxHash> {
    const ledgerSigner: OfflineAminoSigner = new LedgerSigner(this.transport)
    const fromAddress = await this.getAddressAsync(walletIndex)

    const { rawUnsignedTx } = await this.prepareTx({ asset, amount, recipient, memo, sender: fromAddress })

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    // Sign once, then round-robin only the broadcast. Retrying signAndBroadcast after a
    // transport timeout can re-sign with a new sequence and submit a second transaction.
    const rawTx = await this.roundRobinSignTransfer(fromAddress, unsignedTx, ledgerSigner)

    return this.broadcastTx(toBase64(TxRaw.encode(rawTx).finish()))
  }

  /**
   * Sign a transfer making a round robin over the clients urls provided to the client.
   * Does not broadcast — callers must broadcast the signed bytes once via broadcastTx.
   * Named separately from Client.roundRobinSign to avoid a private-member subclass clash.
   *
   * @param {string} sender Sender address
   * @param {DecodedTxRaw} unsignedTx Unsigned transaction
   * @param {OfflineAminoSigner} signer Signer
   * @returns {TxRaw} The raw signed transaction
   */
  private async roundRobinSignTransfer(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: OfflineAminoSigner,
  ): Promise<TxRaw> {
    return roundRobinTry(this.clientUrls[this.network], 'sign transaction', async (url) => {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })

      const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
        return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
      })

      return signingClient.sign(
        sender,
        messages,
        this.getStandardFee(this.getAssetInfo().asset),
        unsignedTx.body.memo,
      )
    })
  }
}
