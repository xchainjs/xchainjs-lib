import { useMemo } from 'react'
import { OHLCVCandle } from '../lib/trading/chartUtils'
import { sma, ema, rsi, macd, IndicatorPoint, MACDPoint } from '../lib/trading/indicators'

export interface IndicatorState {
  sma20: boolean
  sma50: boolean
  ema12: boolean
  ema26: boolean
  rsi: boolean
  macd: boolean
}

export interface IndicatorData {
  sma20: IndicatorPoint[]
  sma50: IndicatorPoint[]
  ema12: IndicatorPoint[]
  ema26: IndicatorPoint[]
  rsi: IndicatorPoint[]
  macd: MACDPoint[]
}

export function useTechnicalIndicators(
  candles: OHLCVCandle[],
  enabled: IndicatorState
): IndicatorData {
  return useMemo(() => ({
    sma20: enabled.sma20 ? sma(candles, 20) : [],
    sma50: enabled.sma50 ? sma(candles, 50) : [],
    ema12: enabled.ema12 ? ema(candles, 12) : [],
    ema26: enabled.ema26 ? ema(candles, 26) : [],
    rsi: enabled.rsi ? rsi(candles, 14) : [],
    macd: enabled.macd ? macd(candles) : [],
  }), [candles, enabled.sma20, enabled.sma50, enabled.ema12, enabled.ema26, enabled.rsi, enabled.macd])
}
