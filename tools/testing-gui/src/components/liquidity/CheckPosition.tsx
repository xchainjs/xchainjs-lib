import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetFromStringEx, type Asset, type TokenAsset } from '@xchainjs/xchain-util'

interface CheckPositionProps {
  thorchainQuery: any
  wallet: any
  supportedChains: string[]
}

interface PositionResult {
  position: any
  poolShare: {
    assetShare: string
    runeShare: string
  }
  lpGrowth: string
  impermanentLossProtection: {
    ILProtection: string
    totalDays: string
  }
}

export function CheckPosition({ thorchainQuery, wallet, supportedChains }: CheckPositionProps) {
  const [pool, setPool] = useState('BTC.BTC')
  const [address, setAddress] = useState('')
  const { execute, result, error, loading, duration } = useOperation<PositionResult>()

  const handleCheck = async () => {
    if (!thorchainQuery) return

    await execute(async () => {
      const asset = assetFromStringEx(pool) as Asset | TokenAsset
      const queryAddress = address.trim() || (wallet ? await wallet.getAddress('THOR') : '')

      if (!queryAddress) {
        throw new Error('Please provide an address or connect wallet')
      }

      const lp = await thorchainQuery.checkLiquidityPosition(asset, queryAddress)

      return {
        position: lp.position,
        poolShare: {
          assetShare: lp.poolShare.assetShare.formatedAssetString(),
          runeShare: lp.poolShare.runeShare.formatedAssetString(),
        },
        lpGrowth: lp.lpGrowth,
        impermanentLossProtection: {
          ILProtection: lp.impermanentLossProtection.ILProtection.formatedAssetString(),
          totalDays: lp.impermanentLossProtection.totalDays,
        },
      }
    }, { operation: 'checkLiquidityPosition', params: { pool, address } })
  }

  const codeExample = `import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { assetFromStringEx } from '@xchainjs/xchain-util'

// Initialize query
const thorchainQuery = new ThorchainQuery()

// Check liquidity position
const asset = assetFromStringEx('${pool}')
const address = '${address || 'thor1...'}'

const position = await thorchainQuery.checkLiquidityPosition(asset, address)

console.log('Position:', position.position)
console.log('Asset Share:', position.poolShare.assetShare.formatedAssetString())
console.log('RUNE Share:', position.poolShare.runeShare.formatedAssetString())
console.log('LP Growth:', position.lpGrowth)
console.log('IL Protection:', position.impermanentLossProtection.ILProtection.formatedAssetString())`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Check your liquidity position in a THORChain pool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pool
          </label>
          <select
            value={pool}
            onChange={(e) => setPool(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedChains.filter(c => c !== 'THOR').map((chain) => (
              <option key={chain} value={`${chain}.${chain}`}>
                {chain}.{chain}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address (optional)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Leave empty to use wallet address"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={loading || !thorchainQuery}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Checking...' : 'Check Position'}
      </button>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Asset Share</p>
                <p className="text-lg font-mono text-gray-900 dark:text-gray-100">{result.poolShare.assetShare}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase mb-1">RUNE Share</p>
                <p className="text-lg font-mono text-gray-900 dark:text-gray-100">{result.poolShare.runeShare}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">LP Growth</p>
                <p className="text-lg font-mono text-gray-900 dark:text-gray-100">{result.lpGrowth}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase mb-1">IL Protection</p>
                <p className="text-lg font-mono text-gray-900 dark:text-gray-100">{result.impermanentLossProtection.ILProtection}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {result.impermanentLossProtection.totalDays} days
                </p>
              </div>
            </div>
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
