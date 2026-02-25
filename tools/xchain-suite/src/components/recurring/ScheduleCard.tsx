import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Pause, Play, XCircle } from 'lucide-react'
import { AssetIcon } from '../swap/assetIcons'
import type { RecurringSchedule, ExecutionRecord, RecurringInterval } from '../../lib/swap/RecurringSwapScheduler'

const INTERVAL_LABELS: Record<RecurringInterval, string> = {
  every_minute: 'Every Minute',
  every_5min: 'Every 5 Minutes',
  every_15min: 'Every 15 Minutes',
  every_30min: 'Every 30 Minutes',
  every_hour: 'Every Hour',
  every_4h: 'Every 4 Hours',
  every_day: 'Every Day',
  every_week: 'Every Week',
}

function StatusBadge({ status }: { status: RecurringSchedule['status'] }) {
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function Countdown({ targetMs }: { targetMs: number }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, targetMs - Date.now())
      if (diff === 0) {
        setRemaining('Executing...')
        return
      }
      const s = Math.floor(diff / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      if (h > 0) setRemaining(`${h}h ${m % 60}m`)
      else if (m > 0) setRemaining(`${m}m ${s % 60}s`)
      else setRemaining(`${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return <span className="font-mono text-sm">{remaining}</span>
}

function HistoryRow({ record }: { record: ExecutionRecord }) {
  const statusStyles = {
    success: 'text-green-600 dark:text-green-400',
    failed: 'text-red-600 dark:text-red-400',
    skipped: 'text-yellow-600 dark:text-yellow-400',
  }
  const time = new Date(record.executedAt).toLocaleString()

  return (
    <tr className="border-t border-gray-100 dark:border-gray-700 text-xs">
      <td className="py-1.5 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</td>
      <td className={`py-1.5 pr-3 font-medium ${statusStyles[record.status]}`}>
        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
      </td>
      <td className="py-1.5 text-gray-600 dark:text-gray-300 break-all">
        {record.txHash && (
          <span className="font-mono">{record.txHash.slice(0, 12)}...</span>
        )}
        {record.error && <span className="text-red-500">{record.error}</span>}
        {record.skipReason && <span>{record.skipReason}</span>}
      </td>
    </tr>
  )
}

interface ScheduleCardProps {
  schedule: RecurringSchedule
  history: ExecutionRecord[]
  onPause: () => void
  onResume: () => void
  onCancel: () => void
}

export function ScheduleCard({ schedule, history, onPause, onResume, onCancel }: ScheduleCardProps) {
  const [expanded, setExpanded] = useState(false)

  const successCount = history.filter((r) => r.status === 'success').length
  const failCount = history.filter((r) => r.status === 'failed').length
  const skipCount = history.filter((r) => r.status === 'skipped').length

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <AssetIcon chainId={schedule.fromAsset.chainId} symbol={schedule.fromAsset.symbol} size={24} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {schedule.amount} {schedule.fromAsset.symbol}
              </span>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-1.5">
              <AssetIcon chainId={schedule.toAsset.chainId} symbol={schedule.toAsset.symbol} size={24} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {schedule.toAsset.symbol}
              </span>
            </div>
          </div>
          <StatusBadge status={schedule.status} />
        </div>

        {/* Details row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{INTERVAL_LABELS[schedule.interval]}</span>
          <span>via {schedule.protocol}</span>
          <span>Max slip: {schedule.maxSlippageBps / 100}%</span>
          {schedule.status === 'active' && schedule.nextExecutionAt && (
            <span className="flex items-center gap-1">
              Next: <Countdown targetMs={schedule.nextExecutionAt} />
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Total: {schedule.totalExecutions}
          </span>
          {successCount > 0 && <span className="text-green-600 dark:text-green-400">{successCount} ok</span>}
          {failCount > 0 && <span className="text-red-600 dark:text-red-400">{failCount} failed</span>}
          {skipCount > 0 && <span className="text-yellow-600 dark:text-yellow-400">{skipCount} skipped</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {schedule.status === 'active' && (
            <button
              onClick={onPause}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
            >
              <Pause className="w-3 h-3" /> Pause
            </button>
          )}
          {schedule.status === 'paused' && (
            <button
              onClick={onResume}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <Play className="w-3 h-3" /> Resume
            </button>
          )}
          {schedule.status !== 'cancelled' && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <XCircle className="w-3 h-3" /> Cancel
            </button>
          )}
          {history.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ml-auto"
            >
              History ({history.length})
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* History table */}
      {expanded && history.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 max-h-60 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400">
                <th className="text-left pb-1.5 pr-3 font-medium">Time</th>
                <th className="text-left pb-1.5 pr-3 font-medium">Status</th>
                <th className="text-left pb-1.5 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 20).map((record) => (
                <HistoryRow key={record.id} record={record} />
              ))}
            </tbody>
          </table>
          {history.length > 20 && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Showing 20 of {history.length} records
            </p>
          )}
        </div>
      )}
    </div>
  )
}
