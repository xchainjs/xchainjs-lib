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
import { AssetInfo, FeeType, Fees, PreparedTx, singleFee } from '@xchainjs/xchain-client'
import {
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  makeClientPath,
  roundRobinTry,
} from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, AssetType, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'

import {
  AssetATOM,
  COSMOS_DECIMAL,
  DEFAULT_FEE,
  DEFAULT_GAS_LIMIT,
  GAIAChain,
  MSG_SEND_TYPE_URL,
  defaultClientConfig,
} from './const'
import { CompatibleAsset, TxOfflineParams, TxParams } from './types'
import { getDefaultExplorers, getDenom, getPrefix } from './utils'

export type CosmosClientParams = Partial<CosmosSdkClientParams>
export abstract class Client extends CosmosSDKClient {
  constructor(config: CosmosClientParams = defaultClientConfig) {
    super({ ...defaultClientConfig, ...config })
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetATOM,
      decimal: COSMOS_DECIMAL,
    }
  }
  public getAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, AssetATOM)) return COSMOS_DECIMAL
    return this.defaultDecimals
  }

  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  public getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/accounts/${address}`
  }

  public getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  public assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === this.getDenom(AssetATOM)) return AssetATOM
    if (denom.startsWith('ibc/'))
      // Note: Don't use `assetFromString` here, it will interpret `/` as synth
      return {
        chain: GAIAChain,
        symbol: denom,
        // TODO (xchain-contributors)
        // Get readable ticker for IBC assets from denom #600 https://github.com/xchainjs/xchainjs-lib/issues/600
        // At the meantime ticker will be empty
        ticker: '',
        type: AssetType.TOKEN,
      }
    return null
  }

  public getDenom(asset: CompatibleAsset): string | null {
    return getDenom(asset)
  }

  /**
   * Fetches fees from THORChain `inbound_addresses` when possible.
   * Otherwise returns default fees.
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
    } catch (_error) {
      return singleFee(FeeType.FlatFee, DEFAULT_FEE)
    }
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

  /** @deprecated Use prepareTx instead. */
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

    const rawTx = await this.roundRobinSign(sender, unsignedTx, signer, gasLimit)

    return toBase64(TxRaw.encode(rawTx).finish())
  }

  protected getPrefix(): string {
    return getPrefix()
  }

  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  protected getStandardFee(asset: Asset): StdFee {
    const denom = this.getDenom(asset)
    const defaultGasPrice = GasPrice.fromString(`0.006${denom}`)
    return calculateFee(150_000, defaultGasPrice)
  }

  private async roundRobinSign(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: DirectSecp256k1HdWallet,
    gasLimit: BigNumber,
  ): Promise<TxRaw> {
    return roundRobinTry(this.clientUrls[this.network], 'sign transaction', async (url) => {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })

      const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
        return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
      })

      return signingClient.sign(
        sender,
        messages,
        {
          amount: [],
          gas: gasLimit.toString(),
        },
        unsignedTx.body.memo,
      )
    })
  }
}
