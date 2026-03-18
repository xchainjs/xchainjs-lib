import { OHLCVCandle, TickerStats, TimeInterval, MIDGARD_INTERVALS } from './chartUtils'

const THORCHAIN_MIDGARD = 'https://midgard.ninerealms.com/v2'
const MAYA_MIDGARD = 'https://midgard.mayachain.info/v2'

interface DepthHistoryItem {
  startTime: string
  endTime: string
  assetDepth: string
  assetPrice: string
  assetPriceUSD: string
  // OHLC fields added in recent Midgard versions
  liquidityUnits: string
  runeDepth: string
}

interface DepthHistoryResponse {
  intervals: DepthHistoryItem[]
  meta: {
    startTime: string
    endTime: string
  }
}

function getMidgardUrl(pool: string): string {
  // MAYA pools use Maya Midgard
  if (pool.startsWith('MAYA.')) return MAYA_MIDGARD
  return THORCHAIN_MIDGARD
}

// Map pool string to the actual pool identifier for Midgard
function getPoolId(pool: string): string {
  // For native assets like THOR.RUNE, we need a synth pool approach
  // Midgard depth history works on pools like BTC.BTC, ETH.ETH etc.
  // For RUNE pricing we use BTC.BTC pool and derive from rune depth
  return pool
}

export async function fetchDepthHistory(
  pool: string,
  interval: TimeInterval,
  count = 500
): Promise<OHLCVCandle[]> {
  const midgardUrl = getMidgardUrl(pool)
  const midgardInterval = MIDGARD_INTERVALS[interval]
  const poolId = getPoolId(pool)

  const url = `${midgardUrl}/history/depths/${poolId}?interval=${midgardInterval}&count=${Math.min(count, 400)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Midgard API error: ${res.status}`)

  const data: DepthHistoryResponse = await res.json()

  return data.intervals.map((item) => {
    const price = parseFloat(item.assetPriceUSD)
    const time = Math.floor(parseInt(item.startTime))
    return {
      time,
      open: price,
      high: price, // Midgard depth history doesn't have OHLC, just a single price
      low: price,
      close: price,
      volume: parseFloat(item.assetDepth),
    }
  })
}

export async function fetchMidgard24hrStats(pool: string): Promise<TickerStats> {
  const candles = await fetchDepthHistory(pool, '1h', 24)
  if (candles.length === 0) {
    return { priceChange: 0, priceChangePercent: 0, high: 0, low: 0, volume: 0 }
  }

  const first = candles[0]
  const last = candles[candles.length - 1]
  const priceChange = last.close - first.open
  const priceChangePercent = first.open > 0 ? (priceChange / first.open) * 100 : 0
  const high = Math.max(...candles.map((c) => c.high))
  const low = Math.min(...candles.map((c) => c.low))
  const volume = candles.reduce((sum, c) => sum + c.volume, 0)

  return { priceChange, priceChangePercent, high, low, volume }
}
