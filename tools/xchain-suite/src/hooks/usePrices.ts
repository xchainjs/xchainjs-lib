/**
 * React hook for fetching and caching USD prices
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AnyAsset, CryptoAmount } from '@xchainjs/xchain-util'
import { PriceService, PriceData, formatUsdValue, formatUsdPrice } from '../lib/pricing/PriceService'
import { useWallet } from '../contexts/WalletContext'

// Re-export formatters for convenience
export { formatUsdValue, formatUsdPrice }

interface UsePricesReturn {
  /** Get USD price for an asset */
  getPrice: (asset: AnyAsset) => number | null
  /** Get formatted USD price string for an asset */
  getPriceFormatted: (asset: AnyAsset) => string
  /** Get USD value for a CryptoAmount */
  getValue: (amount: CryptoAmount) => number | null
  /** Get formatted USD value string for a CryptoAmount */
  getValueFormatted: (amount: CryptoAmount) => string
  /** Calculate USD value from amount and asset */
  calculateValue: (amount: number, asset: AnyAsset) => number | null
  /** Force refresh all prices */
  refresh: () => Promise<void>
  /** Whether prices are currently loading */
  loading: boolean
  /** Any error that occurred during price fetch */
  error: Error | null
  /** Timestamp of last price update */
  lastUpdate: number | null
}

interface PriceCache {
  [key: string]: PriceData
}

// Get asset key for cache lookup
function getAssetKey(asset: AnyAsset): string {
  return `${asset.chain}.${asset.ticker}`
}

export function usePrices(): UsePricesReturn {
  const { network } = useWallet()
  const [priceCache, setPriceCache] = useState<PriceCache>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  const priceServiceRef = useRef<PriceService | null>(null)
  const pendingRequests = useRef<Map<string, Promise<PriceData>>>(new Map())

  // Initialize price service
  useEffect(() => {
    priceServiceRef.current = new PriceService(network)
  }, [network])

  // Fetch price for an asset (with deduplication)
  const fetchPrice = useCallback(async (asset: AnyAsset): Promise<PriceData> => {
    const key = getAssetKey(asset)

    // Check if already in cache and fresh (< 30 seconds)
    const cached = priceCache[key]
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached
    }

    // Check if there's already a pending request
    const pending = pendingRequests.current.get(key)
    if (pending) {
      return pending
    }

    // Create new request
    const service = priceServiceRef.current
    if (!service) {
      return { usdPrice: null, source: null, timestamp: Date.now() }
    }

    const request = service.getAssetPrice(asset).then((data) => {
      // Update cache
      setPriceCache((prev) => ({
        ...prev,
        [key]: data,
      }))
      setLastUpdate(Date.now())
      pendingRequests.current.delete(key)
      return data
    })

    pendingRequests.current.set(key, request)
    return request
  }, [priceCache])

  // Get price (triggers fetch if not cached)
  const getPrice = useCallback((asset: AnyAsset): number | null => {
    const key = getAssetKey(asset)
    const cached = priceCache[key]

    if (cached) {
      return cached.usdPrice
    }

    // Trigger async fetch (result will update on next render)
    fetchPrice(asset).catch(console.error)
    return null
  }, [priceCache, fetchPrice])

  // Get formatted price string
  const getPriceFormatted = useCallback((asset: AnyAsset): string => {
    const price = getPrice(asset)
    return formatUsdPrice(price)
  }, [getPrice])

  // Get USD value for a CryptoAmount
  const getValue = useCallback((amount: CryptoAmount): number | null => {
    const price = getPrice(amount.asset)
    if (price === null) {
      return null
    }
    const assetAmount = amount.assetAmount.amount().toNumber()
    return assetAmount * price
  }, [getPrice])

  // Get formatted USD value string
  const getValueFormatted = useCallback((amount: CryptoAmount): string => {
    const value = getValue(amount)
    return formatUsdValue(value)
  }, [getValue])

  // Calculate value from raw amount and asset
  const calculateValue = useCallback((amount: number, asset: AnyAsset): number | null => {
    const price = getPrice(asset)
    if (price === null) {
      return null
    }
    return amount * price
  }, [getPrice])

  // Refresh all cached prices
  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const service = priceServiceRef.current
      if (!service) {
        throw new Error('Price service not initialized')
      }

      // Get all cached asset keys and refresh them
      const assets: AnyAsset[] = Object.keys(priceCache).map((key) => {
        const [chain, ticker] = key.split('.')
        return { chain, ticker, symbol: ticker, type: 0 }
      })

      if (assets.length > 0) {
        const prices = await service.getAssetPrices(assets)
        const newCache: PriceCache = {}
        prices.forEach((data, key) => {
          newCache[key] = data
        })
        setPriceCache(newCache)
      }

      // Force refresh internal caches
      await service.refreshPrices()
      setLastUpdate(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to refresh prices'))
    } finally {
      setLoading(false)
    }
  }, [priceCache])

  return {
    getPrice,
    getPriceFormatted,
    getValue,
    getValueFormatted,
    calculateValue,
    refresh,
    loading,
    error,
    lastUpdate,
  }
}

/**
 * Hook for getting price of a single asset with auto-refresh
 */
export function useAssetPrice(asset: AnyAsset | null): {
  price: number | null
  priceFormatted: string
  loading: boolean
  error: Error | null
} {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { network } = useWallet()

  useEffect(() => {
    if (!asset) {
      setPrice(null)
      return
    }

    let cancelled = false
    const service = new PriceService(network)

    const fetchPrice = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await service.getAssetPrice(asset)
        if (!cancelled) {
          setPrice(data.usdPrice)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to fetch price'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPrice()

    // Refresh every 30 seconds
    const interval = setInterval(fetchPrice, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [asset, network])

  return {
    price,
    priceFormatted: formatUsdPrice(price),
    loading,
    error,
  }
}

/**
 * Hook for getting USD value of a balance
 */
export function useBalanceUsdValue(
  balance: string | null,
  asset: AnyAsset | null
): {
  usdValue: number | null
  usdValueFormatted: string
  loading: boolean
} {
  const { price, loading } = useAssetPrice(asset)

  const usdValue = price !== null && balance !== null
    ? parseFloat(balance) * price
    : null

  return {
    usdValue,
    usdValueFormatted: formatUsdValue(usdValue),
    loading,
  }
}
