import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { usePrices, formatUsdValue } from '../../hooks/usePrices'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { generateGetBalanceCode } from '../../lib/codeExamples'
import type { XChainClient, Balance } from '@xchainjs/xchain-client'
import { assetToString, baseToAsset, formatAssetAmountCurrency, AssetType, type TokenAsset } from '@xchainjs/xchain-util'

interface GetBalanceProps {
  chainId: string
  client: XChainClient | null
}

interface BalanceResult {
  balances: Balance[]
}

// Known pool tokens per EVM chain — pass these explicitly so the provider
// calls balanceOf() directly instead of relying on Etherscan tokentx discovery
const EVM_POOL_TOKENS: Record<string, TokenAsset[]> = {
  ETH: [
    { chain: 'ETH', symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7', ticker: 'USDT', type: AssetType.TOKEN },
    { chain: 'ETH', symbol: 'USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ticker: 'USDC', type: AssetType.TOKEN },
    { chain: 'ETH', symbol: 'DAI-0x6B175474E89094C44Da98b954EedeAC495271d0F', ticker: 'DAI', type: AssetType.TOKEN },
    { chain: 'ETH', symbol: 'WBTC-0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', ticker: 'WBTC', type: AssetType.TOKEN },
  ],
  AVAX: [
    { chain: 'AVAX', symbol: 'USDC-0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', ticker: 'USDC', type: AssetType.TOKEN },
    { chain: 'AVAX', symbol: 'USDT-0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', ticker: 'USDT', type: AssetType.TOKEN },
  ],
  BSC: [
    { chain: 'BSC', symbol: 'USDT-0x55d398326f99059fF775485246999027B3197955', ticker: 'USDT', type: AssetType.TOKEN },
    { chain: 'BSC', symbol: 'USDC-0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', ticker: 'USDC', type: AssetType.TOKEN },
  ],
  ARB: [
    { chain: 'ARB', symbol: 'USDC-0xaf88d065e77c8cC2239327C5EDb3A432268e5831', ticker: 'USDC', type: AssetType.TOKEN },
    { chain: 'ARB', symbol: 'USDT-0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', ticker: 'USDT', type: AssetType.TOKEN },
  ],
}

export function GetBalance({ chainId, client }: GetBalanceProps) {
  const [address, setAddress] = useState('')
  const { execute, result, error, loading, duration } = useOperation<BalanceResult>()
  const prices = usePrices()

  const handleExecute = async () => {
    const targetAddress = address.trim()
    await execute(
      async () => {
        if (!client) {
          throw new Error('Client not available. Please connect wallet first.')
        }
        const queryAddress = targetAddress || await client.getAddressAsync(0)

        // For EVM chains, pass known pool tokens so the provider uses
        // direct contract.balanceOf() instead of Etherscan tokentx discovery
        const tokens = EVM_POOL_TOKENS[chainId]
        const balances = await client.getBalance(queryAddress, tokens)
        return { balances }
      },
      { chainId, operation: 'getBalance', params: { address: targetAddress || '(wallet)' } }
    )
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    USD Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {result.balances.map((balance, index) => {
                  const assetAmount = baseToAsset(balance.amount).amount().toNumber()
                  const usdValue = prices.calculateValue(assetAmount, balance.asset)
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                        {assetToString(balance.asset)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right font-mono">
                        {formatBalance(balance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {usdValue !== null ? formatUsdValue(usdValue) : '-'}
                      </td>
                    </tr>
                  )
                })}
                {result.balances.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
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

      <CodePreview
        code={generateGetBalanceCode(chainId, address.trim() || undefined)}
        title="Code Example"
      />
    </div>
  )
}
