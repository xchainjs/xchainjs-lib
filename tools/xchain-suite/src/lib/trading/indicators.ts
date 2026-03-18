import { OHLCVCandle } from './chartUtils'

export interface IndicatorPoint {
  time: number
  value: number
}

export interface MACDPoint {
  time: number
  macd: number
  signal: number
  histogram: number
}

/** Simple Moving Average */
export function sma(candles: OHLCVCandle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = []
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close
    }
    result.push({ time: candles[i].time, value: sum / period })
  }
  return result
}

/** Exponential Moving Average */
export function ema(candles: OHLCVCandle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return []

  const multiplier = 2 / (period + 1)
  const result: IndicatorPoint[] = []

  // Start with SMA for first value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += candles[i].close
  }
  let prev = sum / period
  result.push({ time: candles[period - 1].time, value: prev })

  for (let i = period; i < candles.length; i++) {
    const current = (candles[i].close - prev) * multiplier + prev
    result.push({ time: candles[i].time, value: current })
    prev = current
  }
  return result
}

/** Relative Strength Index (Wilder's smoothing) */
export function rsi(candles: OHLCVCandle[], period = 14): IndicatorPoint[] {
  if (candles.length < period + 1) return []

  const result: IndicatorPoint[] = []
  let avgGain = 0
  let avgLoss = 0

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close
    if (change > 0) avgGain += change
    else avgLoss += Math.abs(change)
  }
  avgGain /= period
  avgLoss /= period

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
  result.push({ time: candles[period].time, value: 100 - 100 / (1 + rs) })

  // Subsequent values using Wilder's smoothing
  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    const rsVal = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push({ time: candles[i].time, value: 100 - 100 / (1 + rsVal) })
  }
  return result
}

/** MACD (fast: 12, slow: 26, signal: 9) */
export function macd(
  candles: OHLCVCandle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDPoint[] {
  const fastEma = ema(candles, fastPeriod)
  const slowEma = ema(candles, slowPeriod)

  if (fastEma.length === 0 || slowEma.length === 0) return []

  // Align by time
  const slowTimes = new Map(slowEma.map((p) => [p.time, p.value]))
  const macdLine: IndicatorPoint[] = []
  for (const fp of fastEma) {
    const sv = slowTimes.get(fp.time)
    if (sv !== undefined) {
      macdLine.push({ time: fp.time, value: fp.value - sv })
    }
  }

  if (macdLine.length < signalPeriod) return []

  // Signal line = EMA of MACD line
  const multiplier = 2 / (signalPeriod + 1)
  let signalVal = 0
  for (let i = 0; i < signalPeriod; i++) {
    signalVal += macdLine[i].value
  }
  signalVal /= signalPeriod

  const result: MACDPoint[] = []
  result.push({
    time: macdLine[signalPeriod - 1].time,
    macd: macdLine[signalPeriod - 1].value,
    signal: signalVal,
    histogram: macdLine[signalPeriod - 1].value - signalVal,
  })

  for (let i = signalPeriod; i < macdLine.length; i++) {
    signalVal = (macdLine[i].value - signalVal) * multiplier + signalVal
    result.push({
      time: macdLine[i].time,
      macd: macdLine[i].value,
      signal: signalVal,
      histogram: macdLine[i].value - signalVal,
    })
  }
  return result
}
