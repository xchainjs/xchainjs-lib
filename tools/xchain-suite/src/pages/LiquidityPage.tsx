import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useLiquidity } from '../hooks/useLiquidity'
import { CheckPosition } from '../components/liquidity/CheckPosition'
import { AddLiquidity } from '../components/liquidity/AddLiquidity'
import { WithdrawLiquidity } from '../components/liquidity/WithdrawLiquidity'

type Tab = 'check' | 'add' | 'withdraw'

export default function LiquidityPage() {
  const { isConnected } = useWallet()
  const { thorchainAmm, thorchainQuery, wallet, loading, error, supportedChains } = useLiquidity()
  const [activeTab, setActiveTab] = useState<Tab>('check')

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Connect Wallet
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Please connect your wallet to manage liquidity positions.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300">Initializing liquidity service...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-red-600 dark:text-red-400">
              <p className="font-medium">Failed to initialize liquidity service</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'check', label: 'Check Position' },
    { id: 'add', label: 'Add Liquidity' },
    { id: 'withdraw', label: 'Withdraw' },
  ]

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Liquidity</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage liquidity positions on THORChain pools
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'check' && (
                <CheckPosition
                  thorchainQuery={thorchainQuery}
                  wallet={wallet}
                  supportedChains={supportedChains}
                />
              )}
              {activeTab === 'add' && (
                <AddLiquidity
                  thorchainAmm={thorchainAmm}
                  wallet={wallet}
                  supportedChains={supportedChains}
                />
              )}
              {activeTab === 'withdraw' && (
                <WithdrawLiquidity
                  thorchainAmm={thorchainAmm}
                  wallet={wallet}
                  supportedChains={supportedChains}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
