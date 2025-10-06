import { Network } from '@xchainjs/xchain-client'
import { AssetCacao, MAYAChain } from '@xchainjs/xchain-mayachain'
import { ApproveParams, IsApprovedParams, MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainCache, MayachainQuery, Mayanode } from '@xchainjs/xchain-mayachain-query'
import { MidgardCache, MidgardQuery, MidgardApi } from '@xchainjs/xchain-mayamidgard-query'
import {
  AnyAsset,
  CachedValue,
  Chain,
  CryptoAmount,
  assetFromStringEx,
  assetToString,
  eqAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

// Cache supported assets for 10 minutes - they change less frequently than pools
const SUPPORTED_ASSETS_CACHE_TTL = 10 * 60 * 1000

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
  private supportedAssetsCache: CachedValue<Set<string>>

  constructor(configuration?: ProtocolConfig) {
    // Use network from configuration, fallback to wallet network, or default to mainnet
    const network = configuration?.network || configuration?.wallet?.getNetwork() || Network.Mainnet

    // Create MayachainQuery with proper network configuration and fast mode for better performance
    // TODO: Fix MidgardQuery constructor to accept network parameter
    const midgardCache = new MidgardCache(new MidgardApi(network))
    const mayachainCache = new MayachainCache(new MidgardQuery(midgardCache), new Mayanode(network))
    this.mayachainQuery = new MayachainQuery(mayachainCache, true) // Enable fast mode
    this.mayachainAmm = new MayachainAMM(this.mayachainQuery, configuration?.wallet)
    this.configuration = configuration
    this.wallet = configuration?.wallet

    // Initialize supported assets cache
    this.supportedAssetsCache = new CachedValue<Set<string>>(
      () => this.buildSupportedAssetsCache(),
      SUPPORTED_ASSETS_CACHE_TTL,
    )
  }
  /**
   * Aprove tx for ERC-20
   * @param {ApproveParams} approveParams params to approve tx
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  async approveRouterToSpend(params: ApproveParams): Promise<TxSubmitted> {
    const { asset, amount } = params
    const txSubmitted = await this.mayachainAmm.approveRouterToSpend({ asset, amount })
    await this.wallet?.awaitTxConfirmed(asset.chain, txSubmitted.hash)
    return txSubmitted
  }

  /**
   * Check if tx is approved for ERC-20
   * @param {IsApprovedParams} isApprovedParams params to check if tx is approved
   * @returns {string[]} array of errors
   */
  async shouldBeApproved(params: IsApprovedParams): Promise<boolean> {
    const { asset, amount, address } = params
    const errors = await this.mayachainAmm.isRouterApprovedToSpend({ asset, amount, address })
    return errors.some((error) => error === 'Maya router has not been approved to spend this amount')
  }

  /**
   * Builds a cache of all supported assets from available pools.
   * This reduces the need to query pools repeatedly for asset validation.
   *
   * @returns {Set<string>} - Set of supported asset strings
   */
  private async buildSupportedAssetsCache(): Promise<Set<string>> {
    const supportedAssets = new Set<string>()

    // Add known MAYAChain assets
    supportedAssets.add(assetToString(AssetCacao))

    try {
      const pools = await this.mayachainQuery.getPools()
      pools.forEach((pool) => {
        if (pool.status.toLowerCase() === 'available') {
          supportedAssets.add(pool.asset)
          // Also add synth variants
          supportedAssets.add(pool.asset.replace('.', '/')) // synth
        }
      })
    } catch (error) {
      console.warn('Failed to build supported assets cache:', error)
    }

    return supportedAssets
  }

  /**
   * Check if an asset is supported in the protocol using cached data
   * @param {Asset} asset Asset to check if it is supported
   * @returns {boolean} True if the asset is supported, otherwise false
   */
  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    // Fast path for known rejections and acceptances
    if (isTradeAsset(asset)) return false
    if (eqAsset(asset, AssetCacao)) return true

    try {
      const supportedAssets = await this.supportedAssetsCache.getValue()
      return supportedAssets.has(assetToString(asset))
    } catch (error) {
      console.warn('Failed to check supported asset from cache, falling back to direct lookup:', error)
      // Fallback to original implementation
      const pools = await this.mayachainQuery.getPools()
      return (
        pools.findIndex((pool) => pool.status === 'available' && eqAsset(asset, assetFromStringEx(pool.asset))) !== -1
      )
    }
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
      totalSwapSeconds: estimatedSwap.inboundConfirmationSeconds || 0 + estimatedSwap.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.slipBasisPoints,
      maxStreamingQuantity: estimatedSwap.maxStreamingQuantity,
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
    return this.mayachainAmm.doSwap({
      ...params,
      fromAsset: params.fromAsset as CompatibleAsset,
      destinationAsset: params.destinationAsset as CompatibleAsset,
      amount: params.amount as CryptoAmount<CompatibleAsset>,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
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
