/**
 * Import necessary modules and types for the Thorchain client.
 */
import { StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { AssetInfo, Network, PreparedTx, TxHash, TxParams } from '@xchainjs/xchain-client'
import {
  // Import client-related types and functions from @xchainjs/xchain-cosmos-sdk for Cosmos SDK client configuration.
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  bech32ToBase64,
} from '@xchainjs/xchain-cosmos-sdk'
import { Address, assetFromString, eqAsset } from '@xchainjs/xchain-util'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

/**
 * Import constants and types
 */
import {
  AssetRuneNative as AssetRUNE,
  AssetTCY,
  MSG_SEND_TYPE_URL,
  RUNE_DECIMAL,
  RUNE_DENOM,
  TCY_DENOM,
  defaultClientConfig,
} from './const'
import { CompatibleAsset, DepositParam, DepositTx, TxOfflineParams } from './types'
import { getDefaultExplorers, getDenom, getExplorerAddressUrl, getExplorerTxUrl, getPrefix } from './utils'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  deposit(params: DepositParam): Promise<TxHash>
  getDepositTransaction(txId: string): Promise<DepositTx>
  transferOffline(params: TxOfflineParams): Promise<string>
}

/**
 * Thorchain client params to instantiate the Thorchain client
 */
export type ThorchainClientParams = Partial<CosmosSdkClientParams>

/**
 * Thorchain base client
 */
export abstract class Client extends CosmosSDKClient implements ThorchainClient {
  /**
   * Thorchain client constructor
   *
   * @param {ThorchainClientParams} config Optional - Client configuration. If it is not set, default values will be used
   */
  constructor(config: ThorchainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Get address prefix by network
   * @param {Network} network The network of which return the prefix
   * @returns the address prefix
   */
  protected getPrefix(network: Network): string {
    return getPrefix(network)
  }

  /**
   * Get client native asset
   *
   * @returns {AssetInfo} Thorchain native asset
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetRUNE,
      decimal: RUNE_DECIMAL,
    }
  }

  /**
   * Returns the number of the decimals of known assets
   *
   * @param {CompatibleAsset} asset - Asset of which return the number of decimals
   * @returns {number} the number of decimals of the assets
   */
  public getAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, AssetRUNE)) return RUNE_DECIMAL
    return this.defaultDecimals
  }
  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for thorchain based on the current network.
   */
  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address The address for which to get the explorer URL.
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction ID for which to get the explorer URL.
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  /**
   * Get Asset from denomination
   *
   * @param {string} denom The denomination for which to get the asset.
   * @returns {CompatibleAsset|null} The asset of the given denomination.
   */
  public assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === RUNE_DENOM) return AssetRUNE
    if (denom === TCY_DENOM) return AssetTCY
    return assetFromString(denom.toUpperCase())
  }

  /**
   * Get denomination from Asset
   *
   * @param {CompatibleAsset} asset The asset for which to get the denomination.
   * @returns {string} The denomination of the given asset.
   */
  public getDenom(asset: CompatibleAsset): string | null {
    return getDenom(asset)
  }

  /**
   * Prepare transfer transaction.
   *
   * @param {TxParams&Address} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    // Validate sender and recipient addresses
    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')
    // Get denomination of the asset
    const denom = this.getDenom(asset || this.getAssetInfo().asset)
    if (!denom)
      throw Error(`Invalid asset ${asset?.symbol} - Only ${this.baseDenom} asset is currently supported to transfer`)

    // Prepare transaction body
    const demonAmount = { amount: amount.amount().toString(), denom }
    const txBody: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [
          {
            typeUrl: MSG_SEND_TYPE_URL,
            value: {
              fromAddress: bech32ToBase64(sender),
              toAddress: bech32ToBase64(recipient),
              amount: [demonAmount],
            },
          },
        ],
        memo: memo,
      },
    }

    // Encode transaction body
    const rawTx = TxRaw.fromPartial({
      bodyBytes: this.registry.encode(txBody),
    })
    // Return raw unsigned transaction
    return { rawUnsignedTx: toBase64(TxRaw.encode(rawTx).finish()) }
  }

  /**
   * Get deposit transaction
   *
   * @deprecated Use getTransactionData instead
   * @param {string} txId The transaction ID for which to get the deposit transaction
   */
  public async getDepositTransaction(txId: string): Promise<DepositTx> {
    return this.getTransactionData(txId)
  }

  /**
   * Get the message type url by type used by the cosmos-sdk client to make certain actions
   *
   * @param {MsgTypes} msgType The message type of which return the type url
   * @returns {string} the type url of the message
   */
  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  /**
   * Returns the standard fee used by the client
   *
   * @returns {StdFee} the standard fee
   */
  protected getStandardFee(): StdFee {
    return { amount: [], gas: '6000000' }
  }

  abstract deposit(params: DepositParam): Promise<string>
  abstract transferOffline(params: TxOfflineParams): Promise<string>
}
