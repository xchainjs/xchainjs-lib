import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { WalletConnect } from '../wallet/WalletConnect'
import { Wallet } from 'lucide-react'

export function Header() {
  const { isConnected, activeWalletName, disconnect } = useWallet()
  const [showConnectModal, setShowConnectModal] = useState(false)

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              XChainJS Testing Interface
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
                  <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {activeWalletName || 'Connected'}
                  </span>
                </div>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Switch
                </button>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  Lock
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Not connected</span>
                </div>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      {showConnectModal && (
        <WalletConnect onClose={() => setShowConnectModal(false)} />
      )}
    </>
  )
}
