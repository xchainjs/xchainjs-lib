import { OHLCVCandle, TickerStats, TimeInterval, MIDGARD_INTERVALS } from './chartUtils'

const THORCHAIN_MIDGARD = 'https://gateway.liquify.com/chain/thorchain_midgard/v2'
const MAYA_MIDGARD = 'https://midgard.mayachain.info/v2'

interface DepthHistoryItem {
  startTime: string
  endTime: string
  assetDepth: string
  assetPrice: string
  assetPriceUSD: string
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
  if (pool.startsWith('MAYA.')) return MAYA_MIDGARD
  return THORCHAIN_MIDGARD
}

// Native assets can't be queried directly via depth history.
// Use BTC.BTC pool and derive RUNE price from runeDepth/assetDepth.
const NATIVE_POOL_PROXY: Record<string, string> = {
  'THOR.RUNE': 'BTC.BTC',
  'MAYA.CACAO': 'ETH.ETH',
}

function getPoolId(pool: string): string {
  return NATIVE_POOL_PROXY[pool] ?? pool
}

function isNativeAsset(pool: string): boolean {
  return pool in NATIVE_POOL_PROXY
}

export async function fetchDepthHistory(pool: string, interval: TimeInterval, count = 500): Promise<OHLCVCandle[]> {
  const midgardUrl = getMidgardUrl(pool)
  const midgardInterval = MIDGARD_INTERVALS[interval]
  const poolId = getPoolId(pool)
  const native = isNativeAsset(pool)

  const url = `${midgardUrl}/history/depths/${poolId}?interval=${midgardInterval}&count=${Math.min(count, 400)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Midgard API error: ${res.status}`)

  const data: DepthHistoryResponse = await res.json()

  return data.intervals.map((item) => {
    let price: number
    if (native) {
      // For RUNE: price = (assetDepth * assetPriceUSD) / runeDepth
      const assetDepth = parseFloat(item.assetDepth)
      const runeDepth = parseFloat(item.runeDepth)
      const assetPriceUSD = parseFloat(item.assetPriceUSD)
      price = runeDepth > 0 ? (assetDepth * assetPriceUSD) / runeDepth : 0
    } else {
      price = parseFloat(item.assetPriceUSD)
    }
    const time = Math.floor(parseInt(item.startTime))
    return {
      time,
      open: price,
      high: price,
      low: price,
      close: price,
      // Midgard depth history does not provide traded volume
      volume: 0,
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

  return { priceChange, priceChangePercent, high, low, volume: 0 }
}
