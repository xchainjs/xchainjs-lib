import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface ChainAsset {
  chainId: string
  chainName: string
  symbol: string
}

interface ChainGroup {
  name: string
  chains: ChainAsset[]
}

interface AssetSelectorProps {
  label: string
  value: ChainAsset | null
  onChange: (asset: ChainAsset) => void
  availableChains: string[]
  disabled?: boolean
  excludeChain?: string // Exclude a chain (e.g., can't swap to same chain)
}

// Chain groups with their native assets
const CHAIN_GROUPS: ChainGroup[] = [
  {
    name: 'UTXO',
    chains: [
      { chainId: 'BTC', chainName: 'Bitcoin', symbol: 'BTC' },
      { chainId: 'BCH', chainName: 'Bitcoin Cash', symbol: 'BCH' },
      { chainId: 'LTC', chainName: 'Litecoin', symbol: 'LTC' },
      { chainId: 'DOGE', chainName: 'Dogecoin', symbol: 'DOGE' },
      { chainId: 'DASH', chainName: 'Dash', symbol: 'DASH' },
    ],
  },
  {
    name: 'EVM',
    chains: [
      { chainId: 'ETH', chainName: 'Ethereum', symbol: 'ETH' },
      { chainId: 'AVAX', chainName: 'Avalanche', symbol: 'AVAX' },
      { chainId: 'BSC', chainName: 'BNB Smart Chain', symbol: 'BNB' },
      { chainId: 'ARB', chainName: 'Arbitrum', symbol: 'ETH' },
    ],
  },
  {
    name: 'Cosmos',
    chains: [
      { chainId: 'GAIA', chainName: 'Cosmos Hub', symbol: 'ATOM' },
      { chainId: 'THOR', chainName: 'THORChain', symbol: 'RUNE' },
      { chainId: 'MAYA', chainName: 'Maya Protocol', symbol: 'CACAO' },
      { chainId: 'KUJI', chainName: 'Kujira', symbol: 'KUJI' },
    ],
  },
]

export function AssetSelector({
  label,
  value,
  onChange,
  availableChains,
  disabled = false,
  excludeChain,
}: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter groups to only show available chains
  const filteredGroups = CHAIN_GROUPS.map((group) => ({
    ...group,
    chains: group.chains.filter(
      (chain) => availableChains.includes(chain.chainId) && chain.chainId !== excludeChain
    ),
  })).filter((group) => group.chains.length > 0)

  const handleSelect = (asset: ChainAsset) => {
    onChange(asset)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left transition-colors ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700'
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {value.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{value.chainName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{value.symbol}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">Select asset...</span>
        )}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div key={group.name}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 sticky top-0">
                {group.name}
              </div>
              {group.chains.map((chain) => (
                <button
                  key={chain.chainId}
                  onClick={() => handleSelect(chain)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    value?.chainId === chain.chainId ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {chain.symbol.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {chain.chainName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{chain.symbol}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export type { ChainAsset }
