import { StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { GasPrice, calculateFee } from '@cosmjs/stargate'
import { AssetInfo, PreparedTx, TxParams } from '@xchainjs/xchain-client'
import { Client as CosmosSdkClient, CosmosSdkClientParams, MsgTypes } from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, eqAsset } from '@xchainjs/xchain-util'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { AssetKUJI, AssetUSK, KUJI_DECIMAL, MSG_SEND_TYPE_URL, USK_ASSET_DENOM, USK_DECIMAL } from './const'
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
   * @param {Asset} asset The asset for which to retrieve the number of decimals.
   * @returns {number} The number of decimals.
   */
  public getAssetDecimals(asset: Asset): number {
    if (eqAsset(asset, AssetKUJI)) return KUJI_DECIMAL
    if (eqAsset(asset, AssetUSK)) return USK_DECIMAL
    return this.defaultDecimals
  }
  /**
   * Retrieves the denomination of the given asset.
   * @param {Asset} asset The asset for which to retrieve the denomination.
   * @returns {string | null} The denomination, or null if not found.
   */
  getDenom(asset: Asset): string | null {
    if (eqAsset(asset, AssetKUJI)) return this.baseDenom
    if (eqAsset(asset, AssetUSK)) return USK_ASSET_DENOM
    return null
  }
  /**
   * Retrieves the asset from the given denomination.
   * @param {string} denom The denomination to retrieve the asset for.
   * @returns {Asset | null} The corresponding asset, or null if not found.
   */
  assetFromDenom(denom: string): Asset | null {
    if (denom === this.baseDenom) return AssetKUJI
    if (denom === USK_ASSET_DENOM) return AssetUSK
    return {
      chain: AssetKUJI.chain,
      symbol: denom,
      ticker: '',
      synth: false,
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
   * @param {Asset} asset The asset to retrieve the fee for.
   * @returns {StdFee} The standard fee.
   */
  protected getStandardFee(asset: Asset): StdFee {
    const denom = this.getDenom(asset)
    const defaultGasPrice = GasPrice.fromString(`0.025${denom}`)
    return calculateFee(90_000, defaultGasPrice)
  }
}
