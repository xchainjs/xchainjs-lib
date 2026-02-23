import { useState, useEffect, useRef } from 'react'
import { ChevronDown, X, Search } from 'lucide-react'
import { AssetIcon, POPULAR_CHAIN_IDS } from './assetIcons'

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
  excludeChain?: string
}

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
  {
    name: 'Other',
    chains: [
      { chainId: 'SOL', chainName: 'Solana', symbol: 'SOL' },
    ],
  },
]

// Flat lookup for popular chips
const ALL_CHAINS = CHAIN_GROUPS.flatMap((g) => g.chains)

export function AssetSelector({
  label,
  value,
  onChange,
  availableChains,
  disabled = false,
  excludeChain,
}: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Autofocus search after modal animation
      const t = setTimeout(() => searchRef.current?.focus(), 50)
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  const isAvailable = (chain: ChainAsset) =>
    availableChains.includes(chain.chainId) && chain.chainId !== excludeChain

  // Filter groups by availability + search
  const query = search.toLowerCase().trim()
  const filteredGroups = CHAIN_GROUPS.map((group) => ({
    ...group,
    chains: group.chains.filter((chain) => {
      if (!isAvailable(chain)) return false
      if (!query) return true
      return (
        chain.chainName.toLowerCase().includes(query) ||
        chain.symbol.toLowerCase().includes(query) ||
        chain.chainId.toLowerCase().includes(query)
      )
    }),
  })).filter((group) => group.chains.length > 0)

  const totalResults = filteredGroups.reduce((n, g) => n + g.chains.length, 0)

  const popularChains = POPULAR_CHAIN_IDS
    .map((id) => ALL_CHAINS.find((c) => c.chainId === id)!)
    .filter(isAvailable)

  const handleSelect = (asset: ChainAsset) => {
    onChange(asset)
    setIsOpen(false)
    setSearch('')
  }

  const openModal = () => {
    if (!disabled) {
      setSearch('')
      setIsOpen(true)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={openModal}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left transition-colors ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700'
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-3">
            <AssetIcon chainId={value.chainId} symbol={value.symbol} size={32} />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{value.chainName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{value.symbol}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">Select asset...</span>
        )}
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 animate-backdrop-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-[101] w-full max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl animate-modal-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select Asset
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or symbol..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Popular chips (hidden when searching) */}
            {!query && popularChains.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {popularChains.map((chain) => (
                  <button
                    key={chain.chainId}
                    onClick={() => handleSelect(chain)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      value?.chainId === chain.chainId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <AssetIcon chainId={chain.chainId} symbol={chain.symbol} size={18} />
                    {chain.symbol}
                  </button>
                ))}
              </div>
            )}

            {/* Asset list */}
            <div className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
              {totalResults === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                  No assets found
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.name}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 sticky top-0">
                      {group.name}
                    </div>
                    {group.chains.map((chain) => (
                      <button
                        key={chain.chainId}
                        onClick={() => handleSelect(chain)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          value?.chainId === chain.chainId
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : ''
                        }`}
                      >
                        <AssetIcon chainId={chain.chainId} symbol={chain.symbol} size={32} />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {chain.chainName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {chain.symbol}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { ChainAsset }
