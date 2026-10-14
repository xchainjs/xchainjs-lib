import { Network } from '@xchainjs/xchain-client'
import { AssetCacao, MAYAChain } from '@xchainjs/xchain-mayachain'
import { ApproveParams, IsApprovedParams, MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainCache, MayachainQuery, Mayanode } from '@xchainjs/xchain-mayachain-query'
import { MidgardCache, MidgardQuery, MidgardApi } from '@xchainjs/xchain-mayamidgard-query'
import {
  AnyAsset,
  Chain,
  CryptoAmount,
  assetFromStringEx,
  eqAsset,
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

import { CompatibleAsset } from './types'

export class MayachainProtocol implements IProtocol {
  public readonly name = 'Mayachain'
  private mayachainQuery: MayachainQuery
  private mayachainAmm: MayachainAMM
  private configuration: ProtocolConfig | undefined
  private wallet?: Wallet

  constructor(configuration?: ProtocolConfig) {
    const network = configuration?.network || configuration?.wallet?.getNetwork() || Network.Mainnet

    // Custom Mayanode/Midgard configs are optional; clients otherwise use per-network default endpoints.
    const midgardCache = new MidgardCache(new MidgardApi(network, configuration?.mayaMidgardConfig))
    const mayachainCache = new MayachainCache(
      new MidgardQuery(midgardCache),
      new Mayanode(network, configuration?.mayanodeConfig),
    )
    this.mayachainQuery = new MayachainQuery(mayachainCache)
    this.mayachainAmm = new MayachainAMM(this.mayachainQuery, configuration?.wallet)
    this.configuration = configuration
    this.wallet = configuration?.wallet
  }
  async approveRouterToSpend(params: ApproveParams): Promise<TxSubmitted> {
    const { asset, amount } = params
    const txSubmitted = await this.mayachainAmm.approveRouterToSpend({ asset, amount })
    await this.wallet?.awaitTxConfirmed(asset.chain, txSubmitted.hash)
    return txSubmitted
  }

  async shouldBeApproved(params: IsApprovedParams): Promise<boolean> {
    const { asset, amount, address } = params
    const errors = await this.mayachainAmm.isRouterApprovedToSpend({ asset, amount, address })
    return errors.some((error) => error === 'Maya router has not been approved to spend this amount')
  }

  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (isTradeAsset(asset)) return false
    if (eqAsset(asset, AssetCacao) || isSynthAsset(asset)) return true

    try {
      const pools = await this.mayachainQuery.getPools()
      return (
        pools.findIndex((pool) => pool.status === 'available' && eqAsset(asset, assetFromStringEx(pool.asset))) !== -1
      )
    } catch (error) {
      // Optimistic fallback: if Mayamidgard is down, assume asset is supported
      // This allows quoting to continue - if the asset isn't actually supported,
      // the quote estimation will fail gracefully with appropriate error messages
      console.warn(
        `Mayamidgard unavailable for asset validation, optimistically assuming ${asset.chain}.${asset.symbol} is supported:`,
        error,
      )
      return true
    }
  }

  public async getSupportedChains(): Promise<Chain[]> {
    const inboundDetails = await this.mayachainQuery.getInboundDetails()
    return [MAYAChain, ...Object.values(inboundDetails).map((inboundAddress) => inboundAddress.chain)]
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimatedSwap = await this.mayachainAmm.estimateSwap({
      ...params,
      fromAsset: params.fromAsset as CompatibleAsset,
      destinationAsset: params.destinationAsset as CompatibleAsset,
      amount: params.amount as CryptoAmount<CompatibleAsset>,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
    return {
      protocol: this.name,
      toAddress: estimatedSwap.toAddress,
      memo: estimatedSwap.memo,
      expectedAmount: estimatedSwap.expectedAmount,
      dustThreshold: estimatedSwap.dustThreshold,
      fees: estimatedSwap.fees,
      totalSwapSeconds: (estimatedSwap.inboundConfirmationSeconds || 0) + estimatedSwap.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.slipBasisPoints,
      maxStreamingQuantity: estimatedSwap.maxStreamingQuantity,
      canSwap: estimatedSwap.canSwap,
      errors: estimatedSwap.errors,
      warning: estimatedSwap.warning,
    }
  }

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.mayachainAmm.doSwap({
      ...params,
      fromAsset: params.fromAsset as CompatibleAsset,
      destinationAsset: params.destinationAsset as CompatibleAsset,
      amount: params.amount as CryptoAmount<CompatibleAsset>,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
  }

  public async getSwapHistory({ chainAddresses }: SwapHistoryParams): Promise<SwapHistory> {
    const swapHistory = await this.mayachainQuery.getSwapHistory({
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
