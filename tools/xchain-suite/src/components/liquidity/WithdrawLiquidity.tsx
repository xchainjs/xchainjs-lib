import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetFromStringEx, type Asset, type TokenAsset } from '@xchainjs/xchain-util'

interface WithdrawLiquidityProps {
  thorchainAmm: any
  wallet: any
  supportedChains: string[]
}

interface WithdrawResult {
  hash: string
  url?: string
}

export function WithdrawLiquidity({ thorchainAmm, wallet, supportedChains }: WithdrawLiquidityProps) {
  const [pool, setPool] = useState('BTC.BTC')
  const [percentage, setPercentage] = useState('100')
  const [showConfirm, setShowConfirm] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<WithdrawResult>()

  const poolChain = pool.split('.')[0]

  const handleWithdraw = async () => {
    if (!thorchainAmm || !wallet) return

    setShowConfirm(false)

    await execute(async () => {
      const poolAsset = assetFromStringEx(pool) as Asset | TokenAsset
      const assetAddress = await wallet.getAddress(poolChain)
      const runeAddress = await wallet.getAddress('THOR')

      const result = await thorchainAmm.withdrawLiquidityPosition({
        asset: poolAsset,
        percentage: Number(percentage),
        assetAddress,
        runeAddress,
      })

      return {
        hash: result.hash || result,
        url: result.url,
      }
    }, { operation: 'withdrawLiquidityPosition', params: { pool, percentage } })
  }

  const codeExample = `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Wallet } from '@xchainjs/xchain-wallet'
import { assetFromStringEx } from '@xchainjs/xchain-util'

// Initialize AMM with wallet
const wallet = new Wallet({ /* your clients */ })
const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

// Define withdrawal parameters
const poolAsset = assetFromStringEx('${pool}')
const percentage = ${percentage} // 100 = full withdrawal

// Get addresses for receiving funds
const assetAddress = await wallet.getAddress('${poolChain}')
const runeAddress = await wallet.getAddress('THOR')

// Withdraw liquidity
const result = await thorchainAmm.withdrawLiquidityPosition({
  asset: poolAsset,
  percentage,
  assetAddress,
  runeAddress,
})

console.log('Transaction:', result)`

  const percentageOptions = [25, 50, 75, 100]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Withdraw liquidity from a THORChain pool. You can withdraw a percentage of your position.
        </p>
      </div>

      <div className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Withdrawal Percentage
          </label>
          <div className="flex gap-2 mb-2">
            {percentageOptions.map((pct) => (
              <button
                key={pct}
                onClick={() => setPercentage(String(pct))}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  percentage === String(pct)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter a value between 1 and 100
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Funds will be sent to your {poolChain} address and THOR address.
            The withdrawal uses a memo transaction from your THOR address.
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || !thorchainAmm || !percentage}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Withdrawing...' : 'Withdraw Liquidity'}
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Withdrawal
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Pool</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{pool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Percentage</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{percentage}%</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This will withdraw {percentage}% of your liquidity position. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              Withdrawal Submitted Successfully!
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
              <p className="font-mono text-gray-900 dark:text-gray-100 break-all mt-1">
                {result.hash}
              </p>
            </div>
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on Explorer
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
