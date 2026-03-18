import { OHLCVCandle, TickerStats, TimeInterval, BINANCE_INTERVALS } from './chartUtils'

const BASE_URL = 'https://api.binance.com/api/v3'

interface CacheEntry {
  data: OHLCVCandle[]
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 60_000 // 60s

export async function fetchKlines(
  symbol: string,
  interval: TimeInterval,
  limit = 500
): Promise<OHLCVCandle[]> {
  const cacheKey = `${symbol}-${interval}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const binanceInterval = BINANCE_INTERVALS[interval]
  const url = `${BASE_URL}/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`)

  const raw = await res.json()
  const candles: OHLCVCandle[] = raw.map((k: unknown[]) => ({
    time: Math.floor((k[0] as number) / 1000),
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
  }))

  cache.set(cacheKey, { data: candles, timestamp: Date.now() })
  return candles
}

export async function fetchLatestCandle(
  symbol: string,
  interval: TimeInterval
): Promise<OHLCVCandle> {
  const candles = await fetchKlines(symbol, interval, 1)
  return candles[0]
}

export async function fetch24hrTicker(symbol: string): Promise<TickerStats> {
  const url = `${BASE_URL}/ticker/24hr?symbol=${symbol}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`)

  const data = await res.json()
  return {
    priceChange: parseFloat(data.priceChange),
    priceChangePercent: parseFloat(data.priceChangePercent),
    high: parseFloat(data.highPrice),
    low: parseFloat(data.lowPrice),
    volume: parseFloat(data.volume),
  }
}
