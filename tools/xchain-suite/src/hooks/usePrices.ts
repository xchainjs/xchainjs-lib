
import { useState, useEffect, useCallback, useRef } from 'react'
import type { AnyAsset, CryptoAmount } from '@xchainjs/xchain-util'
import { PriceService, PriceData, formatUsdValue, formatUsdPrice } from '../lib/pricing/PriceService'
import { useWallet } from '../contexts/WalletContext'

export { formatUsdValue, formatUsdPrice }

interface UsePricesReturn {
  getPrice: (asset: AnyAsset) => number | null
  getPriceFormatted: (asset: AnyAsset) => string
  getValue: (amount: CryptoAmount) => number | null
  getValueFormatted: (amount: CryptoAmount) => string
  calculateValue: (amount: number, asset: AnyAsset) => number | null
  refresh: () => Promise<void>
  loading: boolean
  error: Error | null
  lastUpdate: number | null
}

interface PriceCache {
  [key: string]: PriceData
}

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

  useEffect(() => {
    priceServiceRef.current = new PriceService(network)
  }, [network])

  const fetchPrice = useCallback(async (asset: AnyAsset): Promise<PriceData> => {
    const key = getAssetKey(asset)

    const cached = priceCache[key]
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached
    }

    const pending = pendingRequests.current.get(key)
    if (pending) {
      return pending
    }

    const service = priceServiceRef.current
    if (!service) {
      return { usdPrice: null, source: null, timestamp: Date.now() }
    }

    const request = service.getAssetPrice(asset).then((data) => {
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

  const getPrice = useCallback((asset: AnyAsset): number | null => {
    const key = getAssetKey(asset)
    const cached = priceCache[key]

    if (cached) {
      return cached.usdPrice
    }

    fetchPrice(asset).catch(console.error)
    return null
  }, [priceCache, fetchPrice])

  const getPriceFormatted = useCallback((asset: AnyAsset): string => {
    const price = getPrice(asset)
    return formatUsdPrice(price)
  }, [getPrice])

  const getValue = useCallback((amount: CryptoAmount): number | null => {
    const price = getPrice(amount.asset)
    if (price === null) {
      return null
    }
    const assetAmount = amount.assetAmount.amount().toNumber()
    return assetAmount * price
  }, [getPrice])

  const getValueFormatted = useCallback((amount: CryptoAmount): string => {
    const value = getValue(amount)
    return formatUsdValue(value)
  }, [getValue])

  const calculateValue = useCallback((amount: number, asset: AnyAsset): number | null => {
    const price = getPrice(asset)
    if (price === null) {
      return null
    }
    return amount * price
  }, [getPrice])

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const service = priceServiceRef.current
      if (!service) {
        throw new Error('Price service not initialized')
      }

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
