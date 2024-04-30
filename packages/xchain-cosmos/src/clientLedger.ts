import { OfflineAminoSigner } from '@cosmjs/amino'
import { fromBase64 } from '@cosmjs/encoding'
import { LedgerSigner } from '@cosmjs/ledger-amino'
import { DecodedTxRaw, EncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'
import CosmosApp from '@ledgerhq/hw-app-cosmos'
import type Transport from '@ledgerhq/hw-transport'
import { TxHash, TxParams } from '@xchainjs/xchain-client'
import { MsgTypes } from '@xchainjs/xchain-cosmos-sdk'
import { Address } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { Client, CosmosClientParams } from './client'

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

    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], ledgerSigner, {
      registry: this.registry,
    })

    const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
      return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
    })

    const tx = await signingClient.signAndBroadcast(
      fromAddress,
      messages,
      this.getStandardFee(this.getAssetInfo().asset),
      unsignedTx.body.memo,
    )
    return tx.transactionHash
  }
}
