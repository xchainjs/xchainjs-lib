import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import type { XChainClient } from '@xchainjs/xchain-client'

interface GetAddressProps {
  chainId: string
  client: XChainClient | null
}

interface AddressResult {
  address: string
}

export function GetAddress({ chainId, client }: GetAddressProps) {
  const [walletIndex, setWalletIndex] = useState(0)
  const { execute, result, error, loading, duration } = useOperation<AddressResult>()

  const handleExecute = async () => {
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }
      const address = client.getAddress(walletIndex)
      return { address }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Get Address</h3>
        <p className="text-sm text-gray-500 mb-4">
          Derive an address from the connected wallet for {chainId}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="walletIndex"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Wallet Index
          </label>
          <input
            type="number"
            id="walletIndex"
            min={0}
            value={walletIndex}
            onChange={(e) => setWalletIndex(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            HD derivation index (default: 0)
          </p>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleExecute}
          disabled={loading || !client}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Address'}
        </button>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <code className="text-sm font-mono break-all">
                {result.address}
              </code>
              <button
                onClick={() => copyToClipboard(result.address)}
                className="ml-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy to clipboard"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </ResultPanel>
    </div>
  )
}
