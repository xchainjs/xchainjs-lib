import { StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { DirectSecp256k1HdWallet, TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'
import { AssetInfo, PreparedTx, TxHash, TxParams } from '@xchainjs/xchain-client'
import {
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  bech32ToBase64,
  makeClientPath,
} from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, assetFromString, assetToString, isSynthAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import {
  AssetRuneNative as AssetRUNE,
  DEPOSIT_GAS_LIMIT_VALUE,
  MSG_DEPOSIT_TYPE_URL,
  MSG_SEND_TYPE_URL,
  RUNE_DECIMAL,
  RUNE_DENOM,
  defaultClientConfig,
} from './const'
import { DepositParam } from './types'
import { getDefaultExplorers, getExplorerAddressUrl, getExplorerTxUrl, isAssetRune } from './utils'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  deposit(params: DepositParam): Promise<TxHash>
}

export type ThorchainClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSDKClient implements ThorchainClient {
  constructor(config: ThorchainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Get client native asset
   * @returns {AssetInfo} Thorchain native asset
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetRUNE,
      decimal: RUNE_DECIMAL,
    }
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
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  /**
   * Get Asset from denomination
   *
   * @param {string} denom
   * @returns {Asset|null} The asset of the given denomination.
   */
  public assetFromDenom(denom: string): Asset | null {
    if (denom === RUNE_DENOM) return AssetRUNE
    return assetFromString(denom.toUpperCase())
  }

  /**
   * Get denomination from Asset
   *
   * @param {Asset} asset
   * @returns {string} The denomination of the given asset.
   */
  public getDenom(asset: Asset): string | null {
    if (isAssetRune(asset)) return RUNE_DENOM
    if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
    return asset.symbol.toLowerCase()
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

  public async deposit({
    walletIndex = 0,
    asset = AssetRUNE,
    amount,
    memo,
    gasLimit = new BigNumber(DEPOSIT_GAS_LIMIT_VALUE),
  }: DepositParam): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex)

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex || 0))],
    })

    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], signer, {
      registry: this.registry,
    })

    const tx = await signingClient.signAndBroadcast(
      sender,
      [
        {
          typeUrl: MSG_DEPOSIT_TYPE_URL,
          value: {
            signer: bech32ToBase64(sender),
            memo,
            coins: [
              {
                amount: amount.amount().toString(),
                asset,
              },
            ],
          },
        },
      ],
      {
        amount: [],
        gas: gasLimit.toString(),
      },
      memo,
    )

    return tx.transactionHash
  }

  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    return {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }[msgType]
  }

  protected getStandardFee(): StdFee {
    return { amount: [], gas: '6000000' }
  }
}
