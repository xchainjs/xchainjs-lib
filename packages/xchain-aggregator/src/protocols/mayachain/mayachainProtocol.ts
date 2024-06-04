import { AssetCacao, MAYAChain } from '@xchainjs/xchain-mayachain'
import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Asset, Chain, assetFromStringEx, eqAsset } from '@xchainjs/xchain-util'

import {
  IProtocol,
  ProtocolConfig,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistory,
  SwapHistoryParams,
  TxSubmitted,
} from '../../types'

export class MayachainProtocol implements IProtocol {
  public readonly name = 'Mayachain'
  private mayachainQuery: MayachainQuery
  private mayachainAmm: MayachainAMM
  private configuration: Omit<ProtocolConfig, 'wallet'> | undefined

  constructor(configuration?: ProtocolConfig) {
    this.mayachainQuery = new MayachainQuery()
    this.mayachainAmm = new MayachainAMM(this.mayachainQuery, configuration?.wallet)
    this.configuration = configuration
  }

  /**
   * Check if an asset is supported in the protocol
   * @param {Asset} asset Asset to check if it is supported
   * @returns {boolean} True if the asset is supported, otherwise false
   */
  public async isAssetSupported(asset: Asset): Promise<boolean> {
    if (eqAsset(asset, AssetCacao)) return true
    const pools = await this.mayachainQuery.getPools()
    return (
      pools.findIndex((pool) => pool.status === 'available' && eqAsset(asset, assetFromStringEx(pool.asset))) !== -1
    )
  }

  /**
   * Retrieve the supported chains by the protocol
   * @returns {Chain[]} the supported chains by the protocol
   */
  public async getSupportedChains(): Promise<Chain[]> {
    const inboundDetails = await this.mayachainQuery.getInboundDetails()
    return [MAYAChain, ...Object.values(inboundDetails).map((inboundAddress) => inboundAddress.chain)]
  }

  /**
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimatedSwap = await this.mayachainAmm.estimateSwap({
      ...params,
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
      totalSwapSeconds: estimatedSwap.inboundConfirmationSeconds || 0 + estimatedSwap.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.slipBasisPoints,
      canSwap: estimatedSwap.canSwap,
      errors: estimatedSwap.errors,
      warning: estimatedSwap.warning,
    }
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.mayachainAmm.doSwap(params)
  }

  /**
   * Get historical swaps
   * @param {Address[]} addresses Addresses of which return their swap history
   * @returns the swap history
   */
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
