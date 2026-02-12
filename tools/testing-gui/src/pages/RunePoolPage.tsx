import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { useLiquidity } from '../hooks/useLiquidity'
import { DepositRunePool } from '../components/runepool/DepositRunePool'
import { WithdrawRunePool } from '../components/runepool/WithdrawRunePool'

type Tab = 'deposit' | 'withdraw'

export default function RunePoolPage() {
  const { isConnected } = useWallet()
  const { thorchainAmm, wallet, loading, error } = useLiquidity()
  const [activeTab, setActiveTab] = useState<Tab>('deposit')

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
                Please connect your wallet to manage RUNEPool positions.
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
              <p className="text-gray-600 dark:text-gray-300">Initializing RUNEPool service...</p>
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
              <p className="font-medium">Failed to initialize RUNEPool service</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'deposit', label: 'Deposit' },
    { id: 'withdraw', label: 'Withdraw' },
  ]

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">RUNEPool</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Deposit and withdraw RUNE from the RUNEPool
              </p>
            </div>

            {/* Info Banner */}
            <div className="mx-6 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">What is RUNEPool?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                RUNEPool allows you to deposit RUNE to earn yield from THORChain's liquidity provision.
                Your RUNE is paired with node operator bonds to create synthetic LP positions.
                Withdraw anytime by specifying the percentage (in basis points) of your position.
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mt-4">
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
              {activeTab === 'deposit' && (
                <DepositRunePool thorchainAmm={thorchainAmm} wallet={wallet} />
              )}
              {activeTab === 'withdraw' && (
                <WithdrawRunePool thorchainAmm={thorchainAmm} wallet={wallet} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
