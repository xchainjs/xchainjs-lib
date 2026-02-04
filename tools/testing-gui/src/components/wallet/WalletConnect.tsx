import { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'

interface WalletConnectProps {
  onClose: () => void
}

export function WalletConnect({ onClose }: WalletConnectProps) {
  const { connect } = useWallet()
  const [mnemonic, setMnemonic] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = () => {
    setError(null)
    setIsLoading(true)

    try {
      const words = mnemonic.trim().split(/\s+/)
      if (words.length !== 12 && words.length !== 24) {
        setError('Mnemonic must be 12 or 24 words')
        return
      }

      const result = connect(mnemonic.trim())
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to connect')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Connect Wallet
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> Testing only - do not use with
              significant funds. This tool is for development and testing
              purposes.
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="mnemonic"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mnemonic Phrase
            </label>
            <textarea
              id="mnemonic"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              placeholder="Enter your 12 or 24 word mnemonic phrase..."
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={isLoading || !mnemonic.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
