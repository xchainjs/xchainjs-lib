import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { baseToAsset, baseAmount } from '@xchainjs/xchain-util'

interface NodeDetailsProps {
  nodesApi: any
}

interface NodeInfo {
  address: string
  status: string
  operatorAddress: string
  totalBond: string
  bondProviders: Array<{ address: string; bond: string }>
  operatorFee: string
  slashPoints: number
  version: string
  ipAddress: string
  activeBlockHeight: number
  statusSince: number
  requestedToLeave: boolean
  forcedToLeave: boolean
  jail?: { releaseHeight: number; reason: string }
  observeChains: Array<{ chain: string; height: number }>
}

export function NodeDetails({ nodesApi }: NodeDetailsProps) {
  const [nodeAddress, setNodeAddress] = useState('')
  const { execute, result, error, loading, duration } = useOperation<NodeInfo>()

  const handleFetchNode = async () => {
    if (!nodesApi || !nodeAddress) return

    await execute(async () => {
      const response = await nodesApi.node(nodeAddress.trim())
      const node = response.data

      return {
        address: node.node_address,
        status: node.status,
        operatorAddress: node.node_operator_address,
        totalBond: baseToAsset(baseAmount(node.total_bond, 8)).amount().toFormat(2) + ' RUNE',
        bondProviders: (node.bond_providers?.providers || []).map((p: any) => ({
          address: p.bond_address,
          bond: baseToAsset(baseAmount(p.bond || '0', 8)).amount().toFormat(2) + ' RUNE',
        })),
        operatorFee: ((node.bond_providers?.node_operator_fee || 0) / 100).toFixed(2) + '%',
        slashPoints: node.slash_points,
        version: node.version,
        ipAddress: node.ip_address,
        activeBlockHeight: node.active_block_height,
        statusSince: node.status_since,
        requestedToLeave: node.requested_to_leave,
        forcedToLeave: node.forced_to_leave,
        jail: node.jail?.release_height ? {
          releaseHeight: node.jail.release_height,
          reason: node.jail.reason || 'Unknown',
        } : undefined,
        observeChains: (node.observe_chains || []).map((c: any) => ({
          chain: c.chain,
          height: c.height,
        })),
      }
    }, { operation: 'node', params: { nodeAddress } })
  }

  const codeExample = `import { NodesApi, Configuration, THORNODE_API_9R_URL } from '@xchainjs/xchain-thornode'

// Initialize API
const config = new Configuration({ basePath: THORNODE_API_9R_URL })
const nodesApi = new NodesApi(config)

// Fetch specific node by address
const nodeAddress = '${nodeAddress || 'thor1...'}'
const response = await nodesApi.node(nodeAddress)
const node = response.data

console.log('Node Address:', node.node_address)
console.log('Operator:', node.node_operator_address)
console.log('Status:', node.status)
console.log('Total Bond:', node.total_bond)
console.log('Bond Providers:', node.bond_providers.providers)
console.log('Operator Fee:', node.bond_providers.node_operator_fee, 'bps')
console.log('Slash Points:', node.slash_points)
console.log('Version:', node.version)
console.log('IP Address:', node.ip_address)
console.log('Active Since Block:', node.active_block_height)
console.log('Requested Leave:', node.requested_to_leave)
console.log('Forced Leave:', node.forced_to_leave)
console.log('Observe Chains:', node.observe_chains)`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Query detailed information about a specific THORChain validator node.
        </p>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Node Address
          </label>
          <input
            type="text"
            value={nodeAddress}
            onChange={(e) => setNodeAddress(e.target.value)}
            placeholder="thor1..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={handleFetchNode}
          disabled={loading || !nodesApi || !nodeAddress}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Fetching...' : 'Get Node Details'}
        </button>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg ${
              result.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700' :
              result.status === 'Standby' ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700' :
              'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{result.status}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Since block {result.statusSince}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.totalBond}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Bond</p>
                </div>
              </div>
            </div>

            {/* Jail Warning */}
            {result.jail && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="font-medium text-red-800 dark:text-red-200">Node is Jailed</p>
                <p className="text-sm text-red-600 dark:text-red-300">Reason: {result.jail.reason}</p>
                <p className="text-sm text-red-600 dark:text-red-300">Release at block: {result.jail.releaseHeight}</p>
              </div>
            )}

            {/* Leave Status */}
            {(result.requestedToLeave || result.forcedToLeave) && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {result.forcedToLeave ? 'Forced to Leave' : 'Requested to Leave'}
                </p>
              </div>
            )}

            {/* Node Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Node Address</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{result.address}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Operator Address</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{result.operatorAddress}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Version</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{result.version}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">IP Address</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{result.ipAddress}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Slash Points</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{result.slashPoints}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Operator Fee</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{result.operatorFee}</p>
              </div>
            </div>

            {/* Bond Providers */}
            {result.bondProviders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bond Providers</h4>
                <div className="space-y-2">
                  {result.bondProviders.map((provider, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {provider.address?.slice(0, 12)}...{provider.address?.slice(-6)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.bond}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observe Chains */}
            {result.observeChains.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observed Chains</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {result.observeChains.map((chain, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-center">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{chain.chain}</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{chain.height}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
