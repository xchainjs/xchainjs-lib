import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import type { XChainClient, Balance } from '@xchainjs/xchain-client'
import { assetToString, baseToAsset, formatAssetAmountCurrency, baseAmount } from '@xchainjs/xchain-util'

interface GetBalanceProps {
  chainId: string
  client: XChainClient | null
}

interface BalanceResult {
  balances: Balance[]
}

// EVM chains that may need RPC fallback for balance
const EVM_CHAINS = ['ETH', 'AVAX', 'BSC', 'ARB']

export function GetBalance({ chainId, client }: GetBalanceProps) {
  const [address, setAddress] = useState('')
  const { execute, result, error, loading, duration } = useOperation<BalanceResult>()

  const handleExecute = async () => {
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }
      const targetAddress = address.trim() || await client.getAddressAsync(0)

      try {
        const balances = await client.getBalance(targetAddress)
        return { balances }
      } catch (e) {
        // For EVM chains, try direct RPC balance if dataProvider fails (CORS issues)
        if (EVM_CHAINS.includes(chainId)) {
          const evmClient = client as unknown as { getProvider: () => { getBalance: (addr: string) => Promise<bigint> }; getAssetInfo: () => { asset: Balance['asset'] } }
          if (evmClient.getProvider) {
            const provider = evmClient.getProvider()
            const rawBalance = await provider.getBalance(targetAddress)
            const asset = evmClient.getAssetInfo().asset
            return {
              balances: [{
                asset,
                amount: baseAmount(rawBalance.toString(), 18)
              }]
            }
          }
        }
        throw e
      }
    })
  }

  const formatBalance = (balance: Balance): string => {
    try {
      const assetAmount = baseToAsset(balance.amount)
      return formatAssetAmountCurrency({ amount: assetAmount, asset: balance.asset, trimZeros: true })
    } catch {
      return balance.amount.amount().toString()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Get Balance</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Query the balance for an address on {chainId}. Leave empty to use wallet address.
        </p>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Address (optional)
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={`Enter ${chainId} address or leave empty for wallet address`}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleExecute}
          disabled={loading || !client}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Balance'}
        </button>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {result.balances.map((balance, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {assetToString(balance.asset)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                      {formatBalance(balance)}
                    </td>
                  </tr>
                ))}
                {result.balances.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center"
                    >
                      No balances found
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
