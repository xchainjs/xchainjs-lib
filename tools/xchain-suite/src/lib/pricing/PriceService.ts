
import type { AnyAsset, CryptoAmount } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'

export interface PriceData {
  usdPrice: number | null
  source: 'midgard' | 'mayamidgard' | null
  timestamp: number
}

const MIDGARD_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://gateway.liquify.com/chain/thorchain_midgard/v2',
  [Network.Stagenet]: '',
  [Network.Testnet]: 'deprecated',
}

const MAYA_MIDGARD_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://midgard.mayachain.info/v2',
  [Network.Stagenet]: 'https://stagenet-midgard.mayachain.info/v2',
  [Network.Testnet]: 'https://testnet-midgard.mayachain.info/v2',
}

interface MidgardPool {
  asset: string
  assetPriceUSD: string
}

interface PriceCache {
  prices: Map<string, number>
  timestamp: number
}

let thorchainCache: PriceCache | null = null
let mayachainCache: PriceCache | null = null
const CACHE_DURATION = 30 * 1000 // 30 seconds

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

    const usdcPrice = prices.get('AVAX.USDC') ?? prices.get('ETH.USDC')
    if (usdcPrice) {
      const stablecoinPool = pools.find((p) => p.asset.includes('USDC') || p.asset.includes('USDT'))
      if (stablecoinPool) {
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

function normalizeAssetKey(asset: string): string {
  // "ETH.USDC-0xA0B86991..." -> "ETH.USDC"
  // "BTC.BTC" -> "BTC.BTC"
  const dashIndex = asset.indexOf('-')
  if (dashIndex > 0) {
    return asset.substring(0, dashIndex)
  }
  return asset
}

function getAssetKey(asset: AnyAsset): string {
  return `${asset.chain}.${asset.ticker}`
}

export class PriceService {
  private network: Network

  constructor(network: Network = Network.Mainnet) {
    this.network = network
  }

  async getAssetPrice(asset: AnyAsset): Promise<PriceData> {
    const key = getAssetKey(asset)

    const thorPrices = await fetchThorchainPrices(this.network)
    let price = thorPrices.get(key)
    if (price !== undefined) {
      return {
        usdPrice: price,
        source: 'midgard',
        timestamp: Date.now(),
      }
    }

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

  async getUsdValue(cryptoAmount: CryptoAmount): Promise<number | null> {
    const priceData = await this.getAssetPrice(cryptoAmount.asset)
    if (priceData.usdPrice === null) {
      return null
    }

    const assetAmount = cryptoAmount.assetAmount.amount().toNumber()
    return assetAmount * priceData.usdPrice
  }

  async refreshPrices(): Promise<void> {
    thorchainCache = null
    mayachainCache = null
    await Promise.all([fetchThorchainPrices(this.network), fetchMayachainPrices(this.network)])
  }
}

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

let priceServiceInstance: PriceService | null = null

export function getPriceService(network: Network = Network.Mainnet): PriceService {
  if (!priceServiceInstance || priceServiceInstance['network'] !== network) {
    priceServiceInstance = new PriceService(network)
  }
  return priceServiceInstance
}
