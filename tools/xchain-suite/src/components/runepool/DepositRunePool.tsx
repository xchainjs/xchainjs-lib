import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

interface DepositRunePoolProps {
  thorchainAmm: any
  wallet: any
}

interface DepositResult {
  hash: string
  url?: string
}

export function DepositRunePool({ thorchainAmm, wallet }: DepositRunePoolProps) {
  const [amount, setAmount] = useState('')
  const depositOp = useOperation<DepositResult>()

  const handleDeposit = async () => {
    if (!thorchainAmm || !wallet || !amount) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await depositOp.execute(
      async () => {
        // Import AssetCryptoAmount and AssetRuneNative dynamically
        const { AssetCryptoAmount } = await import('@xchainjs/xchain-util')
        const { AssetRuneNative } = await import('@xchainjs/xchain-thorchain')

        const runeAmount = new AssetCryptoAmount(
          assetToBase(assetAmount(amountNum, 8)), // RUNE has 8 decimals
          AssetRuneNative
        )

        const result = await thorchainAmm.depositToRunePool({
          amount: runeAmount,
        })
        return result
      },
      { operation: 'depositRunePool', params: { amount } }
    )
  }

  const generateCode = () => {
    return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { AssetCryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { AssetRuneNative, Client as THORClient } from '@xchainjs/xchain-thorchain'
import { Wallet } from '@xchainjs/xchain-wallet'

// Initialize wallet with THORChain client
const wallet = new Wallet({
  THOR: new THORClient({ phrase: 'your seed phrase' }),
})
const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

// Deposit ${amount || '100'} RUNE to RUNEPool
const runeAmount = new AssetCryptoAmount(
  assetToBase(assetAmount(${amount || '100'}, 8)),
  AssetRuneNative
)

const result = await thorchainAmm.depositToRunePool({
  amount: runeAmount,
})

console.log('Deposit TX:', result.hash)`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount (RUNE)
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              RUNE
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum deposit varies based on network conditions
          </p>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!amount || depositOp.loading}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {depositOp.loading ? 'Depositing...' : 'Deposit RUNE'}
        </button>
      </div>

      {/* Result */}
      <ResultPanel loading={depositOp.loading} error={depositOp.error} duration={depositOp.duration}>
        {depositOp.result && (
          <div className="space-y-2">
            <p className="text-green-700 dark:text-green-300 font-medium">Deposit Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {depositOp.result.hash}
              </p>
            </div>
            {depositOp.result.url && (
              <a
                href={depositOp.result.url}
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
      <CodePreview code={generateCode()} title="Deposit to RUNEPool" />
    </div>
  )
}
