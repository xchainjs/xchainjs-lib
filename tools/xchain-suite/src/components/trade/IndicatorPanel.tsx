import { useEffect, useRef } from 'react'
import { createChart, IChartApi, Time, LineData, HistogramData } from 'lightweight-charts'
import { IndicatorPoint, MACDPoint } from '../../lib/trading/indicators'

interface Props {
  rsiData: IndicatorPoint[]
  macdData: MACDPoint[]
  showRsi: boolean
  showMacd: boolean
}

export function IndicatorPanel({ rsiData, macdData, showRsi, showMacd }: Props) {
  const rsiRef = useRef<HTMLDivElement>(null)
  const macdRef = useRef<HTMLDivElement>(null)
  const rsiChartRef = useRef<IChartApi | null>(null)
  const macdChartRef = useRef<IChartApi | null>(null)

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const chartOptions = {
    height: 120,
    layout: {
      background: { color: isDark ? '#1f2937' : '#ffffff' },
      textColor: isDark ? '#d1d5db' : '#374151',
    },
    grid: {
      vertLines: { color: isDark ? '#374151' : '#e5e7eb' },
      horzLines: { color: isDark ? '#374151' : '#e5e7eb' },
    },
    rightPriceScale: { borderColor: isDark ? '#4b5563' : '#d1d5db' },
    timeScale: { borderColor: isDark ? '#4b5563' : '#d1d5db', timeVisible: true, visible: true },
    crosshair: { mode: 0 as const },
  }

  // RSI chart
  useEffect(() => {
    if (!showRsi || !rsiRef.current || rsiData.length === 0) return

    const chart = createChart(rsiRef.current, {
      ...chartOptions,
      width: rsiRef.current.clientWidth,
    })

    const series = chart.addLineSeries({
      color: '#22c55e',
      lineWidth: 1,
      priceLineVisible: false,
    })

    // Add 70/30 reference lines
    const line70 = chart.addLineSeries({ color: '#ef4444', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false })
    const line30 = chart.addLineSeries({ color: '#22c55e', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false })

    const data: LineData[] = rsiData.map((d) => ({ time: d.time as Time, value: d.value }))
    series.setData(data)

    if (rsiData.length >= 2) {
      const times = [rsiData[0].time as Time, rsiData[rsiData.length - 1].time as Time]
      line70.setData(times.map((t) => ({ time: t, value: 70 })))
      line30.setData(times.map((t) => ({ time: t, value: 30 })))
    }

    rsiChartRef.current = chart

    const ro = new ResizeObserver((entries) => chart.applyOptions({ width: entries[0].contentRect.width }))
    ro.observe(rsiRef.current)

    return () => { ro.disconnect(); chart.remove(); rsiChartRef.current = null }
  }, [showRsi, rsiData])

  // MACD chart
  useEffect(() => {
    if (!showMacd || !macdRef.current || macdData.length === 0) return

    const chart = createChart(macdRef.current, {
      ...chartOptions,
      width: macdRef.current.clientWidth,
    })

    const macdLine = chart.addLineSeries({ color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    const signalLine = chart.addLineSeries({ color: '#f97316', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
    const histogram = chart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false })

    macdLine.setData(macdData.map((d) => ({ time: d.time as Time, value: d.macd })))
    signalLine.setData(macdData.map((d) => ({ time: d.time as Time, value: d.signal })))
    histogram.setData(macdData.map((d) => ({
      time: d.time as Time,
      value: d.histogram,
      color: d.histogram >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)',
    } as HistogramData)))

    macdChartRef.current = chart

    const ro = new ResizeObserver((entries) => chart.applyOptions({ width: entries[0].contentRect.width }))
    ro.observe(macdRef.current)

    return () => { ro.disconnect(); chart.remove(); macdChartRef.current = null }
  }, [showMacd, macdData])

  if (!showRsi && !showMacd) return null

  return (
    <div className="space-y-2">
      {showRsi && rsiData.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">RSI (14)</div>
          <div ref={rsiRef} className="w-full rounded-lg overflow-hidden" />
        </div>
      )}
      {showMacd && macdData.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">MACD (12, 26, 9)</div>
          <div ref={macdRef} className="w-full rounded-lg overflow-hidden" />
        </div>
      )}
    </div>
  )
}
