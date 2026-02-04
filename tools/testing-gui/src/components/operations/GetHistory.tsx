import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import type { XChainClient, Tx } from '@xchainjs/xchain-client'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

interface GetHistoryProps {
  chainId: string
  client: XChainClient | null
}

interface HistoryResult {
  transactions: Tx[]
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

export function GetHistory({ chainId, client }: GetHistoryProps) {
  const [address, setAddress] = useState('')
  const { execute, result, error, loading, duration } = useOperation<HistoryResult>()

  const handleExecute = async () => {
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }
      const targetAddress = address.trim() || client.getAddress(0)
      const response = await client.getTransactions({ address: targetAddress })
      return { transactions: response.txs || [] }
    })
  }

  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const getExplorerUrl = (txHash: string): string | null => {
    const baseUrl = EXPLORER_TX_URLS[chainId]
    return baseUrl ? `${baseUrl}${txHash}` : null
  }

  const formatAmount = (tx: Tx): string => {
    if (tx.from.length === 0 && tx.to.length === 0) return '-'
    const firstTo = tx.to[0]
    if (!firstTo) return '-'
    try {
      const assetAmt = baseToAsset(firstTo.amount)
      return formatAssetAmountCurrency({ amount: assetAmt, trimZeros: true })
    } catch {
      return firstTo.amount.amount().toString()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Transaction History
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          View recent transactions for an address on {chainId}. Leave empty to use wallet address.
        </p>
      </div>

      <div>
        <label
          htmlFor="historyAddress"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address (optional)
        </label>
        <input
          type="text"
          id="historyAddress"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={`Enter ${chainId} address or leave empty for wallet address`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleExecute}
          disabled={loading || !client}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get History'}
        </button>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.transactions.map((tx, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={getExplorerUrl(tx.hash) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-mono"
                      >
                        {truncateHash(tx.hash)}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {tx.type || 'transfer'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {tx.from[0] ? truncateHash(tx.from[0].from) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {tx.to[0] ? truncateHash(tx.to[0].to) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-mono">
                      {formatAmount(tx)}
                    </td>
                  </tr>
                ))}
                {result.transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm text-gray-500 text-center"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </ResultPanel>
    </div>
  )
}
