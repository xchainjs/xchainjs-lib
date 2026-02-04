import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { WalletConnect } from '../wallet/WalletConnect'

export function Header() {
  const { isConnected, phrase, disconnect } = useWallet()
  const [showConnectModal, setShowConnectModal] = useState(false)

  const truncatePhrase = (p: string) => {
    const words = p.split(' ')
    if (words.length <= 2) return p
    return `${words[0]} ${words[1]} ... ${words[words.length - 1]}`
  }

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
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {phrase ? truncatePhrase(phrase) : 'Connected'}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Disconnect
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
