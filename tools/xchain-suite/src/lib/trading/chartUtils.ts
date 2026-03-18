export interface OHLCVCandle {
  time: number // Unix seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W'

export interface TickerStats {
  priceChange: number
  priceChangePercent: number
  high: number
  low: number
  volume: number
}

export interface TrendLine {
  id: string
  startTime: number
  startPrice: number
  endTime: number
  endPrice: number
  color: string
}

// Assets that have Binance USDT pairs
const BINANCE_SYMBOLS: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  AVAX: 'AVAXUSDT',
  DOGE: 'DOGEUSDT',
  LTC: 'LTCUSDT',
  BCH: 'BCHUSDT',
  XRP: 'XRPUSDT',
  ADA: 'ADAUSDT',
  BNB: 'BNBUSDT',
  ATOM: 'ATOMUSDT',
  SUI: 'SUIUSDT',
  ARB: 'ARBUSDT',
  GAIA: 'ATOMUSDT',
}

// Assets that need Midgard fallback
const MIDGARD_ASSETS: Record<string, string> = {
  RUNE: 'THOR.RUNE',
  THOR: 'THOR.RUNE',
  CACAO: 'MAYA.CACAO',
  MAYA: 'MAYA.CACAO',
  KUJI: 'KUJI.KUJI',
  DASH: 'DASH.DASH',
  ZEC: 'ZEC.ZEC',
  XRD: 'XRD.XRD',
  XMR: 'XMR.XMR',
}

export function getBinanceSymbol(asset: string): string | null {
  return BINANCE_SYMBOLS[asset] ?? null
}

export function getMidgardPool(asset: string): string | null {
  return MIDGARD_ASSETS[asset] ?? null
}

export function getDataSource(asset: string): 'binance' | 'midgard' {
  return BINANCE_SYMBOLS[asset] ? 'binance' : 'midgard'
}

export function getActualMidgardInterval(interval: TimeInterval): string {
  return MIDGARD_INTERVALS[interval]
}

// All tradeable assets
export const TRADE_ASSETS = [
  'BTC', 'ETH', 'SOL', 'AVAX', 'DOGE', 'LTC', 'BCH', 'XRP', 'ADA',
  'BNB', 'ARB', 'SUI', 'GAIA', 'THOR', 'MAYA', 'KUJI', 'DASH', 'ZEC',
  'XRD', 'XMR',
]

// Binance interval mapping
export const BINANCE_INTERVALS: Record<TimeInterval, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
  '1W': '1w',
}

// Midgard interval mapping (closest available)
export const MIDGARD_INTERVALS: Record<TimeInterval, string> = {
  '1m': '5min',
  '5m': '5min',
  '15m': 'hour',
  '1h': 'hour',
  '4h': 'hour',
  '1D': 'day',
  '1W': 'week',
}

// Trend line localStorage
const TREND_LINE_KEY_PREFIX = 'xchain-suite-trend-lines-'

export function loadTrendLines(asset: string): TrendLine[] {
  try {
    const raw = localStorage.getItem(TREND_LINE_KEY_PREFIX + asset)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTrendLines(asset: string, lines: TrendLine[]) {
  try {
    localStorage.setItem(TREND_LINE_KEY_PREFIX + asset, JSON.stringify(lines))
  } catch {
    // Best-effort persistence
  }
}
