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
  AssetATOM,
  COSMOS_DECIMAL,
  DEFAULT_FEE,
  DEFAULT_GAS_LIMIT,
  GAIAChain,
  MSG_SEND_TYPE_URL,
  defaultClientConfig,
} from './const'
import { TxOfflineParams } from './types'
import { getDefaultExplorers, getDenom, getPrefix } from './utils'

/**
 * Partial parameters for the Cosmos client.
 */
export type CosmosClientParams = Partial<CosmosSdkClientParams>
/**
 * Cosmos client class extending the Cosmos SDK client.
 */
export class Client extends CosmosSDKClient {
  /**
   * Constructor for the Cosmos client.
   * @param {CosmosClientParams} config Configuration parameters for the client.
   */
  constructor(config: CosmosClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Get information about the client's native asset.
   * @returns {AssetInfo} Information about the native asset.
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetATOM,
      decimal: COSMOS_DECIMAL,
    }
  }
  /**
 * Get the number of decimals for a given asset.
 * @param {Asset} asset The asset to get the decimals for.
 * @returns {number} The number of decimals.
 */
  public getAssetDecimals(asset: Asset): number {
    if (eqAsset(asset, AssetATOM)) return COSMOS_DECIMAL
    return this.defaultDecimals
  }

  /**
   * Get the explorer URL.
   * @returns {string} The explorer URL.
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
   * Get the asset from a given denomination.
   * @param {string} denom The denomination to convert.
   * @returns {Asset | null} The asset corresponding to the given denomination.
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
   * Get the denomination from a given asset.
   * @param {Asset} asset The asset to get the denomination for.
   * @returns {string | null} The denomination of the given asset.
   */
  public getDenom(asset: Asset): string | null {
    return getDenom(asset)
  }

  /**
   * Get the current fees.
   * If possible, fetches the fees from THORChain's `inbound_addresses`.
   * Otherwise, returns default fees.
   * @returns {Fees} The current fees.
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
 * Prepare a transaction for signing.
 * @param {TxParams & { sender: Address }} params Transaction parameters including sender address.
 * @returns {PreparedTx} The prepared transaction.
 * @throws {"Invalid sender address"} Thrown if the sender address is invalid.
 * @throws {"Invalid recipient address"} Thrown if the recipient address is invalid.
 * @throws {"Invalid asset"} Thrown if the asset is invalid or not supported.
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
 * Creates and signs a transaction without broadcasting it.
 * @deprecated Use prepareTx instead.
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
   * Get the address prefix based on the network.
   * @param {Network} network The network of which return the prefix
   * @returns the address prefix
   */
  protected getPrefix(): string {
    return getPrefix()
  }

  /**
 * Get the message type URL by message type.
 * @param {MsgTypes} msgType The message type.
 * @returns {string} The message type URL.
 */
  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  /**
 * Returns the standard fee used by the client for an asset.
 * @param {Asset} asset The asset to retrieve the fee for.
 * @returns {StdFee} The standard fee.
 */
  protected getStandardFee(asset: Asset): StdFee {
    const denom = this.getDenom(asset)
    const defaultGasPrice = GasPrice.fromString(`0.006${denom}`)
    return calculateFee(90_000, defaultGasPrice)
  }
}
