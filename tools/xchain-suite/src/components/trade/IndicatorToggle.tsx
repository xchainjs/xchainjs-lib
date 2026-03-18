import { IndicatorState } from '../../hooks/useTechnicalIndicators'

interface Props {
  state: IndicatorState
  onChange: (state: IndicatorState) => void
}

const TOGGLES: { key: keyof IndicatorState; label: string; color: string }[] = [
  { key: 'sma20', label: 'SMA 20', color: 'bg-yellow-500' },
  { key: 'sma50', label: 'SMA 50', color: 'bg-orange-500' },
  { key: 'ema12', label: 'EMA 12', color: 'bg-cyan-500' },
  { key: 'ema26', label: 'EMA 26', color: 'bg-purple-500' },
  { key: 'rsi', label: 'RSI', color: 'bg-green-500' },
  { key: 'macd', label: 'MACD', color: 'bg-red-500' },
]

export function IndicatorToggle({ state, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOGGLES.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => onChange({ ...state, [key]: !state[key] })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            state[key]
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {label}
        </button>
      ))}
    </div>
  )
}
