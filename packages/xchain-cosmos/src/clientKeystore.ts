import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { DecodedTxRaw, DirectSecp256k1HdWallet, EncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'
import { MsgTypes, makeClientPath, roundRobinTry } from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { bech32 } from '@scure/base'
import { HDKey } from '@scure/bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'
import { createHash } from 'crypto'
import * as secp from '@bitcoin-js/tiny-secp256k1-asmjs'

import { Client, CosmosClientParams } from './client'
import { defaultClientConfig } from './const'
import { TxParams } from './types'

export class ClientKeystore extends Client {
  constructor(params: CosmosClientParams = defaultClientConfig) {
    super(params)
  }
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  public getAddress(walletIndex?: number): string {
    const seed = getSeed(this.phrase)
    const node = HDKey.fromMasterSeed(new Uint8Array(seed))
    const child = node.derive(this.getFullDerivationPath(walletIndex || 0))

    if (!child.privateKey) throw new Error('child does not have a privateKey')

    // TODO: Make this method async and use CosmosJS official address generation strategy
    const pubKey = secp.pointFromScalar(child.privateKey, true)
    if (!pubKey) throw new Error('pubKey is null')
    const rawAddress = this.hash160(pubKey)
    const words = bech32.toWords(new Uint8Array(rawAddress))
    const address = bech32.encode(this.prefix, words)
    return address
  }

  public async transfer(params: TxParams): Promise<string> {
    const sender = await this.getAddressAsync(params.walletIndex || 0)

    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient: params.recipient,
      asset: params.asset,
      amount: params.amount,
      memo: params.memo,
    })

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(params.walletIndex || 0))],
    })

    // Sign once, then round-robin only the broadcast. Retrying signAndBroadcast after a
    // transport timeout can re-sign with a new sequence and submit a second transaction.
    const rawTx = await this.roundRobinSignTransfer(sender, unsignedTx, signer)

    return this.broadcastTx(toBase64(TxRaw.encode(rawTx).finish()))
  }

  /** Hashes a buffer using SHA256 followed by RIPEMD160 or RMD160. */
  private hash160(buffer: Uint8Array): Buffer {
    const sha256Hash: Buffer = createHash('sha256').update(buffer).digest()
    try {
      return createHash('rmd160').update(sha256Hash).digest()
    } catch (_err) {
      return createHash('ripemd160').update(sha256Hash).digest()
    }
  }

  /**
   * Does not broadcast — callers must broadcast the signed bytes once via broadcastTx.
   * Named separately from Client.roundRobinSign to avoid a private-member subclass clash.
   */
  private async roundRobinSignTransfer(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: DirectSecp256k1HdWallet,
  ): Promise<TxRaw> {
    return roundRobinTry(this.clientUrls[this.network], 'sign transaction', async (url) => {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })

      const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
        return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
      })

      return signingClient.sign(sender, messages, this.getStandardFee(this.getAssetInfo().asset), unsignedTx.body.memo)
    })
  }
}
