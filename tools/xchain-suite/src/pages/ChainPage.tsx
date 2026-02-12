import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useChainClient } from '../hooks/useChainClient'
import { GetAddress } from '../components/operations/GetAddress'
import { GetBalance } from '../components/operations/GetBalance'
import { GetFees } from '../components/operations/GetFees'
import { Transfer } from '../components/operations/Transfer'
import { Deposit } from '../components/operations/Deposit'
import { GetHistory } from '../components/operations/GetHistory'
import { ValidateAddress } from '../components/operations/ValidateAddress'
import { PrepareTx } from '../components/operations/PrepareTx'

type TabId = 'address' | 'balance' | 'fees' | 'transfer' | 'deposit' | 'history' | 'validate' | 'prepare'

interface Tab {
  id: TabId
  label: string
  chains?: string[] // If specified, only show for these chains
}

const TABS: Tab[] = [
  { id: 'address', label: 'Address' },
  { id: 'balance', label: 'Balance' },
  { id: 'fees', label: 'Fees' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'deposit', label: 'Deposit', chains: ['THOR', 'MAYA'] },
  { id: 'history', label: 'History' },
  { id: 'validate', label: 'Validate' },
  { id: 'prepare', label: 'Prepare Tx' },
]

export function ChainPage() {
  const { chainId } = useParams<{ chainId: string }>()
  const [activeTab, setActiveTab] = useState<TabId>('address')
  const { client, loading, error } = useChainClient(chainId || '')

  if (!chainId) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-500 dark:text-gray-400">No chain selected</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading {chainId} client...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium">Failed to load {chainId} client</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter tabs based on chain
  const availableTabs = TABS.filter(tab => !tab.chains || tab.chains.includes(chainId))

  const renderTabContent = () => {
    switch (activeTab) {
      case 'address':
        return <GetAddress chainId={chainId} client={client} />
      case 'balance':
        return <GetBalance chainId={chainId} client={client} />
      case 'fees':
        return <GetFees chainId={chainId} client={client} />
      case 'transfer':
        return <Transfer chainId={chainId} client={client} />
      case 'deposit':
        return <Deposit chainId={chainId} client={client} />
      case 'history':
        return <GetHistory chainId={chainId} client={client} />
      case 'validate':
        return <ValidateAddress chainId={chainId} client={client} />
      case 'prepare':
        return <PrepareTx chainId={chainId} client={client} />
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{chainId}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Test chain operations and view results
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px px-6 overflow-x-auto" aria-label="Tabs">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
