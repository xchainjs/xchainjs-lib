import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

interface LeaveNodeProps {
  thorClient: any
  walletConnected: boolean
}

interface LeaveResult {
  hash: string
}

export function LeaveNode({ thorClient, walletConnected }: LeaveNodeProps) {
  const [nodeAddress, setNodeAddress] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<LeaveResult>()

  const handleLeave = async () => {
    if (!thorClient || !nodeAddress) return

    setShowConfirm(false)

    await execute(async () => {
      // Build memo: LEAVE:<node_address>
      const memo = `LEAVE:${nodeAddress.trim()}`

      // Leave requires a small deposit (just for the memo)
      const minAmount = assetToBase(assetAmount('0.00000001', 8))

      const hash = await thorClient.deposit({
        amount: minAmount,
        memo,
      })

      return { hash }
    }, { operation: 'deposit (LEAVE)', params: { nodeAddress } })
  }

  const codeExample = `import { Client, defaultClientConfig } from '@xchainjs/xchain-thorchain'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

// Initialize THORChain client
const client = new Client({
  ...defaultClientConfig,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase'
})

// Request node to leave
const nodeAddress = '${nodeAddress || 'thor1nodeaddress...'}'

// Build leave memo
const memo = \`LEAVE:\${nodeAddress}\`

// Execute leave transaction (minimal amount, action is in memo)
const txHash = await client.deposit({
  amount: assetToBase(assetAmount('0.00000001', 8)),
  memo,
})

console.log('Leave Transaction:', txHash)

// Note: After leaving, the node will:
// 1. Stop being selected for new vault churns
// 2. Complete any pending vault rotations
// 3. Return bonded funds after the unbonding period`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Request a THORChain validator node to leave the network. The node will complete its current duties and then return bonded funds.
        </p>
      </div>

      {!walletConnected && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please connect your wallet to perform leave operations.
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
            placeholder="thor1..."
            disabled={!walletConnected}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            The node address that will request to leave the network
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Memo Format:</strong> <code className="font-mono">LEAVE:{nodeAddress || '<node_address>'}</code>
          </p>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Warning:</strong> This action signals the network that the node wishes to leave. The process includes:
          </p>
          <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside mt-2 space-y-1">
            <li>Node will be removed from active duty rotation</li>
            <li>Must wait for current vault churn to complete</li>
            <li>Bonded funds subject to unbonding period</li>
            <li>Cannot be easily reversed once initiated</li>
          </ul>
        </div>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || !thorClient || !nodeAddress}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Requesting Leave...' : 'Request Node Leave'}
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Node Leave Request
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Node</span>
                <span className="font-mono text-gray-900 dark:text-gray-100 text-sm">
                  {nodeAddress.slice(0, 12)}...{nodeAddress.slice(-6)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>This is a significant action.</strong> The node will begin the process of leaving the network.
                This cannot be easily undone.
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
                onClick={handleLeave}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              Leave Request Submitted!
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
              <p className="font-mono text-gray-900 dark:text-gray-100 break-all mt-1">
                {result.hash}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                The node will complete its current duties before fully leaving. Monitor the node status for updates.
              </p>
            </div>
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
