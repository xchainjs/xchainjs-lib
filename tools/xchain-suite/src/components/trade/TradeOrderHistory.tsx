import { useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { getHistory, SwapHistoryEntry } from '../../lib/swap/SwapHistory'

interface Props {
  asset: string
}

export function TradeOrderHistory({ asset }: Props) {
  const entries = useMemo(() => {
    const all = getHistory()
    return all.filter((e) => {
      const from = e.fromAsset.split('.')[0]
      const to = e.toAsset.split('.')[0]
      return from === asset || to === asset
    }).slice(0, 10)
  }, [asset])

  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
        No swap history for {asset}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <TradeOrderRow key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

function TradeOrderRow({ entry }: { entry: SwapHistoryEntry }) {
  const fromChain = entry.fromAsset.split('.')[0]
  const toChain = entry.toAsset.split('.')[0]
  const date = new Date(entry.timestamp)
  const statusColor =
    entry.status === 'completed' ? 'text-green-600 dark:text-green-400' :
    entry.status === 'failed' ? 'text-red-600 dark:text-red-400' :
    'text-yellow-600 dark:text-yellow-400'

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
      <div className="flex flex-col">
        <span className="text-gray-900 dark:text-gray-100">
          {entry.inputAmount} {fromChain} → {entry.expectedOutput} {toChain}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {date.toLocaleDateString()} {date.toLocaleTimeString()} · {entry.protocol}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${statusColor}`}>
          {entry.status}
        </span>
        {entry.explorerUrl && (
          <a
            href={entry.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
