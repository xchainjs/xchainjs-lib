import { useState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { TrendLine } from '../../lib/trading/chartUtils'

interface Props {
  lines: TrendLine[]
  onAdd: (line: TrendLine) => void
  onRemove: (id: string) => void
  onClear: () => void
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']

export function TrendLineManager({ lines, onAdd, onRemove, onClear }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [startPrice, setStartPrice] = useState('')
  const [endPrice, setEndPrice] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [color, setColor] = useState(COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startPrice || !endPrice || !startDate || !endDate) return

    const parsedStartPrice = parseFloat(startPrice)
    const parsedEndPrice = parseFloat(endPrice)
    const parsedStartTime = Math.floor(new Date(startDate).getTime() / 1000)
    const parsedEndTime = Math.floor(new Date(endDate).getTime() / 1000)

    if (!Number.isFinite(parsedStartPrice) || !Number.isFinite(parsedEndPrice) ||
        isNaN(parsedStartTime) || isNaN(parsedEndTime)) return

    onAdd({
      id: crypto.randomUUID(),
      startTime: parsedStartTime,
      startPrice: parsedStartPrice,
      endTime: parsedEndTime,
      endPrice: parsedEndPrice,
      color,
    })

    setStartPrice('')
    setEndPrice('')
    setStartDate('')
    setEndDate('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Draw Line
        </button>
        {lines.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Price</label>
              <input
                type="number"
                step="any"
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                placeholder="e.g. 65000"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Price</label>
              <input
                type="number"
                step="any"
                value={endPrice}
                onChange={(e) => setEndPrice(e.target.value)}
                placeholder="e.g. 70000"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 dark:text-gray-400">Color:</label>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                  aria-pressed={color === c}
                  className={`w-5 h-5 rounded-full border-2 transition-colors ${
                    color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Line
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {lines.length > 0 && (
        <div className="mt-2 space-y-1">
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: line.color, display: 'inline-block' }} />
                <span>${line.startPrice.toLocaleString()} → ${line.endPrice.toLocaleString()}</span>
              </div>
              <button onClick={() => onRemove(line.id)} className="p-0.5 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
