import { useState, useEffect } from 'react'
import { TrendingUp, Droplets, DollarSign, Activity, RefreshCw } from 'lucide-react'

type Protocol = 'thorchain' | 'mayachain'

interface Pool {
  asset: string
  status: string
  assetDepth: string
  runeDepth: string
  assetPriceUSD: string
  poolAPY: string
  volume24h: string
  liquidityUnits: string
}

const ENDPOINTS = {
  thorchain: 'https://midgard.ninerealms.com/v2/pools',
  mayachain: 'https://midgard.mayachain.info/v2/pools',
}

const NATIVE_ASSET = {
  thorchain: 'RUNE',
  mayachain: 'CACAO',
}

function formatNumber(value: string | number, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'

  if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`
  return num.toFixed(decimals)
}

function formatUSD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '$0.00'
  return `$${formatNumber(num)}`
}

function formatPercent(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return '0%'
  return `${num.toFixed(2)}%`
}

// Convert base amount to display amount (8 decimals for most chains)
function toDisplayAmount(baseAmount: string, decimals = 8): number {
  return parseFloat(baseAmount) / Math.pow(10, decimals)
}

function getAssetName(asset: string): string {
  // Extract just the asset name without contract address
  const parts = asset.split('.')
  if (parts.length < 2) return asset
  const assetPart = parts[1].split('-')[0]
  return `${parts[0]}.${assetPart}`
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'staged':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'suspended':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

function PoolCard({ pool, nativeAsset }: { pool: Pool; nativeAsset: string }) {
  const assetDepthDisplay = toDisplayAmount(pool.assetDepth)
  const runeDepthDisplay = toDisplayAmount(pool.runeDepth)
  const volume24hDisplay = toDisplayAmount(pool.volume24h)
  const tvlUSD = assetDepthDisplay * parseFloat(pool.assetPriceUSD) * 2 // Total pool value

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getAssetName(pool.asset)}
          </h3>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(pool.status)}`}>
            {pool.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatUSD(parseFloat(pool.assetPriceUSD))}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* APY */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">APY</span>
          </div>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            {formatPercent(pool.poolAPY)}
          </p>
        </div>

        {/* TVL */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">TVL</span>
          </div>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {formatUSD(tvlUSD)}
          </p>
        </div>

        {/* Volume 24h */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">24h Volume</span>
          </div>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
            {formatUSD(volume24hDisplay * parseFloat(pool.assetPriceUSD))}
          </p>
        </div>

        {/* Depth */}
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
            <Droplets className="w-4 h-4" />
            <span className="text-xs font-medium">Depth</span>
          </div>
          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            {formatNumber(assetDepthDisplay)} / {formatNumber(runeDepthDisplay)}
          </p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">
            Asset / {nativeAsset}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PoolsPage() {
  const [protocol, setProtocol] = useState<Protocol>('thorchain')
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'tvl' | 'apy' | 'volume'>('tvl')

  const fetchPools = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(ENDPOINTS[protocol])
      if (!response.ok) throw new Error('Failed to fetch pools')
      const data = await response.json()
      setPools(data)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch pools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPools()
  }, [protocol])

  // Sort pools
  const sortedPools = [...pools]
    .filter(p => p.status.toLowerCase() === 'available')
    .sort((a, b) => {
      switch (sortBy) {
        case 'apy':
          return parseFloat(b.poolAPY || '0') - parseFloat(a.poolAPY || '0')
        case 'volume':
          return parseFloat(b.volume24h || '0') - parseFloat(a.volume24h || '0')
        case 'tvl':
        default:
          const tvlA = toDisplayAmount(a.assetDepth) * parseFloat(a.assetPriceUSD) * 2
          const tvlB = toDisplayAmount(b.assetDepth) * parseFloat(b.assetPriceUSD) * 2
          return tvlB - tvlA
      }
    })

  // Calculate totals
  const totalTVL = sortedPools.reduce((sum, p) => {
    return sum + toDisplayAmount(p.assetDepth) * parseFloat(p.assetPriceUSD) * 2
  }, 0)

  const totalVolume = sortedPools.reduce((sum, p) => {
    return sum + toDisplayAmount(p.volume24h) * parseFloat(p.assetPriceUSD)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Liquidity Pools</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View pools on THORChain and MAYAChain
            </p>
          </div>

          {/* Protocol Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setProtocol('thorchain')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                protocol === 'thorchain'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              THORChain
            </button>
            <button
              onClick={() => setProtocol('mayachain')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                protocol === 'mayachain'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              MAYAChain
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && !error && pools.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-80">Total Value Locked</p>
              <p className="text-2xl font-bold">{formatUSD(totalTVL)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-80">24h Volume</p>
              <p className="text-2xl font-bold">{formatUSD(totalVolume)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-80">Active Pools</p>
              <p className="text-2xl font-bold">{sortedPools.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tvl">TVL</option>
            <option value="apy">APY</option>
            <option value="volume">24h Volume</option>
          </select>
        </div>
        <button
          onClick={fetchPools}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Pool Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPools.map((pool) => (
            <PoolCard key={pool.asset} pool={pool} nativeAsset={NATIVE_ASSET[protocol]} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sortedPools.length === 0 && (
        <div className="text-center py-12">
          <Droplets className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pools found</p>
        </div>
      )}
    </div>
  )
}
