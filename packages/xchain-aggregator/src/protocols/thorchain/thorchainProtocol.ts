import { Network } from '@xchainjs/xchain-client'
import { AssetRuneNative, THORChain } from '@xchainjs/xchain-thorchain'
import { ApproveParams, IsApprovedParams, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import {
  AnyAsset,
  Chain,
  assetToString,
  eqAsset,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import {
  IProtocol,
  ProtocolConfig,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistory,
  SwapHistoryParams,
  TxSubmitted,
} from '../../types'

import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'

export class ThorchainProtocol implements IProtocol {
  public readonly name = 'Thorchain'
  private thorchainQuery: ThorchainQuery
  private thorchainAmm: ThorchainAMM
  private configuration: ProtocolConfig | undefined
  private wallet?: Wallet

  constructor(configuration?: ProtocolConfig) {
    const network = configuration?.network || configuration?.wallet?.getNetwork() || Network.Mainnet

    // Custom Thornode/Midgard configs are optional; clients otherwise use per-network default endpoints.
    const midgardCache = new MidgardCache(new Midgard(network, configuration?.midgardConfig))
    const thorchainCache = new ThorchainCache(
      new Thornode(network, configuration?.thornodeConfig),
      new MidgardQuery(midgardCache),
    )
    this.thorchainQuery = new ThorchainQuery(thorchainCache)
    this.thorchainAmm = new ThorchainAMM(this.thorchainQuery, configuration?.wallet)
    this.configuration = configuration
    this.wallet = configuration?.wallet
  }

  async approveRouterToSpend(params: ApproveParams): Promise<TxSubmitted> {
    const { asset, amount } = params
    const txSubmitted = await this.thorchainAmm.approveRouterToSpend({ asset, amount })
    await this.wallet?.awaitTxConfirmed(asset.chain, txSubmitted.hash)
    return txSubmitted
  }

  async shouldBeApproved(params: IsApprovedParams): Promise<boolean> {
    const { asset, amount, address } = params
    const errors = await this.thorchainAmm.isRouterApprovedToSpend({ asset, amount, address })
    return errors.some((error) => error === 'Thorchain router has not been approved to spend this amount')
  }

  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (eqAsset(asset, AssetRuneNative) || isTradeAsset(asset) || isSynthAsset(asset) || isSecuredAsset(asset))
      return true

    try {
      const pools = await this.thorchainQuery.thorchainCache.getPools()
      return (
        Object.values(pools).findIndex((pool) => pool.isAvailable() && assetToString(asset) === pool.assetString) !== -1
      )
    } catch (error) {
      // Optimistic fallback: if Midgard is down, assume asset is supported
      // This allows quoting to continue - if the asset isn't actually supported,
      // the quote estimation will fail gracefully with appropriate error messages
      console.warn(
        `Midgard unavailable for asset validation, optimistically assuming ${assetToString(asset)} is supported:`,
        error,
      )
      return true
    }
  }

  public async getSupportedChains(): Promise<Chain[]> {
    const inboundDetails = await this.thorchainQuery.thorchainCache.getInboundDetails()
    return [THORChain, ...Object.values(inboundDetails).map((inboundAddress) => inboundAddress.chain)]
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimatedSwap = await this.thorchainAmm.estimateSwap({
      ...params,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
    return {
      protocol: this.name,
      toAddress: estimatedSwap.toAddress,
      memo: estimatedSwap.memo,
      expectedAmount: estimatedSwap.txEstimate.netOutput,
      dustThreshold: estimatedSwap.dustThreshold,
      fees: estimatedSwap.txEstimate.totalFees,
      totalSwapSeconds:
        (estimatedSwap.txEstimate.inboundConfirmationSeconds || 0) + estimatedSwap.txEstimate.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.txEstimate.slipBasisPoints,
      maxStreamingQuantity: estimatedSwap.txEstimate.maxStreamingQuantity,
      canSwap: estimatedSwap.txEstimate.canSwap,
      errors: estimatedSwap.txEstimate.errors,
      warning: estimatedSwap.txEstimate.warning,
    }
  }

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.thorchainAmm.doSwap({
      ...params,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
  }

  public async getSwapHistory({ chainAddresses }: SwapHistoryParams): Promise<SwapHistory> {
    const swapHistory = await this.thorchainQuery.getSwapHistory({
      addresses: Array.from(new Set(chainAddresses.map((chainAddresses) => chainAddresses.address))),
    })
    return {
      count: swapHistory.count,
      swaps: swapHistory.swaps.map((swap) => {
        return { protocol: this.name, ...swap }
      }),
    }
  }
}
