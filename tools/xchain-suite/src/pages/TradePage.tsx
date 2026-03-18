import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { TimeInterval, TrendLine, loadTrendLines, saveTrendLines, getDataSource, getActualMidgardInterval } from '../lib/trading/chartUtils'
import { useOHLCV } from '../hooks/useOHLCV'
import { useTechnicalIndicators, IndicatorState } from '../hooks/useTechnicalIndicators'
import { AssetPairSelector } from '../components/trade/AssetPairSelector'
import { TimeIntervalSelector } from '../components/trade/TimeIntervalSelector'
import { CandlestickChart } from '../components/trade/CandlestickChart'
import { IndicatorPanel } from '../components/trade/IndicatorPanel'
import { IndicatorToggle } from '../components/trade/IndicatorToggle'
import { TrendLineManager } from '../components/trade/TrendLineManager'
import { AssetBalanceCard } from '../components/trade/AssetBalanceCard'
import { TradeOrderHistory } from '../components/trade/TradeOrderHistory'
import { QuickTradePanel } from '../components/trade/QuickTradePanel'

function formatVolume(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return v.toFixed(0)
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (p >= 1) return p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return p.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

const DEFAULT_ASSET = 'BTC'

export default function TradePage() {
  const [asset, setAsset] = useState(DEFAULT_ASSET)
  const [interval, setInterval] = useState<TimeInterval>('1h')
  const [indicatorState, setIndicatorState] = useState<IndicatorState>({
    sma20: false, sma50: false, ema12: false, ema26: false, rsi: false, macd: false,
  })
  const [trendLines, setTrendLines] = useState<TrendLine[]>(() => loadTrendLines(DEFAULT_ASSET))

  const { candles, ticker, loading, error, refresh } = useOHLCV(asset, interval)
  const indicators = useTechnicalIndicators(candles, indicatorState)

  const handleAssetChange = useCallback((newAsset: string) => {
    setAsset(newAsset)
    setTrendLines(loadTrendLines(newAsset))
  }, [])

  const handleAddTrendLine = useCallback((line: TrendLine) => {
    setTrendLines((prev) => {
      const next = [...prev, line]
      saveTrendLines(asset, next)
      return next
    })
  }, [asset])

  const handleRemoveTrendLine = useCallback((id: string) => {
    setTrendLines((prev) => {
      const next = prev.filter((l) => l.id !== id)
      saveTrendLines(asset, next)
      return next
    })
  }, [asset])

  const handleClearTrendLines = useCallback(() => {
    setTrendLines([])
    saveTrendLines(asset, [])
  }, [asset])

  const source = getDataSource(asset)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <AssetPairSelector selected={asset} onChange={handleAssetChange} />
            <TimeIntervalSelector selected={interval} onChange={setInterval} />
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded" title={source === 'midgard' ? `Actual interval: ${getActualMidgardInterval(interval)}` : undefined}>
              {source === 'binance' ? 'Binance' : `Midgard (${getActualMidgardInterval(interval)})`}
            </span>
            {ticker && (
              <>
                <span className={ticker.priceChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  24h: {ticker.priceChangePercent >= 0 ? '+' : ''}{ticker.priceChangePercent.toFixed(2)}%
                </span>
                <span>H: {formatPrice(ticker.high)}</span>
                <span>L: {formatPrice(ticker.low)}</span>
                <span>Vol: {formatVolume(ticker.volume)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {loading && candles.length === 0 ? (
          <div className="flex items-center justify-center h-[450px]">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              <span className="text-gray-600 dark:text-gray-300">Loading chart data...</span>
            </div>
          </div>
        ) : candles.length > 0 ? (
          <CandlestickChart
            candles={candles}
            indicators={indicators}
            trendLines={trendLines}
          />
        ) : !error ? (
          <div className="flex items-center justify-center h-[450px] text-gray-500 dark:text-gray-400">
            No chart data available
          </div>
        ) : null}
      </div>

      {/* Indicator sub-charts */}
      {(indicatorState.rsi || indicatorState.macd) && candles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <IndicatorPanel
            rsiData={indicators.rsi}
            macdData={indicators.macd}
            showRsi={indicatorState.rsi}
            showMacd={indicatorState.macd}
          />
        </div>
      )}

      {/* Controls: Indicators + Trend Lines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Indicators</div>
            <IndicatorToggle state={indicatorState} onChange={setIndicatorState} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Trend Lines</div>
            <TrendLineManager
              lines={trendLines}
              onAdd={handleAddTrendLine}
              onRemove={handleRemoveTrendLine}
              onClear={handleClearTrendLines}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Balance + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <AssetBalanceCard asset={asset} />
          <QuickTradePanel asset={asset} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Swap History — {asset}
          </h3>
          <TradeOrderHistory asset={asset} />
        </div>
      </div>
    </div>
  )
}
