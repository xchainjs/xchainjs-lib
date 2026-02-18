import { useState, useEffect, useCallback } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { getChainById } from '../../lib/chains'
import { getExplorerTxUrl } from './constants'
import { baseToAsset, baseAmount, assetToBase, assetAmount } from '@xchainjs/xchain-util'
import type { FeeRates } from '@xchainjs/xchain-client'

interface UTXO {
  hash: string
  index: number
  value: number
  witnessUtxo?: { value: number; script: Buffer }
  txHex?: string
  scriptPubKey?: string
}

interface CoinControlClient {
  getAddressAsync: (index: number) => Promise<string>
  getUTXOs: (address: string, confirmedOnly?: boolean) => Promise<UTXO[]>
  getFeeRates: () => Promise<FeeRates>
  transfer: (params: {
    amount: { amount: () => { toNumber: () => number } }
    recipient: string
    memo?: string
    feeRate?: number
    selectedUtxos?: UTXO[]
  }) => Promise<string>
}

interface CoinControlProps {
  chainId: string
  client: CoinControlClient | null
}

interface TransferResult {
  txHash: string
  amountSent: string
  fee: string
}

export function CoinControl({ chainId, client }: CoinControlProps) {
  const [utxos, setUtxos] = useState<UTXO[]>([])
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [feeRate, setFeeRate] = useState<number | null>(null)
  const [loadingUtxos, setLoadingUtxos] = useState(false)
  const [utxoError, setUtxoError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<TransferResult>()

  const chainInfo = getChainById(chainId)
  const decimals = chainInfo?.decimals ?? 8
  const symbol = chainInfo?.symbol ?? chainId

  const selectedUtxos = Array.from(selectedIndices).map((i) => utxos[i])
  const selectedTotal = selectedUtxos.reduce((sum, u) => sum + u.value, 0)
  const selectedTotalDisplay = baseToAsset(baseAmount(selectedTotal, decimals)).amount().toFixed(decimals)

  const fetchUtxos = useCallback(async () => {
    if (!client) return
    setLoadingUtxos(true)
    setUtxoError(null)
    try {
      const address = await client.getAddressAsync(0)
      const fetched = await client.getUTXOs(address, true)
      setUtxos(fetched)
      setSelectedIndices(new Set())
    } catch (e) {
      setUtxoError((e as Error).message)
      setUtxos([])
    } finally {
      setLoadingUtxos(false)
    }
  }, [client])

  // Fetch UTXOs and fee rate on mount / client change
  useEffect(() => {
    void fetchUtxos()
    if (client) {
      void client
        .getFeeRates()
        .then((rates) => setFeeRate(rates.fast))
        .catch(() => setFeeRate(null))
    }
  }, [client, chainId, fetchUtxos])

  const toggleUtxo = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const selectAll = () => setSelectedIndices(new Set(utxos.map((_, i) => i)))
  const deselectAll = () => setSelectedIndices(new Set())

  const fillMax = () => {
    // Estimate fee: ~148 bytes per input + ~34 per output (1 recipient + potential memo) + 10 overhead
    const estimatedVsize = selectedUtxos.length * 148 + 2 * 34 + 10
    const estimatedFee = feeRate ? Math.ceil(estimatedVsize * feeRate) : 0
    const maxSendable = Math.max(0, selectedTotal - estimatedFee)
    setAmount(baseToAsset(baseAmount(maxSendable, decimals)).amount().toFixed(decimals))
  }

  const handleExecute = async () => {
    setShowConfirm(false)
    await execute(async () => {
      if (!client) throw new Error('Client not available')
      if (selectedUtxos.length === 0) throw new Error('No UTXOs selected')

      const amountBase = assetToBase(assetAmount(amount, decimals))

      const txHash = await client.transfer({
        amount: amountBase,
        recipient,
        memo: memo || undefined,
        feeRate: feeRate ?? undefined,
        selectedUtxos,
      })

      return {
        txHash,
        amountSent: amount,
        fee: 'included',
      }
    })
  }

  const truncateHash = (hash: string) => (hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : hash)

  const explorerUrl = result ? getExplorerTxUrl(chainId, result.txHash) : null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Coin Control</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Browse and select specific UTXOs to spend. Choose which coins to include in your transaction.
        </p>
      </div>

      {/* UTXO Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">UTXOs ({utxos.length})</span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              disabled={utxos.length === 0}
              className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              disabled={selectedIndices.size === 0}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              Deselect All
            </button>
            <button
              onClick={() => void fetchUtxos()}
              disabled={loadingUtxos}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              {loadingUtxos ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loadingUtxos ? (
          <div className="flex items-center gap-3 p-6 justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading UTXOs...</p>
          </div>
        ) : utxoError ? (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">{utxoError}</div>
        ) : utxos.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No UTXOs found for this address
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="w-10 px-4 py-2"></th>
                  <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">TxID</th>
                  <th className="text-center px-4 py-2 text-gray-600 dark:text-gray-400 font-medium w-16">Index</th>
                  <th className="text-right px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">
                    Value ({symbol})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {utxos.map((utxo, idx) => {
                  const isSelected = selectedIndices.has(idx)
                  const valueDisplay = baseToAsset(baseAmount(utxo.value, decimals)).amount().toFixed(decimals)
                  return (
                    <tr
                      key={`${utxo.hash}:${utxo.index}`}
                      onClick={() => toggleUtxo(idx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleUtxo(idx)
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {truncateHash(utxo.hash)}
                      </td>
                      <td className="px-4 py-2 text-center font-mono text-gray-700 dark:text-gray-300">{utxo.index}</td>
                      <td className="px-4 py-2 text-right font-mono text-gray-900 dark:text-gray-100">
                        {valueDisplay}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedIndices.size > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedIndices.size} UTXO{selectedIndices.size > 1 ? 's' : ''} selected
            </span>
            <span className="text-sm font-mono font-medium text-blue-900 dark:text-blue-100">
              {selectedTotalDisplay} {symbol}
            </span>
          </div>
          {feeRate && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-blue-600 dark:text-blue-400">Fee Rate (fast)</span>
              <span className="text-xs font-mono text-blue-700 dark:text-blue-300">{feeRate} sat/byte</span>
            </div>
          )}
        </div>
      )}

      {/* Transfer Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="cc-recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            id="cc-recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={`Enter ${chainId} address`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="cc-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount ({symbol})
            </label>
            {selectedIndices.size > 0 && (
              <button
                onClick={fillMax}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Fill Max ({selectedTotalDisplay})
              </button>
            )}
          </div>
          <input
            type="text"
            id="cc-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div>
          <label htmlFor="cc-memo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Memo (optional)
          </label>
          <input
            type="text"
            id="cc-memo"
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
          disabled={loading || !client || !recipient.trim() || !amount.trim() || selectedIndices.size === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send with Selected UTXOs'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Confirm Transaction</h4>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recipient</p>
                <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">{recipient}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {amount} {symbol}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Selected UTXOs</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedIndices.size} UTXOs ({selectedTotalDisplay} {symbol})
                </p>
              </div>
              {memo && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Memo</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{memo}</p>
                </div>
              )}
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Only the selected UTXOs will be used as inputs. Ensure the total covers the
                amount plus fees.
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
                onClick={() => void handleExecute()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
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
              <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">{result.txHash}</code>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Amount Sent
              </p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {result.amountSent} {symbol}
              </p>
            </div>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View on Explorer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
