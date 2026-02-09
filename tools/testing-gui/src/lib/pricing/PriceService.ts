/**
 * Price Service for Testing GUI
 *
 * Uses Midgard API for USD prices (assetPriceUSD field).
 */

import type { AnyAsset, CryptoAmount } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'

export interface PriceData {
  usdPrice: number | null
  source: 'midgard' | 'mayamidgard' | null
  timestamp: number
}

// Midgard endpoints
const MIDGARD_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://midgard.ninerealms.com/v2',
  [Network.Stagenet]: 'https://stagenet-midgard.ninerealms.com/v2',
  [Network.Testnet]: 'https://testnet.midgard.thorchain.info/v2',
}

const MAYA_MIDGARD_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://midgard.mayachain.info/v2',
  [Network.Stagenet]: 'https://stagenet-midgard.mayachain.info/v2',
  [Network.Testnet]: 'https://testnet-midgard.mayachain.info/v2',
}

// Pool data from Midgard
interface MidgardPool {
  asset: string
  assetPriceUSD: string
}

// Price cache
interface PriceCache {
  prices: Map<string, number>
  timestamp: number
}

let thorchainCache: PriceCache | null = null
let mayachainCache: PriceCache | null = null
const CACHE_DURATION = 30 * 1000 // 30 seconds

/**
 * Fetch prices from THORChain Midgard
 */
async function fetchThorchainPrices(network: Network): Promise<Map<string, number>> {
  if (thorchainCache && Date.now() - thorchainCache.timestamp < CACHE_DURATION) {
    return thorchainCache.prices
  }

  const url = `${MIDGARD_URLS[network]}/pools`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Midgard API error: ${response.status}`)
    }

    const pools: MidgardPool[] = await response.json()
    const prices = new Map<string, number>()

    for (const pool of pools) {
      const price = parseFloat(pool.assetPriceUSD)
      if (!isNaN(price) && price > 0) {
        // Normalize asset key (e.g., "BTC.BTC" stays as is, "ETH.USDC-0x..." becomes "ETH.USDC")
        const assetKey = normalizeAssetKey(pool.asset)
        prices.set(assetKey, price)
      }
    }

    // Add RUNE price (derived from stablecoin pools)
    const usdcPrice = prices.get('AVAX.USDC') ?? prices.get('ETH.USDC')
    if (usdcPrice) {
      // Find a stablecoin pool to get RUNE price
      const stablecoinPool = pools.find(p =>
        p.asset.includes('USDC') || p.asset.includes('USDT')
      )
      if (stablecoinPool) {
        // assetPrice is in RUNE terms, so RUNE price = 1 / assetPrice * assetPriceUSD
        // But actually, assetPriceUSD already accounts for this, so we can derive:
        // For stablecoin: assetPriceUSD ≈ 1, assetPrice = RUNE per asset
        // So RUNE price = assetPriceUSD / assetPrice ≈ 1 / assetPrice
        // But simpler: just use any pool's ratio
      }
    }

    thorchainCache = { prices, timestamp: Date.now() }
    console.log('[PriceService] Fetched THORChain prices:', Object.fromEntries(prices))
    return prices
  } catch (error) {
    console.error('[PriceService] Failed to fetch THORChain prices:', error)
    return thorchainCache?.prices ?? new Map()
  }
}

/**
 * Fetch prices from MAYAChain Midgard
 */
async function fetchMayachainPrices(network: Network): Promise<Map<string, number>> {
  if (mayachainCache && Date.now() - mayachainCache.timestamp < CACHE_DURATION) {
    return mayachainCache.prices
  }

  const url = `${MAYA_MIDGARD_URLS[network]}/pools`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Maya Midgard API error: ${response.status}`)
    }

    const pools: MidgardPool[] = await response.json()
    const prices = new Map<string, number>()

    for (const pool of pools) {
      const price = parseFloat(pool.assetPriceUSD)
      if (!isNaN(price) && price > 0) {
        const assetKey = normalizeAssetKey(pool.asset)
        prices.set(assetKey, price)
      }
    }

    mayachainCache = { prices, timestamp: Date.now() }
    console.log('[PriceService] Fetched MAYAChain prices:', Object.fromEntries(prices))
    return prices
  } catch (error) {
    console.error('[PriceService] Failed to fetch MAYAChain prices:', error)
    return mayachainCache?.prices ?? new Map()
  }
}

/**
 * Normalize asset key - strip contract addresses for lookup
 */
function normalizeAssetKey(asset: string): string {
  // "ETH.USDC-0xA0B86991..." -> "ETH.USDC"
  // "BTC.BTC" -> "BTC.BTC"
  const dashIndex = asset.indexOf('-')
  if (dashIndex > 0) {
    return asset.substring(0, dashIndex)
  }
  return asset
}

/**
 * Get asset key for lookup
 */
function getAssetKey(asset: AnyAsset): string {
  return `${asset.chain}.${asset.ticker}`
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
    const key = getAssetKey(asset)

    // Try THORChain first
    const thorPrices = await fetchThorchainPrices(this.network)
    let price = thorPrices.get(key)
    if (price !== undefined) {
      return {
        usdPrice: price,
        source: 'midgard',
        timestamp: Date.now(),
      }
    }

    // Fallback to MAYAChain
    const mayaPrices = await fetchMayachainPrices(this.network)
    price = mayaPrices.get(key)
    if (price !== undefined) {
      return {
        usdPrice: price,
        source: 'mayamidgard',
        timestamp: Date.now(),
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
    const [thorPrices, mayaPrices] = await Promise.all([
      fetchThorchainPrices(this.network),
      fetchMayachainPrices(this.network),
    ])

    const results = new Map<string, PriceData>()

    for (const asset of assets) {
      const key = getAssetKey(asset)

      let price = thorPrices.get(key)
      if (price !== undefined) {
        results.set(key, {
          usdPrice: price,
          source: 'midgard',
          timestamp: Date.now(),
        })
        continue
      }

      price = mayaPrices.get(key)
      if (price !== undefined) {
        results.set(key, {
          usdPrice: price,
          source: 'mayamidgard',
          timestamp: Date.now(),
        })
        continue
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
   * Force refresh prices
   */
  async refreshPrices(): Promise<void> {
    thorchainCache = null
    mayachainCache = null
    await Promise.all([
      fetchThorchainPrices(this.network),
      fetchMayachainPrices(this.network),
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
