import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, TrendingUp, ChevronDown, AlertTriangle, CheckCircle, Clock, Pause, ArrowRightLeft, Droplets } from 'lucide-react'

type Protocol = 'thorchain' | 'mayachain'
type SortKey = 'tvl' | 'apy' | 'volume' | 'price'

// Pool data from THORNode/MAYANode endpoints
interface NodePool {
  asset: string
  status: string
  balance_asset: string
  balance_rune?: string      // THORChain
  balance_cacao?: string     // MAYAChain
  asset_tor_price?: string   // THORChain only
  trading_halted?: boolean   // THORChain only
  synth_mint_paused?: boolean
}

// Midgard pool data for additional metrics
interface MidgardPool {
  asset: string
  assetPriceUSD: string
  poolAPY: string
  volume24h: string
}

// THORNode/MAYANode endpoints for pool status
const NODE_ENDPOINTS = {
  thorchain: 'https://thornode.ninerealms.com/thorchain/pools',
  mayachain: 'https://mayanode.mayachain.info/mayachain/pools',
}

// Midgard endpoints for price/volume data
const MIDGARD_ENDPOINTS = {
  thorchain: 'https://midgard.ninerealms.com/v2/pools',
  mayachain: 'https://midgard.mayachain.info/v2/pools',
}

// Format large numbers with appropriate suffix
function formatCompact(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

function formatPrice(num: number): string {
  if (num >= 1000) return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  if (num >= 1) return `$${num.toFixed(2)}`
  if (num >= 0.01) return `$${num.toFixed(4)}`
  return `$${num.toFixed(6)}`
}

function formatPercent(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return '—'
  return `${num.toFixed(2)}%`
}

// All THORChain/MAYAChain amounts are normalized to 8 decimals
function fromBaseAmount(value: string): number {
  return parseFloat(value) / 1e8
}

function getAssetDisplay(asset: string): { chain: string; symbol: string } {
  const [chain, rest] = asset.split('.')
  const symbol = rest?.split('-')[0] || rest || chain
  return { chain, symbol }
}

function getChainColor(chain: string): string {
  const colors: Record<string, string> = {
    BTC: 'bg-orange-500',
    ETH: 'bg-blue-500',
    AVAX: 'bg-red-500',
    BSC: 'bg-yellow-500',
    GAIA: 'bg-purple-500',
    DOGE: 'bg-amber-400',
    LTC: 'bg-gray-400',
    BCH: 'bg-green-500',
    THOR: 'bg-cyan-500',
    MAYA: 'bg-blue-600',
    KUJI: 'bg-red-600',
    DASH: 'bg-blue-400',
    ARB: 'bg-blue-700',
    XRD: 'bg-green-600',
    ZEC: 'bg-yellow-600',
  }
  return colors[chain] || 'bg-gray-500'
}

interface CombinedPool {
  asset: string
  status: string
  tradingHalted: boolean
  synthMintPaused: boolean
  balanceAsset: number
  balanceNative: number  // RUNE or CACAO
  price: number
  apy: number
  volume: number
  tvl: number
}

export default function PoolsPage() {
  const navigate = useNavigate()
  const [protocol, setProtocol] = useState<Protocol>('thorchain')
  const [pools, setPools] = useState<CombinedPool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('tvl')
  const [sortDesc, setSortDesc] = useState(true)
  const [showAllStatuses, setShowAllStatuses] = useState(false)

  const fetchPools = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch from both node and midgard endpoints
      const [nodeResponse, midgardResponse] = await Promise.all([
        fetch(NODE_ENDPOINTS[protocol]),
        fetch(MIDGARD_ENDPOINTS[protocol]),
      ])

      if (!nodeResponse.ok) throw new Error('Failed to fetch pool status')
      if (!midgardResponse.ok) throw new Error('Failed to fetch pool metrics')

      const nodePools: NodePool[] = await nodeResponse.json()
      const midgardPools: MidgardPool[] = await midgardResponse.json()

      // Create a map of midgard data by asset
      const midgardMap = new Map(midgardPools.map(p => [p.asset, p]))

      // Combine data from both sources
      const combined: CombinedPool[] = nodePools.map(nodePool => {
        const midgardPool = midgardMap.get(nodePool.asset)
        const balanceAsset = fromBaseAmount(nodePool.balance_asset)
        const price = midgardPool ? parseFloat(midgardPool.assetPriceUSD) || 0 : 0
        const tvl = balanceAsset * price * 2

        return {
          asset: nodePool.asset,
          status: nodePool.status,
          tradingHalted: nodePool.trading_halted || false,
          synthMintPaused: nodePool.synth_mint_paused || false,
          balanceAsset,
          balanceNative: fromBaseAmount(nodePool.balance_rune || nodePool.balance_cacao || '0'),
          price,
          apy: midgardPool ? parseFloat(midgardPool.poolAPY) || 0 : 0,
          volume: midgardPool ? fromBaseAmount(midgardPool.volume24h) * price : 0,
          tvl,
        }
      })

      setPools(combined)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch pools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPools()
  }, [protocol])

  // Filter and sort pools
  const filteredPools = showAllStatuses
    ? pools
    : pools.filter(p => p.status.toLowerCase() === 'available')

  const sortedPools = [...filteredPools].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'tvl': comparison = a.tvl - b.tvl; break
      case 'volume': comparison = a.volume - b.volume; break
      case 'apy': comparison = a.apy - b.apy; break
      case 'price': comparison = a.price - b.price; break
    }
    return sortDesc ? -comparison : comparison
  })

  // Calculate totals from filtered pools
  const totalTVL = filteredPools.reduce((sum, p) => sum + p.tvl, 0)
  const totalVolume = filteredPools.reduce((sum, p) => sum + p.volume, 0)

  // Get status badge styling
  const getStatusBadge = (pool: CombinedPool) => {
    const status = pool.status.toLowerCase()
    if (pool.tradingHalted) {
      return {
        icon: Pause,
        text: 'Halted',
        className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      }
    }
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          text: 'Available',
          className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        }
      case 'staged':
        return {
          icon: Clock,
          text: 'Staged',
          className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        }
      case 'suspended':
        return {
          icon: AlertTriangle,
          text: 'Suspended',
          className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        }
      default:
        return {
          icon: AlertTriangle,
          text: pool.status,
          className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
        }
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(key)
      setSortDesc(true)
    }
  }

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider hover:text-gray-900 dark:hover:text-white transition-colors ${
        sortBy === sortKey ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {label}
      {sortBy === sortKey && (
        <ChevronDown className={`w-3 h-3 transition-transform ${sortDesc ? '' : 'rotate-180'}`} />
      )}
    </button>
  )

  return (
    <div className="h-full">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pools</h1>

            {/* Protocol Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setProtocol('thorchain')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  protocol === 'thorchain'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                THORChain
              </button>
              <button
                onClick={() => setProtocol('mayachain')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  protocol === 'mayachain'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                MAYAChain
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Stats */}
            {!loading && pools.length > 0 && (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">TVL </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCompact(totalTVL)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">24h Vol </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCompact(totalVolume)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Pools </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filteredPools.length}{!showAllStatuses && pools.length !== filteredPools.length ? ` / ${pools.length}` : ''}
                  </span>
                </div>
                {/* Show All Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllStatuses}
                    onChange={(e) => setShowAllStatuses(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 dark:text-gray-300">Show All</span>
                </label>
              </div>
            )}

            <button
              onClick={fetchPools}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="w-48 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pool</span>
              </div>
              <div className="w-28 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</span>
              </div>
              <div className="flex-1 flex justify-end pr-6">
                <SortHeader label="Price" sortKey="price" />
              </div>
              <div className="flex-1 flex justify-end pr-6">
                <SortHeader label="TVL" sortKey="tvl" />
              </div>
              <div className="flex-1 flex justify-end pr-6">
                <SortHeader label="Volume" sortKey="volume" />
              </div>
              <div className="w-24 flex justify-end">
                <SortHeader label="APY" sortKey="apy" />
              </div>
              <div className="w-36 shrink-0 flex justify-end">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</span>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {sortedPools.map((pool, index) => {
                const { chain, symbol } = getAssetDisplay(pool.asset)
                const statusBadge = getStatusBadge(pool)
                const StatusIcon = statusBadge.icon
                return (
                  <div
                    key={pool.asset}
                    className="flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    {/* Pool Info */}
                    <div className="w-48 shrink-0 flex items-center gap-3">
                      <span className="text-gray-400 dark:text-gray-500 text-sm w-6">{index + 1}</span>
                      <div className={`w-8 h-8 rounded-full ${getChainColor(chain)} flex items-center justify-center shrink-0`}>
                        <span className="text-white text-xs font-bold">{chain.slice(0, 2)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{symbol}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{chain}</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="w-28 shrink-0 flex items-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.text}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex-1 flex items-center justify-end pr-6">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(pool.price)}
                      </span>
                    </div>

                    {/* TVL */}
                    <div className="flex-1 flex items-center justify-end pr-6">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCompact(pool.tvl)}
                      </span>
                    </div>

                    {/* Volume */}
                    <div className="flex-1 flex items-center justify-end pr-6">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCompact(pool.volume)}
                      </span>
                    </div>

                    {/* APY */}
                    <div className="w-24 flex items-center justify-end">
                      {pool.apy > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {formatPercent(pool.apy)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-36 shrink-0 flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/swap?from=${pool.asset}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        title="Swap"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Swap
                      </button>
                      <button
                        onClick={() => navigate(`/liquidity?asset=${pool.asset}&protocol=${protocol}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                        title="Add Liquidity"
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        LP
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {sortedPools.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No pools available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
