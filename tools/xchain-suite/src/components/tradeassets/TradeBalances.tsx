import { useState, useCallback } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { TradeAssetIcon } from './TradeAssetIcon'
import { baseToAsset, assetToString } from '@xchainjs/xchain-util'
import { RefreshCw } from 'lucide-react'

interface TradeBalancesProps {
  thorchainQuery: any
  mayachainQuery: any
  wallet: any
}

interface TradeBalance {
  protocol: 'THORChain' | 'MAYAChain'
  asset: string
  chainId: string
  symbol: string
  balance: string
}

// Extract chainId from trade asset string like "THOR.BTC~BTC" or "BTC~BTC"
function parseChainFromAsset(assetStr: string): { chainId: string; symbol: string } {
  // Remove protocol prefix if present (THOR. or MAYA.)
  const withoutPrefix = assetStr.includes('.') ? assetStr.split('.')[1] : assetStr
  // Trade symbols are like BTC~BTC, GAIA~ATOM
  const parts = withoutPrefix.split('~')
  return { chainId: parts[0] || 'BTC', symbol: parts[1] || parts[0] || '?' }
}

export function TradeBalances({ thorchainQuery, mayachainQuery, wallet }: TradeBalancesProps) {
  const [balances, setBalances] = useState<TradeBalance[]>([])
  const fetchOp = useOperation<TradeBalance[]>()

  const fetchBalances = useCallback(async () => {
    if (!wallet) return

    await fetchOp.execute(
      async () => {
        const results: TradeBalance[] = []

        const [thorResult, mayaResult] = await Promise.allSettled([
          (async () => {
            if (!thorchainQuery) return []
            const thorAddress = await wallet.getAddress('THOR')
            return thorchainQuery.getAddressTradeAccounts({ address: thorAddress })
          })(),
          (async () => {
            if (!mayachainQuery) return []
            const mayaAddress = await wallet.getAddress('MAYA')
            return mayachainQuery.getAddressTradeAccounts({ address: mayaAddress })
          })(),
        ])

        if (thorResult.status === 'fulfilled' && Array.isArray(thorResult.value)) {
          for (const account of thorResult.value) {
            const bal = account.balance || account.units
            const assetStr = assetToString(bal?.asset || account.asset)
            const { chainId, symbol } = parseChainFromAsset(assetStr)
            results.push({
              protocol: 'THORChain',
              asset: assetStr,
              chainId,
              symbol,
              balance: baseToAsset(bal?.baseAmount || bal?.amount?.baseAmount).amount().toFixed(8),
            })
          }
        }

        if (mayaResult.status === 'fulfilled' && Array.isArray(mayaResult.value)) {
          for (const account of mayaResult.value) {
            const bal = account.units || account.balance
            const assetStr = assetToString(bal?.asset || account.asset)
            const { chainId, symbol } = parseChainFromAsset(assetStr)
            results.push({
              protocol: 'MAYAChain',
              asset: assetStr,
              chainId,
              symbol,
              balance: baseToAsset(bal?.baseAmount || bal?.amount?.baseAmount).amount().toFixed(8),
            })
          }
        }

        setBalances(results)
        return results
      },
      { operation: 'fetchTradeBalances' }
    )
  }, [thorchainQuery, mayachainQuery, wallet, fetchOp])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View your trade asset holdings across protocols.
        </p>
        <button
          onClick={fetchBalances}
          disabled={fetchOp.loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={fetchOp.loading ? 'animate-spin' : ''} />
          {fetchOp.loading ? 'Loading...' : 'Fetch Balances'}
        </button>
      </div>

      <ResultPanel loading={fetchOp.loading} error={fetchOp.error} duration={fetchOp.duration}>
        {fetchOp.result && (
          <div>
            {balances.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No trade assets found. Deposit assets to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {balances.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                  >
                    <TradeAssetIcon chainId={b.chainId} symbol={b.symbol} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{b.asset}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        b.protocol === 'THORChain'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      }`}>
                        {b.protocol}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                      {b.balance}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ResultPanel>
    </div>
  )
}
