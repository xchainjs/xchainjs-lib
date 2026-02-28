import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Wallet, AlertCircle } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { createClient } from '../lib/clients/factory'
import { SUPPORTED_CHAINS, type ChainConfig } from '../lib/chains'
import { AssetIcon } from '../components/swap/assetIcons'
import { PriceService, formatUsdValue, formatUsdPrice } from '../lib/pricing/PriceService'
import { baseToAsset } from '@xchainjs/xchain-util'
import type { Balance } from '@xchainjs/xchain-client'

interface ChainBalance {
  chain: ChainConfig
  address: string | null
  balances: { symbol: string; amount: string; usdValue: number | null }[]
  totalUsd: number | null
  loading: boolean
  error: string | null
}

// Chains that need async address retrieval
const ASYNC_ONLY_CHAINS = new Set(['SOL', 'XRD', 'ADA'])

export default function PortfolioPage() {
  const { isConnected, phrase, network } = useWallet()
  const navigate = useNavigate()
  const [chainBalances, setChainBalances] = useState<Map<string, ChainBalance>>(new Map())
  const [refreshing, setRefreshing] = useState(false)
  const fetchIdRef = useRef(0)

  const fetchAllBalances = useCallback(async () => {
    if (!phrase) return

    const currentFetchId = ++fetchIdRef.current
    setRefreshing(true)

    // Initialize all chains as loading
    const initial = new Map<string, ChainBalance>()
    for (const chain of SUPPORTED_CHAINS) {
      initial.set(chain.id, {
        chain,
        address: null,
        balances: [],
        totalUsd: null,
        loading: true,
        error: null,
      })
    }
    setChainBalances(new Map(initial))

    const priceService = new PriceService(network)

    // Fetch each chain independently
    const promises = SUPPORTED_CHAINS.map(async (chain) => {
      try {
        const client = createClient(chain.id, { phrase, network })

        // Get address
        let address: string
        try {
          if (ASYNC_ONLY_CHAINS.has(chain.id)) {
            address = await client.getAddressAsync()
          } else {
            address = client.getAddress()
          }
        } catch {
          address = await client.getAddressAsync()
        }

        // Get balances
        const rawBalances: Balance[] = await client.getBalance(address)

        // Get prices and build balance entries
        const balanceEntries: ChainBalance['balances'] = []
        let totalUsd = 0
        let hasAnyPrice = false

        for (const bal of rawBalances) {
          const assetAmount = baseToAsset(bal.amount)
          const amount = assetAmount.amount().toNumber()
          if (amount <= 0) continue

          const price = await priceService.getAssetPrice(bal.asset)
          const usdValue = price.usdPrice !== null ? amount * price.usdPrice : null
          if (usdValue !== null) {
            totalUsd += usdValue
            hasAnyPrice = true
          }

          balanceEntries.push({
            symbol: bal.asset.ticker || bal.asset.symbol,
            amount: amount < 0.000001 ? amount.toExponential(2) : amount.toFixed(6).replace(/0+$/, '').replace(/\.$/, ''),
            usdValue,
          })
        }

        // Sort by USD value (highest first), then by amount
        balanceEntries.sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0))

        if (currentFetchId !== fetchIdRef.current) return

        setChainBalances((prev) => {
          const next = new Map(prev)
          next.set(chain.id, {
            chain,
            address,
            balances: balanceEntries,
            totalUsd: hasAnyPrice ? totalUsd : null,
            loading: false,
            error: null,
          })
          return next
        })
      } catch (e: any) {
        if (currentFetchId !== fetchIdRef.current) return

        setChainBalances((prev) => {
          const next = new Map(prev)
          next.set(chain.id, {
            chain,
            address: null,
            balances: [],
            totalUsd: null,
            loading: false,
            error: e.message || 'Failed to fetch',
          })
          return next
        })
      }
    })

    await Promise.allSettled(promises)
    if (currentFetchId === fetchIdRef.current) {
      setRefreshing(false)
    }
  }, [phrase, network])

  useEffect(() => {
    if (isConnected && phrase) {
      fetchAllBalances()
    }
  }, [isConnected, phrase, fetchAllBalances])

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Connect Wallet</h2>
            <p className="text-gray-500 dark:text-gray-400">Connect your wallet to view your portfolio across all chains.</p>
          </div>
        </div>
      </div>
    )
  }

  // Compute totals
  const entries = Array.from(chainBalances.values())
  const loadedEntries = entries.filter((e) => !e.loading)
  const totalUsd = loadedEntries.reduce((sum, e) => sum + (e.totalUsd ?? 0), 0)
  const chainsWithBalance = loadedEntries.filter((e) => e.balances.length > 0)
  const chainsLoading = entries.filter((e) => e.loading).length
  const chainsWithErrors = loadedEntries.filter((e) => e.error)

  // Group by category
  const groups = [
    { name: 'UTXO', chains: entries.filter((e) => e.chain.category === 'utxo') },
    { name: 'EVM', chains: entries.filter((e) => e.chain.category === 'evm') },
    { name: 'Cosmos', chains: entries.filter((e) => e.chain.category === 'cosmos') },
    { name: 'Other', chains: entries.filter((e) => e.chain.category === 'other') },
  ]

  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Balances across {SUPPORTED_CHAINS.length} chains
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* Total Value */}
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {chainsLoading > 0 ? (
                  <span className="flex items-center gap-2">
                    {totalUsd > 0 ? formatUsdValue(totalUsd) : '...'}
                    <span className="text-xs font-normal text-gray-400">({chainsLoading} loading)</span>
                  </span>
                ) : (
                  formatUsdValue(totalUsd) || '$0.00'
                )}
              </p>
            </div>
            <button
              onClick={fetchAllBalances}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Refresh all balances"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {groups.map((group) => (
          <div key={group.name}>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {group.name}
            </h2>
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
              {group.chains.map((entry) => (
                <ChainCard key={entry.chain.id} entry={entry} onNavigate={(chainId) => navigate(`/chain/${chainId}`)} />
              ))}
            </div>
          </div>
        ))}

        {/* Errors Summary */}
        {chainsWithErrors.length > 0 && !refreshing && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                {chainsWithErrors.length} chain{chainsWithErrors.length > 1 ? 's' : ''} failed to load:
                {' '}{chainsWithErrors.map((e) => e.chain.id).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ChainCard({ entry, onNavigate }: { entry: ChainBalance; onNavigate: (chainId: string) => void }) {
  const { chain, address, balances, totalUsd, loading, error } = entry

  return (
    <button
      type="button"
      onClick={() => onNavigate(chain.id)}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
    >
      <div className="flex items-center gap-3">
        <AssetIcon chainId={chain.id} symbol={chain.symbol} size={36} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{chain.name}</span>
            {loading ? (
              <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            ) : totalUsd !== null && totalUsd > 0 ? (
              <span className="font-semibold text-gray-900 dark:text-white">{formatUsdValue(totalUsd)}</span>
            ) : null}
          </div>
          {loading ? (
            <div className="mt-1 h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ) : error ? (
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 truncate">{error}</p>
          ) : balances.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">No balance</p>
          ) : (
            <div className="mt-1 space-y-0.5">
              {balances.slice(0, 3).map((bal) => (
                <div key={bal.symbol} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {bal.amount} {bal.symbol}
                  </span>
                  {bal.usdValue !== null && bal.usdValue > 0 && (
                    <span className="text-gray-400 dark:text-gray-500">{formatUsdValue(bal.usdValue)}</span>
                  )}
                </div>
              ))}
              {balances.length > 3 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">+{balances.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      </div>
      {address && !loading && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{address}</p>
      )}
    </button>
  )
}
