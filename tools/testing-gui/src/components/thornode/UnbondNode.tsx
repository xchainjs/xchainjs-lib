import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

interface UnbondNodeProps {
  thorClient: any
  walletConnected: boolean
}

interface UnbondResult {
  hash: string
}

export function UnbondNode({ thorClient, walletConnected }: UnbondNodeProps) {
  const [nodeAddress, setNodeAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [providerAddress, setProviderAddress] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<UnbondResult>()

  const handleUnbond = async () => {
    if (!thorClient || !nodeAddress || !amount) return

    setShowConfirm(false)

    await execute(async () => {
      // Convert amount to base units (satoshis)
      const amountBase = assetToBase(assetAmount(amount, 8)).amount().toString()

      // Build memo: UNBOND:<node_address>:<amount> or UNBOND:<node_address>:<amount>:<provider_address>
      let memo = `UNBOND:${nodeAddress.trim()}:${amountBase}`

      if (providerAddress.trim()) {
        memo = `UNBOND:${nodeAddress.trim()}:${amountBase}:${providerAddress.trim()}`
      }

      // Unbond requires a small deposit (just for the memo, amount is in memo)
      const minAmount = assetToBase(assetAmount('0.00000001', 8))

      const hash = await thorClient.deposit({
        amount: minAmount,
        memo,
      })

      return { hash }
    }, { operation: 'deposit (UNBOND)', params: { nodeAddress, amount, providerAddress } })
  }

  const amountBase = amount ? assetToBase(assetAmount(amount, 8)).amount().toString() : '0'

  const codeExample = `import { Client, defaultClientConfig } from '@xchainjs/xchain-thorchain'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

// Initialize THORChain client
const client = new Client({
  ...defaultClientConfig,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase'
})

// Unbond from a node
const nodeAddress = '${nodeAddress || 'thor1nodeaddress...'}'
const unbondAmount = assetToBase(assetAmount(${amount || '1000'}, 8)).amount().toString()
// Result: ${amountBase} (in base units)

// Build unbond memo
const memo = \`UNBOND:\${nodeAddress}:\${unbondAmount}\`

// Or unbond on behalf of a specific provider
// const providerAddress = '${providerAddress || 'thor1provider...'}'
// const memo = \`UNBOND:\${nodeAddress}:\${unbondAmount}:\${providerAddress}\`

// Execute unbond transaction (minimal amount, action is in memo)
const txHash = await client.deposit({
  amount: assetToBase(assetAmount('0.00000001', 8)),
  memo,
})

console.log('Unbond Transaction:', txHash)`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Unbond RUNE from a THORChain validator node. The unbonded amount enters a 7-day waiting period before it can be claimed.
        </p>
      </div>

      {!walletConnected && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please connect your wallet to perform unbond operations.
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
            The node address to unbond RUNE from
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount to Unbond (RUNE)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            disabled={!walletConnected}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          {amount && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Base units: {amountBase}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Provider Address (optional)
          </label>
          <input
            type="text"
            value={providerAddress}
            onChange={(e) => setProviderAddress(e.target.value)}
            placeholder="thor1... (leave empty to use your address)"
            disabled={!walletConnected}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Only needed if unbonding on behalf of another provider
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Memo Format:</strong> <code className="font-mono">UNBOND:{nodeAddress || '<node>'}:{amountBase || '<amount>'}</code>
          </p>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Unbonded RUNE has a 7-day waiting period (432,000 blocks) before it can be claimed.
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || !thorClient || !nodeAddress || !amount}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Unbonding...' : 'Unbond RUNE'}
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Unbond
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Node</span>
                <span className="font-mono text-gray-900 dark:text-gray-100 text-sm">
                  {nodeAddress.slice(0, 12)}...{nodeAddress.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{amount} RUNE</span>
              </div>
              {providerAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Provider</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100 text-sm">
                    {providerAddress.slice(0, 12)}...
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This will unbond {amount} RUNE from the node. The funds will be available after a 7-day waiting period.
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
                onClick={handleUnbond}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm Unbond
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              Unbond Transaction Submitted!
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
              <p className="font-mono text-gray-900 dark:text-gray-100 break-all mt-1">
                {result.hash}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your RUNE will be available after the 7-day waiting period (432,000 blocks).
              </p>
            </div>
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
