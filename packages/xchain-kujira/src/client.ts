import { StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { GasPrice, calculateFee } from '@cosmjs/stargate'
import { AssetInfo, PreparedTx, TxParams } from '@xchainjs/xchain-client'
import { Client as CosmosSdkClient, CosmosSdkClientParams, MsgTypes } from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, eqAsset } from '@xchainjs/xchain-util'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { AssetKUJI, AssetUSK, KUJI_DECIMAL, MSG_SEND_TYPE_URL, USK_ASSET_DENOM } from './const'
import { defaultClientConfig, getDefaultExplorers } from './utils'

export type KujiraClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSdkClient {
  constructor(config: KujiraClientParams = defaultClientConfig) {
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
  protected getNetworkPrefix(): string {
    return 'kujira'
  }

  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetKUJI,
      decimal: KUJI_DECIMAL,
    }
    return assetInfo
  }

  getDenom(asset: Asset): string | null {
    if (eqAsset(asset, AssetKUJI)) return this.baseDenom
    if (eqAsset(asset, AssetUSK)) return USK_ASSET_DENOM
    return null
  }

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

  getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * Prepare transfer.
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
   * Get the message type url by type used by the cosmos-sdk client to make certain actions
   * @param msgType
   * @returns {string} the type url of the message
   */
  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  /**
   * Returns the standard fee used by the client for an asset
   * @param {Asset} asset the asset to retrieve the fee of
   * @returns {StdFee} the standard fee
   */
  protected getStandardFee(asset: Asset): StdFee {
    const denom = this.getDenom(asset)
    const defaultGasPrice = GasPrice.fromString(`0.025${denom}`)
    return calculateFee(90_000, defaultGasPrice)
  }
}
