import { useState, useEffect, useRef, useCallback } from 'react'
import { OHLCVCandle, TickerStats, TimeInterval, getBinanceSymbol, getMidgardPool, getDataSource } from '../lib/trading/chartUtils'
import { fetchKlines, fetch24hrTicker } from '../lib/trading/BinanceService'
import { fetchDepthHistory, fetchMidgard24hrStats } from '../lib/trading/MidgardOHLCVService'

interface UseOHLCVReturn {
  candles: OHLCVCandle[]
  ticker: TickerStats | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useOHLCV(asset: string, interval: TimeInterval): UseOHLCVReturn {
  const [candles, setCandles] = useState<OHLCVCandle[]>([])
  const [ticker, setTicker] = useState<TickerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const source = getDataSource(asset)

        if (source === 'binance') {
          const symbol = getBinanceSymbol(asset)!
          const [klines, tickerData] = await Promise.all([
            fetchKlines(symbol, interval),
            fetch24hrTicker(symbol),
          ])
          if (!cancelled) {
            setCandles(klines)
            setTicker(tickerData)
          }
        } else {
          const pool = getMidgardPool(asset)
          if (!pool) throw new Error(`No data source for ${asset}`)

          const [depths, tickerData] = await Promise.all([
            fetchDepthHistory(pool, interval),
            fetchMidgard24hrStats(pool),
          ])
          if (!cancelled) {
            setCandles(depths)
            setTicker(tickerData)
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to fetch chart data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    // Auto-poll for short intervals
    const pollMs = interval === '1m' ? 10_000 : interval === '5m' ? 30_000 : 60_000
    pollRef.current = setInterval(() => {
      if (!cancelled) load()
    }, pollMs)

    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [asset, interval, refreshKey])

  return { candles, ticker, loading, error, refresh }
}
