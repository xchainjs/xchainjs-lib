import { StdFee } from '@cosmjs/amino'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  DecodedTxRaw,
  DirectSecp256k1HdWallet,
  EncodeObject,
  TxBodyEncodeObject,
  decodeTxRaw,
} from '@cosmjs/proto-signing'
import { DeliverTxResponse, GasPrice, SigningStargateClient, calculateFee } from '@cosmjs/stargate'
import { AssetInfo, PreparedTx } from '@xchainjs/xchain-client'
import { Client as CosmosSdkClient, CosmosSdkClientParams, MsgTypes, makeClientPath } from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address, AssetType, eqAsset } from '@xchainjs/xchain-util'
import { bech32 } from '@scure/base'
import { HDKey } from '@scure/bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { createHash } from 'crypto'
import * as secp from '@bitcoin-js/tiny-secp256k1-asmjs'

import { AssetKUJI, AssetUSK, KUJI_DECIMAL, MSG_SEND_TYPE_URL, USK_ASSET_DENOM, USK_DECIMAL } from './const'
import { CompatibleAsset, TxParams } from './types'
import { defaultClientConfig, getDefaultExplorers } from './utils'

export type KujiraClientParams = Partial<CosmosSdkClientParams>
/**
 * Represents a client for interacting with the Kujira blockchain network.
 * Inherits from the CosmosSdkClient class.
 */
export class Client extends CosmosSdkClient {
  /**
   * Constructs a new instance of the Kujira client.
   * @param {KujiraClientParams} config The client configuration parameters.
   */
  constructor(config: KujiraClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
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
    const node = HDKey.fromMasterSeed(seed)
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
   * Retrieves the address prefix used by the Kujira network.
   * @param {Network} network The network of which return the prefix
   * @returns the address prefix
   */
  protected getPrefix(): string {
    return 'kujira'
  }
  /**
   * Retrieves information about the assets used in the Kujira network.
   * @returns {AssetInfo} Information about the asset.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetKUJI,
      decimal: KUJI_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Retrieves the number of decimals for a given asset.
   * @param {CompatibleAsset} asset The asset for which to retrieve the number of decimals.
   * @returns {number} The number of decimals.
   */
  public getAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, AssetKUJI)) return KUJI_DECIMAL
    if (eqAsset(asset, AssetUSK)) return USK_DECIMAL
    return this.defaultDecimals
  }
  /**
   * Retrieves the denomination of the given asset.
   * @param {CompatibleAsset} asset The asset for which to retrieve the denomination.
   * @returns {string | null} The denomination, or null if not found.
   */
  getDenom(asset: CompatibleAsset): string | null {
    if (eqAsset(asset, AssetKUJI)) return this.baseDenom
    if (eqAsset(asset, AssetUSK)) return USK_ASSET_DENOM
    return null
  }
  /**
   * Retrieves the asset from the given denomination.
   * @param {string} denom The denomination to retrieve the asset for.
   * @returns {CompatibleAsset | null} The corresponding asset, or null if not found.
   */
  assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === this.baseDenom) return AssetKUJI
    if (denom === USK_ASSET_DENOM) return AssetUSK
    return {
      chain: AssetKUJI.chain,
      symbol: denom,
      ticker: '',
      type: AssetType.TOKEN,
    }
  }
  /**
   * Retrieves the URL of the blockchain explorer for the current network.
   * @returns {string} The explorer URL.
   */
  getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }
  /**
   * Constructs the URL for viewing the address on the blockchain explorer.
   * @param {Address} address The address to view.
   * @returns {string} The explorer address URL.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }
  /**
   * Constructs the URL for viewing the transaction on the blockchain explorer.
   * @param {string} txID The transaction ID to view.
   * @returns {string} The explorer transaction URL.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * Prepares a transaction for transfer.
   * @param {TxParams & { sender: Address }} params The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   * @throws {Error} Thrown if sender or recipient address is invalid or if the asset is invalid.
   */
  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')

    const denom = this.getDenom(asset || this.getAssetInfo().asset)
    if (!denom)
      throw Error(`Invalid asset ${asset?.symbol} - Only ${this.baseDenom} asset is currently supported to transfer`)

    const demonAmount = { amount: amount.amount().toString(), denom }

    const txBody: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [
          {
            typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER),
            value: {
              fromAddress: sender,
              toAddress: recipient,
              amount: [demonAmount],
            },
          },
        ],
        memo: memo,
      },
    }

    const rawTx = TxRaw.fromPartial({
      bodyBytes: this.registry.encode(txBody),
    })
    return { rawUnsignedTx: toBase64(TxRaw.encode(rawTx).finish()) }
  }

  /**
   * Retrieves the message type URL by message type for cosmos-sdk client actions.
   * @param {MsgTypes} msgType The message type.
   * @returns {string} The type URL of the message.
   */
  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  /**
   * Retrieves the standard fee used by the client for a given asset.
   * @param {CompatibleAsset} asset The asset to retrieve the fee for.
   * @returns {StdFee} The standard fee.
   */
  protected getStandardFee(asset: CompatibleAsset): StdFee {
    const denom = this.getDenom(asset)
    const defaultGasPrice = GasPrice.fromString(`0.025${denom}`)
    return calculateFee(90_000, defaultGasPrice)
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
   * Sign and broadcast a transaction making a round robin over the clients urls provided to the client
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
