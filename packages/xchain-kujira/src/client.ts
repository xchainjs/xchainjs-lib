import { StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { GasPrice, calculateFee } from '@cosmjs/stargate'
import { AssetInfo, PreparedTx, TxParams } from '@xchainjs/xchain-client'
import { Client as CosmosSdkClient, CosmosSdkClientParams, MsgTypes } from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, eqAsset } from '@xchainjs/xchain-util'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { AssetKUJI, KUJI_DECIMAL } from './const'
import { defaultClientConfig, getDefaultExplorers } from './utils'

export type KujiraClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSdkClient {
  constructor(config: KujiraClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
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
    return null
  }

  assetFromDenom(denom: string): Asset | null {
    if (denom === this.baseDenom) return AssetKUJI
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

  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    return {
      [MsgTypes.TRANSFER]: '/cosmos.bank.v1beta1.MsgSend',
    }[msgType]
  }

  protected getStandardFee(asset: Asset): StdFee {
    const denom = this.getDenom(asset)
    const defaultGasPrice = GasPrice.fromString(`0.025${denom}`)
    return calculateFee(90_000, defaultGasPrice)
  }
}
