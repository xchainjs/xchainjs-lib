import { useState } from 'react'
import { useTHORNode, useTHORChainClient } from '../hooks/useTHORNode'
import { useWallet } from '../contexts/WalletContext'
import { NodeList } from '../components/thornode/NodeList'
import { NodeDetails } from '../components/thornode/NodeDetails'
import { BondNode } from '../components/thornode/BondNode'
import { UnbondNode } from '../components/thornode/UnbondNode'
import { LeaveNode } from '../components/thornode/LeaveNode'

type TabId = 'list' | 'details' | 'bond' | 'unbond' | 'leave'

interface Tab {
  id: TabId
  name: string
  description: string
}

const TABS: Tab[] = [
  { id: 'list', name: 'Node List', description: 'View all THORChain validator nodes' },
  { id: 'details', name: 'Node Details', description: 'Get detailed info for a specific node' },
  { id: 'bond', name: 'Bond', description: 'Bond RUNE to a validator node' },
  { id: 'unbond', name: 'Unbond', description: 'Unbond RUNE from a validator node' },
  { id: 'leave', name: 'Leave', description: 'Request a node to leave the network' },
]

export default function THORNodePage() {
  const [activeTab, setActiveTab] = useState<TabId>('list')
  const { nodesApi, networkApi, mimirApi, loading: apiLoading, error: apiError } = useTHORNode()
  const { client: thorClient, loading: clientLoading, error: clientError } = useTHORChainClient()
  const { phrase } = useWallet()

  const walletConnected = !!phrase && !!thorClient

  if (apiLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing THORNode APIs...</p>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Failed to initialize THORNode APIs</p>
          <p className="text-sm mt-1">{apiError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">THORNode Operations</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and query THORChain validator nodes
        </p>

        {/* Connection Status */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${nodesApi ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              THORNode API {nodesApi ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Wallet {walletConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {TABS.find((t) => t.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'list' && <NodeList nodesApi={nodesApi} />}
          {activeTab === 'details' && <NodeDetails nodesApi={nodesApi} />}
          {activeTab === 'bond' && <BondNode thorClient={thorClient} walletConnected={walletConnected} />}
          {activeTab === 'unbond' && <UnbondNode thorClient={thorClient} walletConnected={walletConnected} />}
          {activeTab === 'leave' && <LeaveNode thorClient={thorClient} walletConnected={walletConnected} />}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">About THORChain Node Operations</h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p>
            <strong>Bonding:</strong> Node operators and bond providers stake RUNE to secure the network.
            Minimum bond requirements vary based on network conditions.
          </p>
          <p>
            <strong>Unbonding:</strong> RUNE can be unbonded but enters a 7-day waiting period (432,000 blocks)
            before funds are released. This protects against misbehavior.
          </p>
          <p>
            <strong>Leaving:</strong> Nodes can request to leave the network gracefully. They will complete
            current duties before being fully removed.
          </p>
          <p>
            <strong>Slashing:</strong> Nodes that fail to observe transactions or sign vault transactions
            accumulate slash points, which can result in bond slashing.
          </p>
        </div>
      </div>
    </div>
  )
}
