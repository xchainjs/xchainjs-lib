import { useState } from 'react'
import { useMAYANode, useMAYAChainClient } from '../hooks/useMAYANode'
import { useWallet } from '../contexts/WalletContext'
import { NodeList } from '../components/mayanode/NodeList'
import { NodeDetails } from '../components/mayanode/NodeDetails'
import { BondNode } from '../components/mayanode/BondNode'
import { UnbondNode } from '../components/mayanode/UnbondNode'
import { LeaveNode } from '../components/mayanode/LeaveNode'

type TabId = 'list' | 'details' | 'bond' | 'unbond' | 'leave'

interface Tab {
  id: TabId
  name: string
  description: string
}

const TABS: Tab[] = [
  { id: 'list', name: 'Node List', description: 'View all MAYAChain validator nodes' },
  { id: 'details', name: 'Node Details', description: 'Get detailed info for a specific node' },
  { id: 'bond', name: 'Bond', description: 'Bond LP units to a validator node' },
  { id: 'unbond', name: 'Unbond', description: 'Unbond LP units from a validator node' },
  { id: 'leave', name: 'Leave', description: 'Request a node to leave the network' },
]

export default function MAYANodePage() {
  const [activeTab, setActiveTab] = useState<TabId>('list')
  const { nodesApi, loading: apiLoading, error: apiError } = useMAYANode()
  const { client: mayaClient } = useMAYAChainClient()
  const { phrase } = useWallet()

  const walletConnected = !!phrase && !!mayaClient

  if (apiLoading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300">Initializing MAYANode APIs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium">Failed to initialize MAYANode APIs</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">MAYANode Operations</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and query MAYAChain validator nodes
            </p>

            {/* Connection Status */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${nodesApi ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  MAYANode API {nodesApi ? 'Connected' : 'Disconnected'}
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
              {activeTab === 'bond' && <BondNode mayaClient={mayaClient} walletConnected={walletConnected} />}
              {activeTab === 'unbond' && <UnbondNode mayaClient={mayaClient} walletConnected={walletConnected} />}
              {activeTab === 'leave' && <LeaveNode mayaClient={mayaClient} walletConnected={walletConnected} />}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">About MAYAChain Node Operations</h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <p>
                <strong>Bonding (Different from THORChain!):</strong> On MAYAChain, you bond LP units from bondable pools
                (BTC.BTC, ETH.ETH, etc.) rather than directly bonding CACAO. First add liquidity to a pool, then bond those LP units to a node.
              </p>
              <p>
                <strong>Memo Format:</strong> MAYAChain uses <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">BOND:POOL:UNITS:NODE</code> for LP bonding
                and <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">BOND::NODE:PROVIDER:FEE</code> (double colon) for whitelisting.
              </p>
              <p>
                <strong>Unbonding:</strong> LP units can be unbonded but enter a waiting period
                before they can be withdrawn. Similar memo formats apply.
              </p>
              <p>
                <strong>Leaving:</strong> Nodes can request to leave the network gracefully using
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">LEAVE:NODE</code>. They will complete current duties before being removed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
