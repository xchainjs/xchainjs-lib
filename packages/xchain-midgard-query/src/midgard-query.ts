import { PoolDetail } from '@xchainjs/xchain-midgard'
import {
  Asset,
  CachedValue,
  CryptoAmount,
  TokenAsset,
  assetFromString,
  assetToString,
  baseAmount,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { ActionHistory, CompatibleAsset, GetActionsParams, SaversPosition, getSaver } from './types'
import { isAssetRuneNative } from './utils/const'

/**
 * Default number of decimals used for THORChain assets.
 */
const DEFAULT_THORCHAIN_DECIMALS = 8

/**
 * Common asset decimals - same as in thorchain-query for consistency
 */
const COMMON_ASSET_DECIMALS: Record<string, number> = {
  // THORChain ecosystem
  'THOR.RUNE': 8,
  'THOR.TCY': 8,
  'THOR.RUJI': 8,

  // Bitcoin ecosystem
  'BTC.BTC': 8,
  'LTC.LTC': 8,
  'BCH.BCH': 8,
  'DOGE.DOGE': 8,
  'DASH.DASH': 8,
  'ZEC.ZEC': 8,

  // Ethereum ecosystem
  'ETH.ETH': 18,
  'AVAX.AVAX': 18,
  'ARB.ETH': 18,
  'BASE.ETH': 18,

  // BSC
  'BSC.BNB': 18,

  // Cosmos ecosystem
  'GAIA.ATOM': 6,
  'KUJI.KUJI': 6,

  // Other networks
  'XRP.XRP': 6,
  'ADA.ADA': 6,
  'SOL.SOL': 9,
  'TRON.TRX': 6,
  'XRD.XRD': 18,

  // MAYAChain ecosystem
  'MAYA.CACAO': 10,
  'MAYA.MAYA': 4,
}

/**
 * Chain default decimals
 */
const CHAIN_DEFAULT_DECIMALS: Record<string, number> = {
  BTC: 8,
  LTC: 8,
  BCH: 8,
  DOGE: 8,
  DASH: 8,
  ZEC: 8,
  ETH: 18,
  AVAX: 18,
  ARB: 18,
  BASE: 18,
  BSC: 18,
  GAIA: 6,
  KUJI: 6,
  THOR: 8,
  MAYA: 10,
  XRP: 6,
  ADA: 6,
  SOL: 9,
  TRON: 6,
  XRD: 18,
}

/**
 * Aggressive cache TTL for asset decimals (24 hours) - decimals rarely change
 */
const DECIMALS_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Default cache instance for Midgard queries.
 */
const defaultCache = new MidgardCache()

/**
 * Class for retrieving and processing data from the Midgard API using MidgardCache to optimize request numbers (THORChain L2 API).
 */
export class MidgardQuery {
  readonly midgardCache: MidgardCache
  readonly overrideDecimals: Record<string, number>
  private readonly decimalCache: CachedValue<Record<string, number>>

  /**
   * Constructor to create a MidgardQuery.
   *
   * @param midgardCache - An instance of the MidgardCache (could be pointing to stagenet, testnet, mainnet).
   * @returns MidgardQuery
   */
  constructor(midgardCache = defaultCache, overrideDecimals: Record<string, number> = {}) {
    this.midgardCache = midgardCache
    this.overrideDecimals = overrideDecimals
    // Initialize aggressive decimal cache with 24h TTL
    this.decimalCache = new CachedValue<Record<string, number>>(() => this.buildDecimalCache(), DECIMALS_CACHE_TTL)
  }

  /**
   * Get pool by asset.
   *
   * @param {string} asset - For example: BTC.BTC.
   * @returns {PoolDetail} - Details of the selected pool.
   * @throws {Error} - Can't find pool for asset.
   */
  private async getPool(asset: string): Promise<PoolDetail> {
    const pools = await this.midgardCache.getPools()
    const pool = pools.find((pool) => pool.asset === asset)
    if (!pool) {
      throw new Error(`Can't find pool for asset: ${asset}`)
    }
    return pool
  }

  /**
   * Get saver positions by an array of saver descriptions.
   *
   * @param {getSaver[]} params - Array of search conditions.
   * @returns {SaversPosition[]} - Information on the positions found.
   */
  public async getSaverPositions(params: getSaver[]): Promise<SaversPosition[]> {
    const addresses: Set<string> = new Set<string>()
    params.forEach((param) => addresses.add(param.address))
    const addressesString: string = Array.from(addresses).join(',')
    const saversDetail = await this.midgardCache.getSavers(addressesString)
    const errors: string[] = []

    const saversPositions: SaversPosition[] = []
    const allPositionsPromises = saversDetail.pools.map(async (saver) => {
      const asset = assetFromString(saver.pool) as Asset | TokenAsset

      if (asset) {
        const poolDetail = await this.getPool(saver.pool)
        const depositAmount = new CryptoAmount(baseAmount(saver.assetAdded).minus(saver.assetWithdrawn), asset)
        const ownerUnits = Number(saver?.saverUnits)
        const saverUnits = Number(poolDetail.saversUnits)
        const assetDepth = Number(poolDetail.saversDepth)
        const redeemableValue = (ownerUnits / saverUnits) * assetDepth
        const redeemableAssetAmount = new CryptoAmount(baseAmount(redeemableValue), asset)
        const saverGrowth = redeemableAssetAmount.minus(depositAmount).div(depositAmount).times(100)
        const saversAge = (Date.now() / 1000 - Number(saver.dateLastAdded)) / (365 * 86400)

        saversPositions.push({
          depositValue: depositAmount,
          redeemableValue: redeemableAssetAmount,
          lastAddHeight: -1,
          percentageGrowth: saverGrowth.assetAmount.amount().toNumber(),
          ageInYears: saversAge,
          ageInDays: saversAge * 365,
          asset,
          errors,
        })
      }
    })
    await Promise.all(allPositionsPromises)
    return saversPositions
  }

  /**
   * Builds a comprehensive cache of asset decimals from all available pools.
   * This is called once and cached for 24 hours since decimals rarely change.
   *
   * @returns {Record<string, number>} - Map of asset strings to decimal counts
   */
  private async buildDecimalCache(): Promise<Record<string, number>> {
    const decimalsMap: Record<string, number> = {}

    try {
      const pools = await this.midgardCache.getPools()

      // Cache decimals for all pool assets
      for (const pool of pools) {
        if (pool.asset && pool.nativeDecimal) {
          decimalsMap[pool.asset] = Number(pool.nativeDecimal)
        }
      }

      // Add known THORChain asset decimals
      decimalsMap['THOR.RUNE'] = DEFAULT_THORCHAIN_DECIMALS
    } catch (error) {
      console.warn('Failed to build decimal cache, using defaults:', error)
    }

    return decimalsMap
  }

  /**
   * Batch lookup for multiple asset decimals - more efficient than individual calls.
   *
   * @param {CompatibleAsset[]} assets - Array of assets to get decimals for
   * @returns {Promise<Record<string, number>>} - Map of asset strings to decimal counts
   */
  public async getDecimalsForAssets(assets: CompatibleAsset[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {}
    const unknownAssets: string[] = []

    // First, try to resolve from static decimals and overrides
    for (const asset of assets) {
      const assetString = assetToString(asset)

      // Check override decimals first
      if (this.overrideDecimals[assetString]) {
        result[assetString] = this.overrideDecimals[assetString]
        continue
      }

      // Return default for THORChain assets
      if (isAssetRuneNative(asset) || isSynthAsset(asset) || isTradeAsset(asset) || isSecuredAsset(asset)) {
        result[assetString] = DEFAULT_THORCHAIN_DECIMALS
        continue
      }

      // Try static decimals for well-known assets
      if (COMMON_ASSET_DECIMALS[assetString]) {
        result[assetString] = COMMON_ASSET_DECIMALS[assetString]
        continue
      }

      unknownAssets.push(assetString)
    }

    // Try to get remaining assets from cache
    const stillUnknownAssets: string[] = []
    if (unknownAssets.length > 0) {
      try {
        const cachedDecimals = await this.decimalCache.getValue()
        unknownAssets.forEach((assetString) => {
          if (cachedDecimals[assetString] !== undefined) {
            result[assetString] = cachedDecimals[assetString]
          } else {
            stillUnknownAssets.push(assetString)
          }
        })
      } catch (error) {
        console.warn('Failed to get batch decimals from cache:', error)
        stillUnknownAssets.push(...unknownAssets)
      }
    }

    // Resolve remaining unknown assets via live pool lookups with chain fallbacks
    if (stillUnknownAssets.length > 0) {
      // Optimize with parallel lookups for better performance
      const poolLookups = stillUnknownAssets.map(async (assetString) => {
        try {
          const pool = await this.getPool(assetString)
          if (pool && pool.nativeDecimal) {
            const decimals = Number(pool.nativeDecimal)
            // Guard against NaN values from invalid nativeDecimal
            if (isNaN(decimals)) {
              // Try chain default before falling back to THORChain default
              const asset = assets.find((a) => assetToString(a) === assetString)
              const chainDefault = asset ? CHAIN_DEFAULT_DECIMALS[asset.chain] : undefined
              return { assetString, decimals: chainDefault ?? DEFAULT_THORCHAIN_DECIMALS }
            }
            return { assetString, decimals }
          } else {
            // Try chain default before falling back to THORChain default
            const asset = assets.find((a) => assetToString(a) === assetString)
            const chainDefault = asset ? CHAIN_DEFAULT_DECIMALS[asset.chain] : undefined
            return { assetString, decimals: chainDefault ?? DEFAULT_THORCHAIN_DECIMALS }
          }
        } catch {
          // Single failure doesn't drop other assets - use chain default or THORChain default
          const asset = assets.find((a) => assetToString(a) === assetString)
          const chainDefault = asset ? CHAIN_DEFAULT_DECIMALS[asset.chain] : undefined
          return { assetString, decimals: chainDefault ?? DEFAULT_THORCHAIN_DECIMALS }
        }
      })

      // Wait for all pool lookups to complete
      const poolResults = await Promise.all(poolLookups)

      // Assign results back to the result object
      poolResults.forEach(({ assetString, decimals }) => {
        result[assetString] = decimals
      })
    }

    return result
  }

  /**
   * Returns the number of decimals for a given asset with robust fallback layers.
   *
   * @param {Asset} asset - The asset for getting decimals.
   * @returns {number} - Number of decimals from static data, cache, or Midgard fallback
   */
  public async getDecimalForAsset(asset: CompatibleAsset): Promise<number> {
    const assetString = assetToString(asset)

    // Check override decimals first
    if (this.overrideDecimals[assetString]) {
      return this.overrideDecimals[assetString]
    }

    // Return default for THORChain assets
    if (isAssetRuneNative(asset) || isSynthAsset(asset) || isTradeAsset(asset) || isSecuredAsset(asset))
      return DEFAULT_THORCHAIN_DECIMALS

    // First try: static decimals for well-known assets (fastest, most reliable)
    if (COMMON_ASSET_DECIMALS[assetString]) {
      return COMMON_ASSET_DECIMALS[assetString]
    }

    // Second try: get from cache
    try {
      const cachedDecimals = await this.decimalCache.getValue()
      if (cachedDecimals[assetString] !== undefined) {
        return cachedDecimals[assetString]
      }
    } catch (error) {
      console.warn(`Failed to get decimal from cache for ${assetString}:`, error)
    }

    // Third try: individual pool lookup
    try {
      const pool = await this.getPool(assetString)
      const decimals = Number(pool.nativeDecimal)
      if (isNaN(decimals)) {
        throw new Error(`Invalid nativeDecimal value: ${pool.nativeDecimal}`)
      }
      return decimals
    } catch (error) {
      console.warn(`Failed to get decimal for ${assetString}, using chain default:`, error)
    }

    // Fourth try: chain-based default
    const chainDefault = CHAIN_DEFAULT_DECIMALS[asset.chain]
    if (chainDefault !== undefined) {
      return chainDefault
    }

    // Final fallback: THORChain standard
    console.warn(`Unknown chain ${asset.chain} for asset ${assetString}, using THORChain default decimals`)
    return DEFAULT_THORCHAIN_DECIMALS
  }

  /**
   * List actions along with their related transactions. An action is generated by one or more inbound transactions
   * with the intended action set in the transaction memo. The action may result in one or more outbound transactions.
   * Results are paginated by sets of 50. Filters may be applied to query actions.
   *
   * @param {GetActionsParams} params - Get actions params
   * @param {string} params.address - Comma separated list. Address of sender or recipient of any in/out transaction
   * related to the action.
   * @param {string} params.txid - ID of any in/out tx related to the action
   * @param {string} params.asset - Comma separated list. Any asset that is part of the action (CHAIN.SYMBOL) Additionally,
   * synth, nosynth, and norune filters can be used for swap, add/withdraw actions.
   * @param {ActionType} params.type - One or more comma separated unique types of action (swap, addLiquidity, withdraw,
   * donate, refund, switch)
   * @param {string} params.affiliate - Comma separated list. Affiliate address of the action (swap, refund)
   * @param {number} params.limit - Number of actions returned, default is 50
   * @param {number} params.offset - Pagination offset, default is 0
   * @param {number} params.nextPageToken - If this is given, the actions for the next page will be given
   * @param {number} params.timestamp - If this is given, the actions older than the timestamp will be given
   * @param {number} params.height - If this is given, the actions older than the height will be given
   * @param {number} params.prevPageToken - If this is given, the actions for the previous page will be given
   * @param {number} params.fromTimestamp - If this is given, the actions newer than the timestamp will be given
   * @param {number} params.fromHeight - If this is given, the actions newer than the height will be given
   *
   * @returns {ActionHistory} Array of actions for the given filters
   */
  public async getActions({
    address,
    txid,
    asset,
    type,
    affiliate,
    limit,
    offset,
    nextPageToken,
    timestamp,
    height,
    prevPageToken,
    fromTimestamp,
    fromHeight,
  }: GetActionsParams): Promise<ActionHistory> {
    return this.midgardCache.midgard.getActions({
      address,
      txid,
      asset,
      type,
      affiliate,
      limit,
      offset,
      nextPageToken,
      timestamp,
      height,
      prevPageToken,
      fromTimestamp,
      fromHeight,
    })
  }
}
