import { useState } from 'react'
import type { Client as MayachainClient } from '@xchainjs/xchain-mayachain'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { baseAmount } from '@xchainjs/xchain-util'

interface BondNodeProps {
  mayaClient: MayachainClient | null
  walletConnected: boolean
}

interface BondResult {
  txHash: string
  explorerUrl: string
}

type BondType = 'lp' | 'whitelist'

export function BondNode({ mayaClient, walletConnected }: BondNodeProps) {
  const [bondType, setBondType] = useState<BondType>('lp')
  // LP Bond fields
  const [assetPool, setAssetPool] = useState('')
  const [lpUnits, setLpUnits] = useState('')
  const [nodeAddress, setNodeAddress] = useState('')
  // Whitelist fields
  const [whitelistNodeAddress, setWhitelistNodeAddress] = useState('')
  const [providerAddress, setProviderAddress] = useState('')
  const [operatorFee, setOperatorFee] = useState('')

  const { execute, result, error, loading, duration } = useOperation<BondResult>()

  const handleBond = async () => {
    if (!mayaClient) return

    await execute(async () => {
      let memo: string

      if (bondType === 'lp') {
        // LP Bond: BOND:<asset_pool>:<lp_units>:<node_address>
        const trimmedPool = assetPool.trim()
        const trimmedUnits = lpUnits.trim()
        const trimmedNode = nodeAddress.trim()

        if (!trimmedPool || !trimmedUnits || !trimmedNode) {
          throw new Error('Asset pool, LP units, and node address are required')
        }

        memo = `BOND:${trimmedPool}:${trimmedUnits}:${trimmedNode}`
      } else {
        // Whitelist: BOND::<node_address>:<provider_address>:<fee>
        const trimmedNode = whitelistNodeAddress.trim()
        const trimmedProvider = providerAddress.trim()
        const trimmedFee = operatorFee.trim()

        if (!trimmedNode || !trimmedProvider) {
          throw new Error('Node address and provider address are required')
        }

        // Note: Uses BOND:: (double colon) for whitelisting on MAYAChain
        memo = `BOND::${trimmedNode}:${trimmedProvider}${trimmedFee ? `:${trimmedFee}` : ''}`
      }

      // Bond transactions use minimal CACAO amount (memo is what matters)
      const txHash = await mayaClient.deposit({
        amount: baseAmount(1, 10), // 1 base unit of CACAO
        memo,
      })

      return {
        txHash,
        explorerUrl: mayaClient.getExplorerTxUrl(txHash),
      }
    }, { operation: 'bond', params: bondType === 'lp'
      ? { bondType, assetPool, lpUnits, nodeAddress }
      : { bondType, whitelistNodeAddress, providerAddress, operatorFee }
    })
  }

  const isLpFormValid = bondType === 'lp' &&
    assetPool.trim() && lpUnits.trim() && nodeAddress.trim()

  const isWhitelistFormValid = bondType === 'whitelist' &&
    whitelistNodeAddress.trim() && providerAddress.trim()

  const isFormValid = isLpFormValid || isWhitelistFormValid

  const codeExample = bondType === 'lp'
    ? `import { Client, defaultClientConfig, CACAO_DECIMAL } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

// Initialize client
const client = new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })

// Bond LP units from a pool to a node
// First, you need LP units in a bondable pool (e.g., BTC.BTC, ETH.ETH)
const assetPool = '${assetPool || 'BTC.BTC'}'
const lpUnits = '${lpUnits || '1000000'}'  // Your LP units to bond
const nodeAddress = '${nodeAddress || 'maya1...'}'

// Build memo: BOND:<asset_pool>:<lp_units>:<node_address>
const memo = \`BOND:\${assetPool}:\${lpUnits}:\${nodeAddress}\`

// Send deposit transaction
const txHash = await client.deposit({
  amount: baseAmount(1, CACAO_DECIMAL),  // Minimal amount, memo is what matters
  memo,
})

console.log('Bond TX:', txHash)`
    : `import { Client, defaultClientConfig, CACAO_DECIMAL } from '@xchainjs/xchain-mayachain'
import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

// Initialize client (must be node operator)
const client = new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })

// Whitelist a bond provider
const nodeAddress = '${whitelistNodeAddress || 'maya1...'}'
const providerAddress = '${providerAddress || 'maya1...'}'
const operatorFee = '${operatorFee || '1000'}'  // Basis points (1000 = 10%)

// Build memo: BOND::<node>:<provider>:<fee>
// Note: Uses BOND:: (double colon) for whitelisting on MAYAChain!
const memo = \`BOND::\${nodeAddress}:\${providerAddress}:\${operatorFee}\`

// Send deposit transaction
const txHash = await client.deposit({
  amount: baseAmount(1, CACAO_DECIMAL),
  memo,
})

console.log('Whitelist TX:', txHash)`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Bond LP units to a MAYAChain validator node, or whitelist a bond provider.
        </p>
      </div>

      {!walletConnected && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Connect a wallet to perform bond operations.
          </p>
        </div>
      )}

      {/* Bond Type Selector */}
      <div className="flex gap-4">
        <button
          onClick={() => setBondType('lp')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            bondType === 'lp'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Bond LP Units
        </button>
        <button
          onClick={() => setBondType('whitelist')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            bondType === 'whitelist'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Whitelist Provider
        </button>
      </div>

      {bondType === 'lp' ? (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bond your LP units from a bondable pool to a node. You must first have LP units in the pool.
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bondable pools: BTC.BTC, ETH.ETH, etc.
              </p>
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
                Your LP units to bond
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
            Whitelist a bond provider for your node. Only the node operator can do this.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Node Address
            </label>
            <input
              type="text"
              value={whitelistNodeAddress}
              onChange={(e) => setWhitelistNodeAddress(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Operator Fee (basis points, optional)
            </label>
            <input
              type="text"
              value={operatorFee}
              onChange={(e) => setOperatorFee(e.target.value)}
              placeholder="1000 = 10%"
              disabled={!walletConnected}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleBond}
        disabled={loading || !walletConnected || !isFormValid}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : bondType === 'lp' ? 'Bond LP Units' : 'Whitelist Provider'}
      </button>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> MAYAChain bonding works differently from THORChain.
          You bond LP units from bondable pools (BTC.BTC, ETH.ETH, etc.) rather than directly bonding CACAO.
          First add liquidity to a bondable pool, then bond those LP units to a node.
        </p>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="font-medium text-green-800 dark:text-green-200">
                {bondType === 'lp' ? 'Bond' : 'Whitelist'} Transaction Submitted
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
