/**
 * Price Service for Testing GUI
 *
 * Uses THORChain and MAYAChain pool data to calculate USD prices for assets.
 * Prices are derived from stablecoin pools (USDC on THORChain, USDT on MAYAChain).
 */

import type { AnyAsset, CryptoAmount, BaseAmount } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'
import BigNumber from 'bignumber.js'

export interface PriceData {
  usdPrice: number | null
  source: 'thorchain' | 'mayachain' | null
  timestamp: number
}

// Pool data structure from the cache
interface PoolData {
  runeToAssetRatio: BigNumber
  assetToRuneRatio: BigNumber
}

// Cache for pool data
interface PoolCache {
  pools: Map<string, PoolData>
  stablecoinPrice: BigNumber | null // Price of RUNE/CACAO in USD
  timestamp: number
  source: 'thorchain' | 'mayachain'
}

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000

let thorchainCache: PoolCache | null = null
let mayachainCache: PoolCache | null = null

// Lazy-loaded imports
let ThorchainCache: any = null
let Thornode: any = null
let MidgardQuery: any = null
let MidgardCache: any = null
let Midgard: any = null
let MayachainCache: any = null
let Mayanode: any = null

async function loadThorchainModules() {
  if (!ThorchainCache) {
    const thorQuery = await import('@xchainjs/xchain-thorchain-query')
    const midgardQuery = await import('@xchainjs/xchain-midgard-query')
    ThorchainCache = thorQuery.ThorchainCache
    Thornode = thorQuery.Thornode
    MidgardQuery = midgardQuery.MidgardQuery
    MidgardCache = midgardQuery.MidgardCache
    Midgard = midgardQuery.Midgard
  }
}

async function loadMayachainModules() {
  if (!MayachainCache) {
    const mayaQuery = await import('@xchainjs/xchain-mayachain-query')
    MayachainCache = mayaQuery.MayachainCache
    Mayanode = mayaQuery.Mayanode
  }
}

/**
 * Get the asset key for pool lookup
 */
function getAssetKey(asset: AnyAsset): string {
  return `${asset.chain}.${asset.ticker}`
}

/**
 * Fetch and cache THORChain pool data
 */
async function refreshThorchainCache(network: Network): Promise<PoolCache | null> {
  if (thorchainCache && Date.now() - thorchainCache.timestamp < CACHE_DURATION) {
    return thorchainCache
  }

  try {
    await loadThorchainModules()

    const midgardCache = new MidgardCache(new Midgard(network))
    const cache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))

    const pools = await cache.getPools() as Record<string, PoolData>
    const poolMap = new Map<string, PoolData>()

    let stablecoinPrice: BigNumber | null = null

    for (const [key, pool] of Object.entries(pools)) {
      poolMap.set(key, {
        runeToAssetRatio: pool.runeToAssetRatio,
        assetToRuneRatio: pool.assetToRuneRatio,
      })

      // Check for USDC pool to get stablecoin price
      if (key === 'ETH.USDC') {
        // USDC pool gives us: 1 RUNE = X USDC (runeToAssetRatio)
        // Since USDC ≈ $1, runeToAssetRatio ≈ RUNE price in USD
        // But we need to account for decimals: USDC has 6 decimals, RUNE has 8
        stablecoinPrice = pool.runeToAssetRatio.times(100) // Adjust for 8-6=2 decimal difference
      }
    }

    thorchainCache = {
      pools: poolMap,
      stablecoinPrice,
      timestamp: Date.now(),
      source: 'thorchain',
    }

    return thorchainCache
  } catch (error) {
    console.error('[PriceService] Failed to refresh THORChain cache:', error)
    return thorchainCache // Return stale cache if available
  }
}

/**
 * Fetch and cache MAYAChain pool data
 */
async function refreshMayachainCache(network: Network): Promise<PoolCache | null> {
  if (mayachainCache && Date.now() - mayachainCache.timestamp < CACHE_DURATION) {
    return mayachainCache
  }

  try {
    await loadMayachainModules()

    const cache = new MayachainCache(undefined, new Mayanode(network))
    const pools = await cache.getPools() as Record<string, PoolData>
    const poolMap = new Map<string, PoolData>()

    let stablecoinPrice: BigNumber | null = null

    for (const [key, pool] of Object.entries(pools)) {
      poolMap.set(key, {
        runeToAssetRatio: pool.runeToAssetRatio,
        assetToRuneRatio: pool.assetToRuneRatio,
      })

      // Check for USDT pool on MAYAChain
      if (key === 'ETH.USDT') {
        // CACAO has 10 decimals, USDT has 6 decimals
        stablecoinPrice = pool.runeToAssetRatio.times(10000) // Adjust for 10-6=4 decimal difference
      }
    }

    mayachainCache = {
      pools: poolMap,
      stablecoinPrice,
      timestamp: Date.now(),
      source: 'mayachain',
    }

    return mayachainCache
  } catch (error) {
    console.error('[PriceService] Failed to refresh MAYAChain cache:', error)
    return mayachainCache // Return stale cache if available
  }
}

/**
 * Calculate USD price for an asset using pool ratios
 */
function calculateUsdPrice(
  asset: AnyAsset,
  cache: PoolCache
): number | null {
  if (!cache.stablecoinPrice) {
    return null
  }

  const assetKey = getAssetKey(asset)

  // Special case: Native protocol assets (RUNE/CACAO)
  if (assetKey === 'THOR.RUNE' || assetKey === 'MAYA.CACAO') {
    return cache.stablecoinPrice.toNumber()
  }

  // Special case: Stablecoins
  if (assetKey === 'ETH.USDC' || assetKey === 'ETH.USDT') {
    return 1.0
  }

  const pool = cache.pools.get(assetKey)
  if (!pool) {
    return null
  }

  // Asset price = (1 Asset in RUNE) * (RUNE price in USD)
  // assetToRuneRatio = how many RUNE per 1 Asset
  // But we need to account for decimals

  // Get asset decimals (default to 8)
  const assetDecimals = getAssetDecimals(asset)
  const runeDecimals = cache.source === 'thorchain' ? 8 : 10

  // Price = assetToRuneRatio * stablecoinPrice, adjusted for decimals
  const decimalAdjustment = Math.pow(10, runeDecimals - assetDecimals)
  const price = pool.assetToRuneRatio
    .times(cache.stablecoinPrice)
    .div(decimalAdjustment)

  return price.toNumber()
}

/**
 * Get decimals for common assets
 */
function getAssetDecimals(asset: AnyAsset): number {
  const decimalsMap: Record<string, number> = {
    'BTC.BTC': 8,
    'ETH.ETH': 18,
    'BCH.BCH': 8,
    'LTC.LTC': 8,
    'DOGE.DOGE': 8,
    'DASH.DASH': 8,
    'AVAX.AVAX': 18,
    'BSC.BNB': 18,
    'ARB.ETH': 18,
    'GAIA.ATOM': 6,
    'THOR.RUNE': 8,
    'MAYA.CACAO': 10,
    'KUJI.KUJI': 6,
    'SOL.SOL': 9,
    'XRD.XRD': 18,
    'ADA.ADA': 6,
    'XRP.XRP': 6,
    'ETH.USDC': 6,
    'ETH.USDT': 6,
  }

  const key = getAssetKey(asset)
  return decimalsMap[key] ?? 8
}

export class PriceService {
  private network: Network

  constructor(network: Network = Network.Mainnet) {
    this.network = network
  }

  /**
   * Get USD price for a single asset
   */
  async getAssetPrice(asset: AnyAsset): Promise<PriceData> {
    // Try THORChain first
    const thorCache = await refreshThorchainCache(this.network)
    if (thorCache) {
      const price = calculateUsdPrice(asset, thorCache)
      if (price !== null) {
        return {
          usdPrice: price,
          source: 'thorchain',
          timestamp: thorCache.timestamp,
        }
      }
    }

    // Fallback to MAYAChain
    const mayaCache = await refreshMayachainCache(this.network)
    if (mayaCache) {
      const price = calculateUsdPrice(asset, mayaCache)
      if (price !== null) {
        return {
          usdPrice: price,
          source: 'mayachain',
          timestamp: mayaCache.timestamp,
        }
      }
    }

    return {
      usdPrice: null,
      source: null,
      timestamp: Date.now(),
    }
  }

  /**
   * Get USD prices for multiple assets at once
   */
  async getAssetPrices(assets: AnyAsset[]): Promise<Map<string, PriceData>> {
    const results = new Map<string, PriceData>()

    // Refresh caches
    const [thorCache, mayaCache] = await Promise.all([
      refreshThorchainCache(this.network),
      refreshMayachainCache(this.network),
    ])

    for (const asset of assets) {
      const key = getAssetKey(asset)

      // Try THORChain first
      if (thorCache) {
        const price = calculateUsdPrice(asset, thorCache)
        if (price !== null) {
          results.set(key, {
            usdPrice: price,
            source: 'thorchain',
            timestamp: thorCache.timestamp,
          })
          continue
        }
      }

      // Fallback to MAYAChain
      if (mayaCache) {
        const price = calculateUsdPrice(asset, mayaCache)
        if (price !== null) {
          results.set(key, {
            usdPrice: price,
            source: 'mayachain',
            timestamp: mayaCache.timestamp,
          })
          continue
        }
      }

      results.set(key, {
        usdPrice: null,
        source: null,
        timestamp: Date.now(),
      })
    }

    return results
  }

  /**
   * Calculate USD value for a CryptoAmount
   */
  async getUsdValue(cryptoAmount: CryptoAmount): Promise<number | null> {
    const priceData = await this.getAssetPrice(cryptoAmount.asset)
    if (priceData.usdPrice === null) {
      return null
    }

    const assetAmount = cryptoAmount.assetAmount.amount().toNumber()
    return assetAmount * priceData.usdPrice
  }

  /**
   * Calculate USD value from a BaseAmount and Asset
   */
  async getUsdValueFromBase(baseAmount: BaseAmount, asset: AnyAsset): Promise<number | null> {
    const priceData = await this.getAssetPrice(asset)
    if (priceData.usdPrice === null) {
      return null
    }

    const decimals = getAssetDecimals(asset)
    const assetAmount = baseAmount.amount().div(Math.pow(10, decimals)).toNumber()
    return assetAmount * priceData.usdPrice
  }

  /**
   * Force refresh all price caches
   */
  async refreshPrices(): Promise<void> {
    // Invalidate caches
    thorchainCache = null
    mayachainCache = null

    // Refresh both
    await Promise.all([
      refreshThorchainCache(this.network),
      refreshMayachainCache(this.network),
    ])
  }
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (value < 0.01) {
    return '< $0.01'
  }

  if (value < 1) {
    return `$${value.toFixed(4)}`
  }

  if (value < 1000) {
    return `$${value.toFixed(2)}`
  }

  if (value < 1000000) {
    return `$${(value / 1000).toFixed(2)}K`
  }

  return `$${(value / 1000000).toFixed(2)}M`
}

/**
 * Format USD price for display
 */
export function formatUsdPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return ''
  }

  if (price < 0.0001) {
    return `$${price.toExponential(2)}`
  }

  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  }

  if (price < 1) {
    return `$${price.toFixed(4)}`
  }

  if (price < 1000) {
    return `$${price.toFixed(2)}`
  }

  return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

// Singleton instance
let priceServiceInstance: PriceService | null = null

export function getPriceService(network: Network = Network.Mainnet): PriceService {
  if (!priceServiceInstance || priceServiceInstance['network'] !== network) {
    priceServiceInstance = new PriceService(network)
  }
  return priceServiceInstance
}
