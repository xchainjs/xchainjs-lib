import { useState, useEffect } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import type { XChainClient } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount, baseToAsset } from '@xchainjs/xchain-util'
import { getChainById } from '../../lib/chains'

interface TransferProps {
  chainId: string
  client: XChainClient | null
}

interface TransferResult {
  txHash: string
}

const EXPLORER_TX_URLS: Record<string, string> = {
  BTC: 'https://blockstream.info/tx/',
  BCH: 'https://blockchair.com/bitcoin-cash/transaction/',
  LTC: 'https://blockchair.com/litecoin/transaction/',
  DOGE: 'https://blockchair.com/dogecoin/transaction/',
  DASH: 'https://blockchair.com/dash/transaction/',
  ETH: 'https://etherscan.io/tx/',
  AVAX: 'https://snowtrace.io/tx/',
  BSC: 'https://bscscan.com/tx/',
  ARB: 'https://arbiscan.io/tx/',
  GAIA: 'https://www.mintscan.io/cosmos/txs/',
  THOR: 'https://runescan.io/tx/',
  MAYA: 'https://www.mayascan.org/tx/',
  KUJI: 'https://finder.kujira.network/kaiyo-1/tx/',
  SOL: 'https://solscan.io/tx/',
  XRD: 'https://dashboard.radixdlt.com/transaction/',
  ADA: 'https://cardanoscan.io/transaction/',
}

export function Transfer({ chainId, client }: TransferProps) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<TransferResult>()

  // Fetch balance when client is available
  useEffect(() => {
    const fetchBalance = async () => {
      if (!client) {
        setMaxBalance(null)
        return
      }
      setLoadingBalance(true)
      try {
        const address = await client.getAddressAsync(0)
        const balances = await client.getBalance(address)
        if (balances.length > 0) {
          const chainInfo = getChainById(chainId)
          const decimals = chainInfo?.decimals ?? 8
          const assetAmt = baseToAsset(balances[0].amount)
          setMaxBalance(assetAmt.amount().toFixed(decimals))
        } else {
          setMaxBalance('0')
        }
      } catch (e) {
        console.error('Failed to fetch balance for max:', e)
        setMaxBalance(null)
      } finally {
        setLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [client, chainId])

  const handleMax = () => {
    if (maxBalance) {
      setAmount(maxBalance)
    }
  }

  const handleExecute = async () => {
    setShowConfirm(false)
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }
      const chainInfo = getChainById(chainId)
      const decimals = chainInfo?.decimals ?? 8
      const baseAmt = assetToBase(assetAmount(amount, decimals))
      const txHash = await client.transfer({
        recipient,
        amount: baseAmt,
        memo: memo || undefined,
      })
      return { txHash }
    })
  }

  const getExplorerUrl = (txHash: string): string | null => {
    const baseUrl = EXPLORER_TX_URLS[chainId]
    return baseUrl ? `${baseUrl}${txHash}` : null
  }

  const explorerUrl = result ? getExplorerUrl(result.txHash) : null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Transfer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Send tokens on {chainId}. Double-check all inputs before confirming.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={`Enter ${chainId} address`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Amount
            </label>
            {maxBalance !== null && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Available: {maxBalance}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={handleMax}
              disabled={!maxBalance || loadingBalance}
              className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingBalance ? '...' : 'Max'}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="memo"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Memo (optional)
          </label>
          <input
            type="text"
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Optional memo"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || !client || !recipient.trim() || !amount.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Transfer'}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Transfer
            </h4>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recipient</p>
                <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">{recipient}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{amount}</p>
              </div>
              {memo && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Memo</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{memo}</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This action cannot be undone. Please verify all details before
                confirming.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Transaction Hash
              </p>
              <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                {result.txHash}
              </code>
            </div>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View on Explorer
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        )}
      </ResultPanel>
    </div>
  )
}
