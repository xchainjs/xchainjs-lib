import { useState } from 'react'
import type { Client as MayachainClient } from '@xchainjs/xchain-mayachain'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { baseAmount } from '@xchainjs/xchain-util'

interface UnbondNodeProps {
  mayaClient: MayachainClient | null
  walletConnected: boolean
}

interface UnbondResult {
  txHash: string
  explorerUrl: string
}

type UnbondType = 'lp' | 'unwhitelist'

export function UnbondNode({ mayaClient, walletConnected }: UnbondNodeProps) {
  const [unbondType, setUnbondType] = useState<UnbondType>('lp')
  // LP Unbond fields
  const [assetPool, setAssetPool] = useState('')
  const [lpUnits, setLpUnits] = useState('')
  const [nodeAddress, setNodeAddress] = useState('')
  // Unwhitelist fields
  const [unwhitelistNodeAddress, setUnwhitelistNodeAddress] = useState('')
  const [providerAddress, setProviderAddress] = useState('')

  const { execute, result, error, loading, duration } = useOperation<UnbondResult>()

  const handleUnbond = async () => {
    if (!mayaClient) return

    await execute(async () => {
      let memo: string

      if (unbondType === 'lp') {
        // LP Unbond: UNBOND:<asset_pool>:<lp_units>:<node_address>
        const trimmedPool = assetPool.trim()
        const trimmedUnits = lpUnits.trim()
        const trimmedNode = nodeAddress.trim()

        if (!trimmedPool || !trimmedUnits || !trimmedNode) {
          throw new Error('Asset pool, LP units, and node address are required')
        }

        memo = `UNBOND:${trimmedPool}:${trimmedUnits}:${trimmedNode}`
      } else {
        // Unwhitelist: UNBOND::<node_address>:<provider_address>
        const trimmedNode = unwhitelistNodeAddress.trim()
        const trimmedProvider = providerAddress.trim()

        if (!trimmedNode || !trimmedProvider) {
          throw new Error('Node address and provider address are required')
        }

        // Note: Uses UNBOND:: (double colon) for unwhitelisting on MAYAChain
        memo = `UNBOND::${trimmedNode}:${trimmedProvider}`
      }

      // Unbond transactions use minimal CACAO amount (memo is what matters)
      const txHash = await mayaClient.deposit({
        amount: baseAmount(1, 10), // 1 base unit of CACAO
        memo,
      })

      return {
        txHash,
        explorerUrl: mayaClient.getExplorerTxUrl(txHash),
      }
    }, { operation: 'unbond', params: unbondType === 'lp'
      ? { unbondType, assetPool, lpUnits, nodeAddress }
      : { unbondType, unwhitelistNodeAddress, providerAddress }
    })
  }

  const isLpFormValid = unbondType === 'lp' &&
    assetPool.trim() && lpUnits.trim() && nodeAddress.trim()

  const isUnwhitelistFormValid = unbondType === 'unwhitelist' &&
    unwhitelistNodeAddress.trim() && providerAddress.trim()

  const isFormValid = isLpFormValid || isUnwhitelistFormValid

  const codeExample = unbondType === 'lp'
    ? `import { Client, defaultClientConfig, CACAO_DECIMAL } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

// Initialize client
const client = new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })

// Unbond LP units from a node
const assetPool = '${assetPool || 'BTC.BTC'}'
const lpUnits = '${lpUnits || '1000000'}'  // LP units to unbond
const nodeAddress = '${nodeAddress || 'maya1...'}'

// Build memo: UNBOND:<asset_pool>:<lp_units>:<node_address>
const memo = \`UNBOND:\${assetPool}:\${lpUnits}:\${nodeAddress}\`

// Send deposit transaction
const txHash = await client.deposit({
  amount: baseAmount(1, CACAO_DECIMAL),  // Minimal amount, memo is what matters
  memo,
})

console.log('Unbond TX:', txHash)

// Note: Unbonded LP units enter a waiting period before you can withdraw`
    : `import { Client, defaultClientConfig, CACAO_DECIMAL } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

// Initialize client (must be node operator)
const client = new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })

// Remove a whitelisted bond provider
const nodeAddress = '${unwhitelistNodeAddress || 'maya1...'}'
const providerAddress = '${providerAddress || 'maya1...'}'

// Build memo: UNBOND::<node>:<provider>
// Note: Uses UNBOND:: (double colon) for unwhitelisting on MAYAChain!
const memo = \`UNBOND::\${nodeAddress}:\${providerAddress}\`

// Send deposit transaction
const txHash = await client.deposit({
  amount: baseAmount(1, CACAO_DECIMAL),
  memo,
})

console.log('Unwhitelist TX:', txHash)`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Unbond LP units from a MAYAChain validator node, or remove a whitelisted bond provider.
        </p>
      </div>

      {!walletConnected && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Connect a wallet to perform unbond operations.
          </p>
        </div>
      )}

      {/* Unbond Type Selector */}
      <div className="flex gap-4">
        <button
          onClick={() => setUnbondType('lp')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            unbondType === 'lp'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Unbond LP Units
        </button>
        <button
          onClick={() => setUnbondType('unwhitelist')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            unbondType === 'unwhitelist'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Unwhitelist Provider
        </button>
      </div>

      {unbondType === 'lp' ? (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unbond your LP units from a node. After unbonding, the LP units enter a waiting period.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asset Pool
              </label>
              <input
                type="text"
                value={assetPool}
                onChange={(e) => setAssetPool(e.target.value)}
                placeholder="BTC.BTC"
                disabled={!walletConnected}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LP Units
              </label>
              <input
                type="text"
                value={lpUnits}
                onChange={(e) => setLpUnits(e.target.value)}
                placeholder="1000000"
                disabled={!walletConnected}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                LP units to unbond
              </p>
            </div>
          </div>

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
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remove a bond provider from your node's whitelist. Only the node operator can do this.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Node Address
            </label>
            <input
              type="text"
              value={unwhitelistNodeAddress}
              onChange={(e) => setUnwhitelistNodeAddress(e.target.value)}
              placeholder="maya1..."
              disabled={!walletConnected}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider Address
            </label>
            <input
              type="text"
              value={providerAddress}
              onChange={(e) => setProviderAddress(e.target.value)}
              placeholder="maya1..."
              disabled={!walletConnected}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleUnbond}
        disabled={loading || !walletConnected || !isFormValid}
        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : unbondType === 'lp' ? 'Unbond LP Units' : 'Unwhitelist Provider'}
      </button>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Warning:</strong> Unbonded LP units enter a waiting period before they can be withdrawn.
          During this time, the LP units may still be subject to slashing if the node misbehaves.
        </p>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="font-medium text-green-800 dark:text-green-200">
                {unbondType === 'lp' ? 'Unbond' : 'Unwhitelist'} Transaction Submitted
              </p>
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
