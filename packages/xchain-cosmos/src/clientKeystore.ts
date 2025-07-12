import { fromBase64 } from '@cosmjs/encoding'
import { DecodedTxRaw, DirectSecp256k1HdWallet, EncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import { DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate'
import { MsgTypes, makeClientPath } from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { bech32 } from '@scure/base'
import { HDKey } from '@scure/bip32'
import { createHash } from 'crypto'
import * as secp from '@bitcoin-js/tiny-secp256k1-asmjs'

import { Client, CosmosClientParams } from './client'
import { defaultClientConfig } from './const'
import { TxParams } from './types'

export class ClientKeystore extends Client {
  constructor(params: CosmosClientParams = defaultClientConfig) {
    super(params)
  }
  /**
   * Asynchronous version of getAddress method.
   * @param {number} index Derivation path index of the address to be generated.
   * @returns {string} A promise that resolves to the generated address.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Get the address derived from the provided phrase.
   * @param {number | undefined} walletIndex The index of the address derivation path. Default is 0.
   * @returns {string} The user address at the specified walletIndex.
   */
  public getAddress(walletIndex?: number | undefined): string {
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

    const tx = await this.roundRobinSignAndBroadcast(sender, unsignedTx, signer)

    return tx.transactionHash
  }

  /**
   * Hashes a buffer using SHA256 followed by RIPEMD160 or RMD160.
   * @param {Uint8Array} buffer The buffer to hash
   * @returns {Uint8Array} The hashed buffer
   */
  private hash160(buffer: Uint8Array): Buffer {
    const sha256Hash: Buffer = createHash('sha256').update(buffer).digest()
    try {
      return createHash('rmd160').update(sha256Hash).digest()
    } catch (err) {
      return createHash('ripemd160').update(sha256Hash).digest()
    }
  }

  /**
   * Sign a transaction making a round robin over the clients urls provided to the client
   *
   * @param {string} sender Sender address
   * @param {DecodedTxRaw} unsignedTx Unsigned transaction
   * @param {DirectSecp256k1HdWallet} signer Signer
   * @returns {DeliverTxResponse} The transaction broadcasted
   */
  private async roundRobinSignAndBroadcast(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: DirectSecp256k1HdWallet,
  ): Promise<DeliverTxResponse> {
    for (const url of this.clientUrls[this.network]) {
      try {
        const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
          registry: this.registry,
        })

        const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
          return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
        })

        const tx = await signingClient.signAndBroadcast(
          sender,
          messages,
          this.getStandardFee(this.getAssetInfo().asset),
          unsignedTx.body.memo,
        )

        return tx
      } catch {}
    }

    throw Error('No clients available. Can not sign and broadcast transaction')
  }
}
