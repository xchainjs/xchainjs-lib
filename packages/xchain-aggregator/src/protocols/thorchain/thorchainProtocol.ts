import { AssetRuneNative, THORChain } from '@xchainjs/xchain-thorchain'
import { ApproveParams, IsApprovedParams, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { AnyAsset, Chain, assetToString, eqAsset, isSynthAsset, isTradeAsset } from '@xchainjs/xchain-util'
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

export class ThorchainProtocol implements IProtocol {
  public readonly name = 'Thorchain'
  private thorchainQuery: ThorchainQuery
  private thorchainAmm: ThorchainAMM
  private configuration: ProtocolConfig | undefined
  private wallet?: Wallet

  constructor(configuration?: ProtocolConfig) {
    this.thorchainQuery = new ThorchainQuery()
    this.thorchainAmm = new ThorchainAMM(this.thorchainQuery, configuration?.wallet)
    this.configuration = configuration
    this.wallet = configuration?.wallet
  }

  /**
   * Aprove tx for ERC-20
   * @param {ApproveParams} approveParams params to approve tx
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  async approveRouterToSpend(params: ApproveParams): Promise<TxSubmitted> {
    const { asset, amount } = params
    const txSubmitted = await this.thorchainAmm.approveRouterToSpend({ asset, amount })
    await this.wallet?.awaitForTXConfirmed(asset.chain, txSubmitted.hash)
    return txSubmitted
  }

  /**
   * Check if tx should be approved for ERC-20
   * @param {IsApprovedParams} isApprovedParams params to check if tx is approved
   * @returns {boolean} array of errors
   */
  async shouldBeApproved(params: IsApprovedParams): Promise<boolean> {
    const { asset, amount, address } = params
    const errors = await this.thorchainAmm.isRouterApprovedToSpend({ asset, amount, address })
    return errors.some((error) => error === 'Thorchain router has not been approved to spend this amount')
  }

  /**
   * Check if an asset is supported in the protocol
   * @param {Asset} asset Asset to check if it is supported
   * @returns {boolean} True if the asset is supported, otherwise false
   */
  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (eqAsset(asset, AssetRuneNative) || isTradeAsset(asset) || isSynthAsset(asset)) return true
    const pools = await this.thorchainQuery.thorchainCache.getPools()
    return (
      Object.values(pools).findIndex((pool) => pool.isAvailable() && assetToString(asset) === pool.assetString) !== -1
    )
  }

  /**
   * Retrieve the supported chains by the protocol
   * @returns {Chain[]} the supported chains by the protocol
   */
  public async getSupportedChains(): Promise<Chain[]> {
    const inboundDetails = await this.thorchainQuery.thorchainCache.getInboundDetails()
    return [THORChain, ...Object.values(inboundDetails).map((inboundAddress) => inboundAddress.chain)]
  }

  /**
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
   */
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
        estimatedSwap.txEstimate.inboundConfirmationSeconds || 0 + estimatedSwap.txEstimate.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.txEstimate.slipBasisPoints,
      canSwap: estimatedSwap.txEstimate.canSwap,
      errors: estimatedSwap.txEstimate.errors,
      warning: estimatedSwap.txEstimate.warning,
    }
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.thorchainAmm.doSwap({
      ...params,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
  }

  /**x
   * Get historical swaps
   * @param {Address[]} addresses Addresses of which return their swap history
   * @returns the swap history
   */
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
