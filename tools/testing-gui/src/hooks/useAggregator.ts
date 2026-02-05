import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { createClient } from '../lib/clients/factory'
import type { XChainClient } from '@xchainjs/xchain-client'
import type { Chain } from '@xchainjs/xchain-util'
import { SwapService, type SwapQuote } from '../lib/swap/SwapService'

// Chains supported by THORChain and MAYAChain for swaps
const SWAP_SUPPORTED_CHAINS: string[] = [
  'BTC',
  'BCH',
  'LTC',
  'DOGE',
  'DASH',
  'ETH',
  'AVAX',
  'BSC',
  'ARB',
  'GAIA',
  'THOR',
  'MAYA',
  'KUJI',
]

interface UseSwapResult {
  swapService: SwapService | null
  wallet: any | null
  loading: boolean
  error: Error | null
  supportedChains: string[]
  aggregator?: SwapService | null // Backwards compatibility alias
}

/**
 * Hook that creates a SwapService with a Wallet instance for cross-chain swaps.
 * Uses THORChain and MAYAChain AMM directly (bypasses aggregator to avoid Chainflip issues).
 */
export function useAggregator(): UseSwapResult {
  const { phrase, isConnected, network } = useWallet()
  const [wallet, setWallet] = useState<any | null>(null)
  const [swapService, setSwapService] = useState<SwapService | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConnected || !phrase) {
      setWallet(null)
      setSwapService(null)
      setError(null)
      return
    }

    let cancelled = false

    const initSwapService = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('[useAggregator] Dynamically importing wallet package...')

        // Dynamic import to avoid loading at module parse time
        const { Wallet } = await import('@xchainjs/xchain-wallet')

        if (cancelled) return

        console.log('[useAggregator] Creating clients for swap-supported chains...')

        // Create clients for all swap-supported chains
        const clients: Record<Chain, XChainClient> = {}
        const failedChains: string[] = []

        for (const chainId of SWAP_SUPPORTED_CHAINS) {
          try {
            const client = createClient(chainId, { phrase, network })
            clients[chainId as Chain] = client
          } catch (e) {
            console.warn(`[useAggregator] Failed to create client for ${chainId}:`, e)
            failedChains.push(chainId)
          }
        }

        if (cancelled) return

        if (Object.keys(clients).length === 0) {
          throw new Error('Failed to create any chain clients')
        }

        if (failedChains.length > 0) {
          console.warn(`[useAggregator] Some chains unavailable: ${failedChains.join(', ')}`)
        }

        // Create Wallet instance
        const walletInstance = new Wallet(clients)
        setWallet(walletInstance)

        // Create SwapService
        const service = new SwapService(walletInstance)
        setSwapService(service)

        console.log('[useAggregator] SwapService created successfully')
        setLoading(false)
      } catch (e) {
        if (cancelled) return
        console.error('[useAggregator] Failed to create swap service:', e)
        setWallet(null)
        setSwapService(null)
        setError(e as Error)
        setLoading(false)
      }
    }

    initSwapService()

    return () => {
      cancelled = true
    }
  }, [phrase, isConnected, network])

  // Memoize supported chains to prevent unnecessary re-renders
  const supportedChains = useMemo(() => SWAP_SUPPORTED_CHAINS, [])

  return {
    swapService,
    wallet,
    loading,
    error,
    supportedChains,
    // Alias for backwards compatibility
    get aggregator() { return swapService }
  }
}

// Re-export types
export type { SwapQuote }
export type { SwapResult as TxSubmitted, SwapParams as QuoteSwapParams } from '../lib/swap/SwapService'
