import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { TRADE_ASSETS } from '../../lib/trading/chartUtils'

interface Props {
  selected: string
  onChange: (asset: string) => void
}

export function AssetPairSelector({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {selected}/USD
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto w-48">
          {TRADE_ASSETS.map((asset) => (
            <button
              key={asset}
              onClick={() => { onChange(asset); setOpen(false) }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                asset === selected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {asset}/USD
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
