import { useState, useEffect, useCallback } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { getChainById } from '../../lib/chains'
import { getExplorerTxUrl } from './constants'
import type { FeeRates } from '@xchainjs/xchain-client'
import { baseToAsset, baseAmount } from '@xchainjs/xchain-util'

// UTXO client type with transferMax method
interface UtxoClient {
  getAddressAsync: (index: number) => Promise<string>
  getBalance: (address: string) => Promise<{ amount: { amount: () => bigint } }[]>
  getFeeRates: () => Promise<FeeRates>
  transferMax: (params: {
    recipient: string
    memo?: string
    feeRate?: number
  }) => Promise<{ hash: string; maxAmount: number; fee: number }>
}

interface SweepProps {
  chainId: string
  client: UtxoClient | null
}

interface SweepResult {
  txHash: string
  amountSent: string
  fee: string
}

export function Sweep({ chainId, client }: SweepProps) {
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const [feeRate, setFeeRate] = useState<number | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<SweepResult>()

  const chainInfo = getChainById(chainId)
  const decimals = chainInfo?.decimals ?? 8
  const symbol = chainInfo?.symbol ?? chainId

  // Fetch balance - extracted as callback so it can be reused after sweep
  const fetchBalance = useCallback(async () => {
    if (!client) {
      setBalance(null)
      return
    }
    try {
      const address = await client.getAddressAsync(0)
      const balances = await client.getBalance(address)
      if (balances.length > 0) {
        const assetAmt = baseToAsset(baseAmount(balances[0].amount.amount().toString(), decimals))
        setBalance(assetAmt.amount().toFixed(decimals))
      } else {
        setBalance('0')
      }
    } catch (e) {
      console.error('Failed to fetch balance:', e)
      setBalance(null)
    }
  }, [client, decimals])

  // Fetch balance and fee rate when client is available
  useEffect(() => {
    const fetchInfo = async () => {
      if (!client) {
        setBalance(null)
        setFeeRate(null)
        return
      }
      setLoadingInfo(true)

      // Fetch balance
      await fetchBalance()

      // Fetch fee rate separately so balance still shows if this fails
      try {
        const feeRates = await client.getFeeRates()
        setFeeRate(feeRates.fast)
      } catch (e) {
        console.error('Failed to fetch fee rates:', e)
        setFeeRate(null)
      }

      setLoadingInfo(false)
    }
    fetchInfo()
  }, [client, chainId, fetchBalance])

  // Reset balance to 0 after successful sweep
  useEffect(() => {
    if (result) {
      setBalance('0')
    }
  }, [result])

  const handleExecute = async () => {
    setShowConfirm(false)
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }

      const txResult = await client.transferMax({
        recipient,
        memo: memo || undefined,
        feeRate: feeRate ?? undefined,
      })

      // Convert satoshis to asset amount for display
      const amountAsset = baseToAsset(baseAmount(txResult.maxAmount, decimals))
      const feeAsset = baseToAsset(baseAmount(txResult.fee, decimals))

      return {
        txHash: txResult.hash,
        amountSent: amountAsset.amount().toFixed(decimals),
        fee: feeAsset.amount().toFixed(decimals),
      }
    })
  }

  const explorerUrl = result ? getExplorerTxUrl(chainId, result.txHash) : null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Sweep (Send Max)</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Send all available {symbol} to a recipient address. This uses all UTXOs and calculates the maximum sendable amount after fees.
        </p>
      </div>

      {/* Balance Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance</span>
          <span className="text-lg font-mono font-medium text-gray-900 dark:text-gray-100">
            {loadingInfo ? '...' : balance !== null ? `${balance} ${symbol}` : 'N/A'}
          </span>
        </div>
        {feeRate && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Fee Rate (fast)</span>
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {feeRate} sat/byte
            </span>
          </div>
        )}
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
            placeholder="Optional memo (adds OP_RETURN output)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || !client || !recipient.trim() || balance === '0' || balance === null}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sweeping...' : 'Sweep All Funds'}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Sweep
            </h4>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recipient</p>
                <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">{recipient}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount (approx)</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  ~{balance} {symbol} (minus fees)
                </p>
              </div>
              {memo && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Memo</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{memo}</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Warning:</strong> This will send ALL funds from this wallet. This action cannot be undone.
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
                Confirm Sweep
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Amount Sent
                </p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {result.amountSent} {symbol}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Fee Paid
                </p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {result.fee} {symbol}
                </p>
              </div>
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
