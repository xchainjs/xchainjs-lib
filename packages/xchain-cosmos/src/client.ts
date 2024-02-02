import { StdFee } from '@cosmjs/amino'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  DecodedTxRaw,
  DirectSecp256k1HdWallet,
  EncodeObject,
  TxBodyEncodeObject,
  decodeTxRaw,
} from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient, calculateFee } from '@cosmjs/stargate'
import { AssetInfo, FeeType, Fees, PreparedTx, TxParams, singleFee } from '@xchainjs/xchain-client'
import { Client as CosmosSDKClient, CosmosSdkClientParams, MsgTypes, makeClientPath } from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import {
  ATOM_DENOM,
  AssetATOM,
  COSMOS_DECIMAL,
  DEFAULT_FEE,
  DEFAULT_GAS_LIMIT,
  GAIAChain,
  MSG_SEND_TYPE_URL,
  defaultClientConfig,
} from './const'
import { TxOfflineParams } from './types'
import { getDefaultExplorers } from './utils'

/**
 * Custom Cosmos client
 */
export type CosmosClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSDKClient {
  constructor(config: CosmosClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Get client native asset
   *
   * @returns {AssetInfo} Thorchain native asset
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetATOM,
      decimal: COSMOS_DECIMAL,
    }
  }

  public getAssetDecimals(asset: Asset): number {
    if (eqAsset(asset, AssetATOM)) return COSMOS_DECIMAL
    return this.defaultDecimals
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url.
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
  public getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/accounts/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  /**
   * Get Asset from denomination
   *
   * @param {string} denom
   * @returns {Asset|null} The asset of the given denomination.
   */
  public assetFromDenom(denom: string): Asset | null {
    if (denom === this.getDenom(AssetATOM)) return AssetATOM
    // IBC assets
    if (denom.startsWith('ibc/'))
      // Note: Don't use `assetFromString` here, it will interpret `/` as synth
      return {
        chain: GAIAChain,
        symbol: denom,
        // TODO (xchain-contributors)
        // Get readable ticker for IBC assets from denom #600 https://github.com/xchainjs/xchainjs-lib/issues/600
        // At the meantime ticker will be empty
        ticker: '',
        synth: false,
      }
    return null
  }

  /**
   * Get denomination from Asset
   *
   * @param {Asset} asset
   * @returns {string} The denomination of the given asset.
   */
  public getDenom(asset: Asset): string | null {
    if (eqAsset(asset, AssetATOM)) return ATOM_DENOM
    return null
  }

  /**
   * Returns fees.
   * It tries to get chain fees from THORChain `inbound_addresses` first
   * If it fails, it returns DEFAULT fees.
   *
   * @returns {Fees} Current fees
   */
  public async getFees(): Promise<Fees> {
    try {
      const feeRate = await this.getFeeRateFromThorchain()
      // convert decimal: 1e8 (THORChain) to 1e6 (COSMOS)
      // Similar to `fromCosmosToThorchain` in THORNode
      // @see https://gitlab.com/thorchain/thornode/-/blob/e787022028f662b3a7c594e4a65aca618caa359c/bifrost/pkg/chainclients/gaia/util.go#L86
      const decimalDiff = COSMOS_DECIMAL - 8 /* THORCHAIN_DECIMAL */
      const feeRate1e6 = feeRate * 10 ** decimalDiff
      const fee = baseAmount(feeRate1e6, COSMOS_DECIMAL)
      return singleFee(FeeType.FlatFee, fee)
    } catch (error) {
      return singleFee(FeeType.FlatFee, DEFAULT_FEE)
    }
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
   * Create and sign transaction without broadcasting it
   *
   * @deprecated Use prepare Tx instead
   */
  public async transferOffline({
    walletIndex = 0,
    recipient,
    asset,
    amount,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT),
  }: TxOfflineParams & { gasLimit?: BigNumber }): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex)
    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient: recipient,
      asset: asset,
      amount: amount,
      memo: memo,
    })

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex))],
    })

    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], signer, {
      registry: this.registry,
    })

    const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
      return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
    })

    const rawTx = await signingClient.sign(
      sender,
      messages,
      {
        amount: [],
        gas: gasLimit.toString(),
      },
      unsignedTx.body.memo,
    )

    return toBase64(TxRaw.encode(rawTx).finish())
  }

  /**
   * Get address prefix by network
   * @param {Network} network The network of which return the prefix
   * @returns the address prefix
   */
  protected getPrefix(): string {
    return 'cosmos'
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
    const defaultGasPrice = GasPrice.fromString(`0.006${denom}`)
    return calculateFee(90_000, defaultGasPrice)
  }
}
