import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { baseToAsset, baseAmount } from '@xchainjs/xchain-util'

interface NodeListProps {
  nodesApi: any
}

interface NodeSummary {
  address: string
  status: string
  bond: string
  slashPoints: number
  version: string
  ipAddress: string
  activeBlockHeight: number
}

export function NodeList({ nodesApi }: NodeListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { execute, result, error, loading, duration } = useOperation<NodeSummary[]>()

  const handleFetchNodes = async () => {
    if (!nodesApi) return

    await execute(async () => {
      const response = await nodesApi.nodes()
      const nodes = response.data as any[]

      // Filter by status if needed
      const filtered = statusFilter === 'all'
        ? nodes
        : nodes.filter((n: any) => n.status === statusFilter)

      return filtered.map((node: any) => ({
        address: node.node_address,
        status: node.status,
        bond: baseToAsset(baseAmount(node.total_bond, 8)).amount().toFormat(2) + ' RUNE',
        slashPoints: node.slash_points,
        version: node.version,
        ipAddress: node.ip_address,
        activeBlockHeight: node.active_block_height,
      }))
    }, { operation: 'nodes', params: { statusFilter } })
  }

  const codeExample = `import { NodesApi, Configuration, THORNODE_API_9R_URL } from '@xchainjs/xchain-thornode'

// Initialize API
const config = new Configuration({ basePath: THORNODE_API_9R_URL })
const nodesApi = new NodesApi(config)

// Fetch all nodes
const response = await nodesApi.nodes()
const nodes = response.data

// Filter by status
const activeNodes = nodes.filter(n => n.status === 'Active')
const standbyNodes = nodes.filter(n => n.status === 'Standby')

// Access node properties
nodes.forEach(node => {
  console.log('Address:', node.node_address)
  console.log('Status:', node.status)
  console.log('Total Bond:', node.total_bond)
  console.log('Slash Points:', node.slash_points)
  console.log('Version:', node.version)
})`

  const statusOptions = ['all', 'Active', 'Standby', 'Whitelisted', 'Disabled']

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Query all registered THORChain validator nodes and their current status.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Nodes' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-6">
          <button
            onClick={handleFetchNodes}
            disabled={loading || !nodesApi}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Fetching...' : 'Fetch Nodes'}
          </button>
        </div>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Found {result.length} node{result.length !== 1 ? 's' : ''}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bond</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slash</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {result.slice(0, 20).map((node, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100">
                        {node.address.slice(0, 12)}...{node.address.slice(-6)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          node.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          node.status === 'Standby' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          node.status === 'Whitelisted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {node.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{node.bond}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{node.slashPoints}</td>
                      <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100">{node.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.length > 20 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Showing first 20 of {result.length} nodes
                </p>
              )}
            </div>
          </div>
        )}
      </ResultPanel>

      <CodePreview code={codeExample} title="Code Example" />
    </div>
  )
}
