import { useState, useEffect } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import {
  assetFromStringEx,
  assetAmount,
  assetToBase,
  baseToAsset,
  CryptoAmount,
  AssetCryptoAmount,
  type Asset,
  type TokenAsset,
} from '@xchainjs/xchain-util'

interface AddLiquidityProps {
  thorchainAmm: any
  wallet: any
  supportedChains: string[]
}

interface AddLpResult {
  hash: string
  url?: string
}

export function AddLiquidity({ thorchainAmm, wallet, supportedChains }: AddLiquidityProps) {
  const [pool, setPool] = useState('BTC.BTC')
  const [runeAmount, setRuneAmount] = useState('')
  const [assetAmountInput, setAssetAmountInput] = useState('')
  const [runeBalance, setRuneBalance] = useState<string | null>(null)
  const [assetBalance, setAssetBalance] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<AddLpResult>()

  // Get chain from pool
  const poolChain = pool.split('.')[0]

  // Fetch balances
  useEffect(() => {
    if (!wallet) return

    const fetchBalances = async () => {
      try {
        // RUNE balance
        const runeBalances = await wallet.getBalance('THOR')
        const rune = runeBalances.find((b: any) => b.asset.symbol === 'RUNE')
        if (rune) {
          setRuneBalance(baseToAsset(rune.amount).amount().toFixed(4))
        }

        // Asset balance
        const assetBalances = await wallet.getBalance(poolChain)
        if (assetBalances.length > 0) {
          setAssetBalance(baseToAsset(assetBalances[0].amount).amount().toFixed(8))
        }
      } catch (e) {
        console.warn('Failed to fetch balances:', e)
      }
    }

    fetchBalances()
  }, [wallet, poolChain])

  const handleAddLiquidity = async () => {
    if (!thorchainAmm || !wallet) return

    setShowConfirm(false)

    await execute(async () => {
      const runeAsset = assetFromStringEx('THOR.RUNE') as Asset
      const poolAsset = assetFromStringEx(pool) as Asset | TokenAsset

      // Get decimals for the pool asset
      const decimals = poolChain === 'ETH' || poolChain === 'AVAX' || poolChain === 'BSC' ? 18 : 8

      const rune = new AssetCryptoAmount(
        assetToBase(assetAmount(runeAmount, 8)),
        runeAsset
      )

      const asset = new CryptoAmount(
        assetToBase(assetAmount(assetAmountInput, decimals)),
        poolAsset
      )

      const result = await thorchainAmm.addLiquidityPosition({
        asset,
        rune,
      })

      return {
        hash: result.hash || result,
        url: result.url,
      }
    }, { operation: 'addLiquidityPosition', params: { pool, runeAmount, assetAmount: assetAmountInput } })
  }

  const codeExample = `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Wallet } from '@xchainjs/xchain-wallet'
import {
  assetFromStringEx,
  assetAmount,
  assetToBase,
  CryptoAmount,
  AssetCryptoAmount,
} from '@xchainjs/xchain-util'

// Initialize AMM with wallet
const wallet = new Wallet({ /* your clients */ })
const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

// Define amounts
const runeAsset = assetFromStringEx('THOR.RUNE')
const poolAsset = assetFromStringEx('${pool}')

const rune = new AssetCryptoAmount(
  assetToBase(assetAmount(${runeAmount || '0'}, 8)),
  runeAsset
)

const asset = new CryptoAmount(
  assetToBase(assetAmount(${assetAmountInput || '0'}, 8)),
  poolAsset
)

// Add liquidity
const result = await thorchainAmm.addLiquidityPosition({
  asset,
  rune,
})

console.log('Transaction:', result)`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add liquidity to a THORChain pool. You can provide RUNE only, asset only, or both (symmetric).
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                RUNE Amount
              </label>
              {runeBalance && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Balance: {runeBalance}
                </span>
              )}
            </div>
            <input
              type="text"
              value={runeAmount}
              onChange={(e) => setRuneAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {poolChain} Amount
              </label>
              {assetBalance && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Balance: {assetBalance}
                </span>
              )}
            </div>
            <input
              type="text"
              value={assetAmountInput}
              onChange={(e) => setAssetAmountInput(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> Adding liquidity requires both a RUNE transaction and an asset transaction.
            Make sure you have enough balance on both chains.
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || !thorchainAmm || (!runeAmount && !assetAmountInput)}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding Liquidity...' : 'Add Liquidity'}
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Add Liquidity
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Pool</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{pool}</span>
              </div>
              {runeAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">RUNE</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{runeAmount}</span>
                </div>
              )}
              {assetAmountInput && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{poolChain}</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{assetAmountInput}</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This action will add your funds to the liquidity pool. Withdrawal may be subject to impermanent loss.
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
                onClick={handleAddLiquidity}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              Liquidity Added Successfully!
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
