import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { createClient } from '../lib/clients/factory'
import type { XChainClient } from '@xchainjs/xchain-client'

interface UseChainClientResult {
  client: XChainClient | null
  loading: boolean
  error: Error | null
}

/**
 * Hook that creates a client for the given chain ID using the wallet phrase.
 * The client is recreated when the phrase or chainId changes.
 */
export function useChainClient(chainId: string): UseChainClientResult {
  const { phrase, isConnected, network } = useWallet()
  const [client, setClient] = useState<XChainClient | null>(null)
  // Start loading if wallet is connected (client will be created in useEffect)
  const [loading, setLoading] = useState(isConnected)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConnected || !phrase) {
      setClient(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`[useChainClient] Creating client for ${chainId}...`)
      const newClient = createClient(chainId, { phrase, network })
      console.log(`[useChainClient] Client created successfully:`, newClient)
      setClient(newClient)
      setLoading(false)
    } catch (e) {
      console.error(`[useChainClient] Failed to create client for ${chainId}:`, e)
      setClient(null)
      setError(e as Error)
      setLoading(false)
    }
  }, [phrase, chainId, isConnected, network])

  return { client, loading, error }
}
