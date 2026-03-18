import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, Time } from 'lightweight-charts'
import { OHLCVCandle, TrendLine } from '../../lib/trading/chartUtils'
import { IndicatorData } from '../../hooks/useTechnicalIndicators'

interface Props {
  candles: OHLCVCandle[]
  indicators: IndicatorData
  trendLines: TrendLine[]
  height?: number
}

export function CandlestickChart({ candles, indicators, trendLines, height = 450 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const lineSeriesRefs = useRef<ISeriesApi<'Line'>[]>([])

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: isDark ? '#1f2937' : '#ffffff' },
        textColor: isDark ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#e5e7eb' },
        horzLines: { color: isDark ? '#374151' : '#e5e7eb' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: isDark ? '#4b5563' : '#d1d5db' },
      timeScale: {
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        timeVisible: true,
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      chart.applyOptions({ width })
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      lineSeriesRefs.current = []
    }
  }, [height])

  // Update candle + volume data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open
        ? (isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.4)')
        : (isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.4)'),
    }))

    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)
  }, [candles])

  // Update indicator overlays + trend lines
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    // Remove old line series
    for (const series of lineSeriesRefs.current) {
      chart.removeSeries(series)
    }
    lineSeriesRefs.current = []

    const addLine = (data: { time: number; value: number }[], color: string, lineWidth = 1) => {
      if (data.length === 0) return
      const series = chart.addLineSeries({
        color,
        lineWidth: lineWidth as 1 | 2 | 3 | 4,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      const lineData: LineData[] = data.map((d) => ({ time: d.time as Time, value: d.value }))
      series.setData(lineData)
      lineSeriesRefs.current.push(series)
    }

    // Indicator overlays
    addLine(indicators.sma20, '#eab308', 1)  // yellow
    addLine(indicators.sma50, '#f97316', 1)  // orange
    addLine(indicators.ema12, '#06b6d4', 1)  // cyan
    addLine(indicators.ema26, '#a855f7', 1)  // purple

    // Trend lines
    for (const tl of trendLines) {
      addLine(
        [
          { time: tl.startTime, value: tl.startPrice },
          { time: tl.endTime, value: tl.endPrice },
        ],
        tl.color,
        2
      )
    }
  }, [indicators.sma20, indicators.sma50, indicators.ema12, indicators.ema26, trendLines])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
