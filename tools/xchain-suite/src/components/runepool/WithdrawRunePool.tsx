import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'

interface WithdrawRunePoolProps {
  thorchainAmm: any
  wallet: any
}

interface WithdrawResult {
  hash: string
  url?: string
}

export function WithdrawRunePool({ thorchainAmm, wallet }: WithdrawRunePoolProps) {
  const [withdrawPercent, setWithdrawPercent] = useState('100')
  const [affiliate, setAffiliate] = useState('')
  const [affiliateFee, setAffiliateFee] = useState('')
  const withdrawOp = useOperation<WithdrawResult>()

  // Convert percentage to basis points (100% = 10000 bps)
  const withdrawBps = Math.round(parseFloat(withdrawPercent || '0') * 100)

  const handleWithdraw = async () => {
    if (!thorchainAmm || !wallet) return
    if (withdrawBps <= 0 || withdrawBps > 10000) return

    await withdrawOp.execute(
      async () => {
        const params: any = {
          withdrawBps,
        }

        // Add affiliate params if provided
        if (affiliate) {
          params.affiliate = affiliate
          params.feeBps = parseInt(affiliateFee) || 0
        }

        const result = await thorchainAmm.withdrawFromRunePool(params)
        return result
      },
      { operation: 'withdrawRunePool', params: { withdrawBps, affiliate } }
    )
  }

  const generateCode = () => {
    const affiliateCode = affiliate
      ? `
  affiliate: '${affiliate}',
  feeBps: ${affiliateFee || '0'},`
      : ''

    return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Client as THORClient } from '@xchainjs/xchain-thorchain'
import { Wallet } from '@xchainjs/xchain-wallet'

// Initialize wallet with THORChain client
const wallet = new Wallet({
  THOR: new THORClient({ phrase: 'your seed phrase' }),
})
const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

// Withdraw ${withdrawPercent || '100'}% of RUNEPool position
const result = await thorchainAmm.withdrawFromRunePool({
  withdrawBps: ${withdrawBps || 10000}, // ${withdrawPercent || '100'}% in basis points${affiliateCode}
})

console.log('Withdraw TX:', result.hash)`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Withdraw Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Withdraw Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={withdrawPercent}
              onChange={(e) => setWithdrawPercent(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              %
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {withdrawBps > 0 && withdrawBps <= 10000
              ? `= ${withdrawBps} basis points`
              : 'Enter a value between 0 and 100'}
          </p>
        </div>

        {/* Quick Percentage Buttons */}
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setWithdrawPercent(pct.toString())}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                withdrawPercent === pct.toString()
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Optional Affiliate Settings */}
        <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            Affiliate Settings (Optional)
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Affiliate Address
              </label>
              <input
                type="text"
                value={affiliate}
                onChange={(e) => setAffiliate(e.target.value)}
                placeholder="thor1..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Affiliate Fee (basis points)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={affiliateFee}
                onChange={(e) => setAffiliateFee(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max 1000 bps (10%)
              </p>
            </div>
          </div>
        </details>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={withdrawBps <= 0 || withdrawBps > 10000 || withdrawOp.loading}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {withdrawOp.loading ? 'Withdrawing...' : `Withdraw ${withdrawPercent || 0}%`}
        </button>
      </div>

      {/* Result */}
      <ResultPanel loading={withdrawOp.loading} error={withdrawOp.error} duration={withdrawOp.duration}>
        {withdrawOp.result && (
          <div className="space-y-2">
            <p className="text-green-700 dark:text-green-300 font-medium">Withdrawal Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {withdrawOp.result.hash}
              </p>
            </div>
            {withdrawOp.result.url && (
              <a
                href={withdrawOp.result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View on Explorer
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      {/* Code Example */}
      <CodePreview code={generateCode()} title="Withdraw from RUNEPool" />
    </div>
  )
}
