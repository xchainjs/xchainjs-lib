import { TimeInterval } from '../../lib/trading/chartUtils'

const INTERVALS: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']

interface Props {
  selected: TimeInterval
  onChange: (interval: TimeInterval) => void
}

export function TimeIntervalSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {INTERVALS.map((interval) => (
        <button
          key={interval}
          onClick={() => onChange(interval)}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            selected === interval
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {interval}
        </button>
      ))}
    </div>
  )
}
