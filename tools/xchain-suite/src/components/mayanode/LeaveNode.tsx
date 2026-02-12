import { useState } from 'react'
import type { Client as MayachainClient } from '@xchainjs/xchain-mayachain'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { baseAmount } from '@xchainjs/xchain-util'

interface LeaveNodeProps {
  mayaClient: MayachainClient | null
  walletConnected: boolean
}

interface LeaveResult {
  txHash: string
  explorerUrl: string
}

export function LeaveNode({ mayaClient, walletConnected }: LeaveNodeProps) {
  const [nodeAddress, setNodeAddress] = useState('')
  const { execute, result, error, loading, duration } = useOperation<LeaveResult>()

  const handleLeave = async () => {
    const trimmedNodeAddress = nodeAddress.trim()
    if (!mayaClient || !trimmedNodeAddress) return

    await execute(async () => {
      // Build memo: LEAVE:<node_address>
      const memo = `LEAVE:${trimmedNodeAddress}`

      // Leave uses a minimal amount deposit (just for the memo)
      const txHash = await mayaClient.deposit({
        amount: baseAmount(0, 10),
        memo,
      })

      return {
        txHash,
        explorerUrl: mayaClient.getExplorerTxUrl(txHash),
      }
    }, { operation: 'leave', params: { nodeAddress: trimmedNodeAddress } })
  }

  const trimmedNodeAddress = nodeAddress.trim()
  const isFormValid = !!trimmedNodeAddress

  const codeExample = `import { Client, defaultClientConfig, CACAO_DECIMAL } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

// Initialize client
const client = new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })

// Request node to leave the network
const nodeAddress = '${trimmedNodeAddress || 'maya1...'}'

// Build memo: LEAVE:<node_address>
const memo = \`LEAVE:\${nodeAddress}\`

// Send deposit transaction
const txHash = await client.deposit({
  amount: baseAmount(0, CACAO_DECIMAL),
  memo,
})

console.log('Leave TX:', txHash)
console.log('Explorer:', client.getExplorerTxUrl(txHash))

// Note: Node will complete current duties before leaving`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Request a node to leave the MAYAChain network gracefully. The node will complete its current duties before being removed.
        </p>
      </div>

      {!walletConnected && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Connect a wallet to perform leave operations.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Node Address
          </label>
          <input
            type="text"
            value={nodeAddress}
            onChange={(e) => setNodeAddress(e.target.value)}
            placeholder="maya1..."
            disabled={!walletConnected}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            The node operator address that should leave the network
          </p>
        </div>

        <button
          onClick={handleLeave}
          disabled={loading || !walletConnected || !isFormValid}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Request Leave'}
        </button>
      </div>

      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200">
          <strong>Warning:</strong> This action requests the node to leave the network.
          Only the node operator should perform this action. The node will complete
          its current vault duties before being removed from the network.
        </p>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="font-medium text-green-800 dark:text-green-200">Leave Request Submitted</p>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1 font-mono break-all">
                {result.txHash}
              </p>
            </div>
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View on Explorer
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
