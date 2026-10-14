import { StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { AssetInfo, Network, PreparedTx, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Client as CosmosSDKClient, CosmosSdkClientParams, MsgTypes, bech32ToBase64 } from '@xchainjs/xchain-cosmos-sdk'
import { Address, assetFromString, eqAsset } from '@xchainjs/xchain-util'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'

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

export interface ThorchainClient {
  deposit(params: DepositParam): Promise<TxHash>
  getDepositTransaction(txId: string): Promise<DepositTx>
  transferOffline(params: TxOfflineParams): Promise<string>
}

export type ThorchainClientParams = Partial<CosmosSdkClientParams>

export abstract class Client extends CosmosSDKClient implements ThorchainClient {
  constructor(config: ThorchainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  protected getPrefix(network: Network): string {
    return getPrefix(network)
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetRUNE,
      decimal: RUNE_DECIMAL,
    }
  }

  public getAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, AssetRUNE)) return RUNE_DECIMAL
    return this.defaultDecimals
  }
  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  public assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === RUNE_DENOM) return AssetRUNE
    if (denom === TCY_DENOM) return AssetTCY
    return assetFromString(denom.toUpperCase())
  }

  public getDenom(asset: CompatibleAsset): string | null {
    return getDenom(asset)
  }

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

    const rawTx = TxRaw.fromPartial({
      bodyBytes: this.registry.encode(txBody),
    })
    return { rawUnsignedTx: toBase64(TxRaw.encode(rawTx).finish()) }
  }

  /** @deprecated Use getTransactionData instead */
  public async getDepositTransaction(txId: string): Promise<DepositTx> {
    return this.getTransactionData(txId)
  }

  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  protected getStandardFee(): StdFee {
    return { amount: [], gas: '6000000' }
  }

  abstract deposit(params: DepositParam): Promise<string>
  abstract transferOffline(params: TxOfflineParams): Promise<string>
}
