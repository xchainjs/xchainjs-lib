import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '../contexts/WalletContext'
import type { XChainClient } from '@xchainjs/xchain-client'

// Client factory type for creating chain clients
type ClientFactory = (phrase: string) => XChainClient

// Registry of client factories by chain ID
const clientFactories: Record<string, ClientFactory> = {}

/**
 * Register a client factory for a chain.
 * This should be called at app initialization for each supported chain.
 */
export function registerClientFactory(chainId: string, factory: ClientFactory): void {
  clientFactories[chainId] = factory
}

interface UseChainClientResult {
  client: XChainClient | null
  loading: boolean
  error: Error | null
}

/**
 * Hook that creates a client for the given chain ID using the wallet phrase.
 * The client is memoized and only recreated when the phrase or chainId changes.
 */
export function useChainClient(chainId: string): UseChainClientResult {
  const { phrase, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Memoize client creation based on phrase and chainId
  const client = useMemo<XChainClient | null>(() => {
    if (!isConnected || !phrase) {
      return null
    }

    const factory = clientFactories[chainId]
    if (!factory) {
      return null
    }

    try {
      return factory(phrase)
    } catch (e) {
      // Error will be captured in useEffect
      return null
    }
  }, [phrase, chainId, isConnected])

  // Handle async initialization and errors
  useEffect(() => {
    if (!isConnected || !phrase) {
      setError(null)
      setLoading(false)
      return
    }

    const factory = clientFactories[chainId]
    if (!factory) {
      setError(new Error(`No client factory registered for chain: ${chainId}`))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Client creation is synchronous, but we simulate async pattern for consistency
      factory(phrase)
      setLoading(false)
    } catch (e) {
      setError(e as Error)
      setLoading(false)
    }
  }, [phrase, chainId, isConnected])

  return { client, loading, error }
}
