import { useState, useEffect } from 'react'
import type { XChainClient } from '@xchainjs/xchain-client'

interface ValidateAddressProps {
  chainId: string
  client: XChainClient | null
}

export function ValidateAddress({ chainId, client }: ValidateAddressProps) {
  const [address, setAddress] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!address.trim()) {
      setIsValid(null)
      return
    }

    if (!client) {
      setIsValid(null)
      return
    }

    const validateAsync = () => {
      setIsChecking(true)
      try {
        const valid = client.validateAddress(address)
        setIsValid(valid)
      } catch {
        setIsValid(false)
      } finally {
        setIsChecking(false)
      }
    }

    const debounceTimer = setTimeout(validateAsync, 300)
    return () => clearTimeout(debounceTimer)
  }, [address, client])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Validate Address
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Check if an address is valid for {chainId}.
        </p>
      </div>

      <div>
        <label
          htmlFor="validateAddress"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Address
        </label>
        <div className="relative">
          <input
            type="text"
            id="validateAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`Enter ${chainId} address to validate`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono pr-10 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {!client && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Connect wallet to validate addresses
          </p>
        </div>
      )}

      {client && address.trim() && !isChecking && isValid !== null && (
        <div
          className={`p-4 rounded-lg ${
            isValid ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {isValid ? (
              <>
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Valid Address</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    This address is valid for {chainId}
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Invalid Address</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This address is not valid for {chainId}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
