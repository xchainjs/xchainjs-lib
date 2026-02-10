import { useState, useEffect } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetToBase, assetAmount, baseToAsset } from '@xchainjs/xchain-util'

interface BondNodeProps {
  thorClient: any
  walletConnected: boolean
}

interface BondResult {
  hash: string
}

export function BondNode({ thorClient, walletConnected }: BondNodeProps) {
  const [nodeAddress, setNodeAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [operatorFee, setOperatorFee] = useState('')
  const [runeBalance, setRuneBalance] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<BondResult>()

  // Fetch RUNE balance
  useEffect(() => {
    if (!thorClient) {
      setRuneBalance(null)
      return
    }

    const fetchBalance = async () => {
      try {
        const address = await thorClient.getAddressAsync()
        const balances = await thorClient.getBalance(address)
        const rune = balances.find((b: any) => b.asset.symbol === 'RUNE')
        if (rune) {
          setRuneBalance(baseToAsset(rune.amount).amount().toFixed(4))
        }
      } catch (e) {
        console.warn('Failed to fetch balance:', e)
      }
    }

    fetchBalance()
  }, [thorClient])

  const handleBond = async () => {
    if (!thorClient || !nodeAddress || !amount) return

    setShowConfirm(false)

    await execute(async () => {
      // Build memo: BOND:<node_address> or BOND:<node_address>:<provider_address>:<operator_fee>
      let memo = `BOND:${nodeAddress.trim()}`

      // If operator fee is specified, include provider address and fee
      if (operatorFee) {
        const senderAddress = await thorClient.getAddressAsync()
        memo = `BOND:${nodeAddress.trim()}:${senderAddress}:${operatorFee}`
      }

      const amountToSend = assetToBase(assetAmount(amount, 8))

      const hash = await thorClient.deposit({
        amount: amountToSend,
        memo,
      })

      return { hash }
    }, { operation: 'deposit (BOND)', params: { nodeAddress, amount, operatorFee } })
  }

  const codeExample = `import { Client, defaultClientConfig } from '@xchainjs/xchain-thorchain'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

// Initialize THORChain client
const client = new Client({
  ...defaultClientConfig,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase'
})

// Bond to a node
const nodeAddress = '${nodeAddress || 'thor1nodeaddress...'}'
const amount = assetToBase(assetAmount(${amount || '1000'}, 8)) // ${amount || '1000'} RUNE

// Simple bond memo
const memo = \`BOND:\${nodeAddress}\`

// Or with operator fee (in basis points, e.g., 1000 = 10%)
// const operatorFee = ${operatorFee || '1000'}
// const providerAddress = await client.getAddressAsync()
// const memo = \`BOND:\${nodeAddress}:\${providerAddress}:\${operatorFee}\`

// Execute bond transaction
const txHash = await client.deposit({
  amount,
  memo,
})

console.log('Bond Transaction:', txHash)`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Bond RUNE to a THORChain validator node. This requires a deposit transaction with a BOND memo.
        </p>
      </div>

      {!walletConnected && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please connect your wallet to perform bond operations.
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
            The node address to bond RUNE to
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (RUNE)
            </label>
            {runeBalance && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Balance: {runeBalance} RUNE
              </span>
            )}
          </div>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            disabled={!walletConnected}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Operator Fee (basis points, optional)
          </label>
          <input
            type="text"
            value={operatorFee}
            onChange={(e) => setOperatorFee(e.target.value)}
            placeholder="e.g., 1000 for 10%"
            disabled={!walletConnected}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Fee in basis points (1000 = 10%). Only needed when setting up as a node operator.
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Memo Format:</strong> <code className="font-mono">BOND:{nodeAddress || '<node_address>'}</code>
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading || !thorClient || !nodeAddress || !amount}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Bonding...' : 'Bond RUNE'}
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Bond
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
              {operatorFee && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Operator Fee</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{operatorFee} bps</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This will bond {amount} RUNE to the specified node. Bonded RUNE is subject to slashing if the node misbehaves.
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
                onClick={handleBond}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Confirm Bond
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              Bond Transaction Submitted!
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
              <p className="font-mono text-gray-900 dark:text-gray-100 break-all mt-1">
                {result.hash}
              </p>
            </div>
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
