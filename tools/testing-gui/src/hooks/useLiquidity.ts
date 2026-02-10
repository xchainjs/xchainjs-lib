import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { createClient } from '../lib/clients/factory'
import type { XChainClient } from '@xchainjs/xchain-client'
import type { Chain } from '@xchainjs/xchain-util'

// Chains supported for liquidity on THORChain
const LP_SUPPORTED_CHAINS: string[] = [
  'BTC',
  'BCH',
  'LTC',
  'DOGE',
  'ETH',
  'AVAX',
  'BSC',
  'GAIA',
  'THOR',
]

interface UseLiquidityResult {
  thorchainAmm: any | null
  thorchainQuery: any | null
  wallet: any | null
  loading: boolean
  error: Error | null
  supportedChains: string[]
}

/**
 * Hook that provides THORChain AMM and Query for liquidity operations.
 */
export function useLiquidity(): UseLiquidityResult {
  const { phrase, isConnected, network } = useWallet()
  const [wallet, setWallet] = useState<any | null>(null)
  const [thorchainAmm, setThorchainAmm] = useState<any | null>(null)
  const [thorchainQuery, setThorchainQuery] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConnected || !phrase) {
      setWallet(null)
      setThorchainAmm(null)
      setThorchainQuery(null)
      setError(null)
      return
    }

    let cancelled = false

    const initLiquidity = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('[useLiquidity] Initializing liquidity service...')

        // Dynamic imports
        const [
          { Wallet },
          { ThorchainAMM },
          { ThorchainQuery },
        ] = await Promise.all([
          import('@xchainjs/xchain-wallet'),
          import('@xchainjs/xchain-thorchain-amm'),
          import('@xchainjs/xchain-thorchain-query'),
        ])

        if (cancelled) return

        // Create clients for LP-supported chains
        const clients: Record<Chain, XChainClient> = {}
        const failedChains: string[] = []

        for (const chainId of LP_SUPPORTED_CHAINS) {
          try {
            const client = createClient(chainId, { phrase, network })
            clients[chainId as Chain] = client
          } catch (e) {
            console.warn(`[useLiquidity] Failed to create client for ${chainId}:`, e)
            failedChains.push(chainId)
          }
        }

        if (cancelled) return

        if (Object.keys(clients).length === 0) {
          throw new Error('Failed to create any chain clients')
        }

        // Create instances
        const walletInstance = new Wallet(clients)
        const queryInstance = new ThorchainQuery()
        const ammInstance = new ThorchainAMM(queryInstance, walletInstance)

        setWallet(walletInstance)
        setThorchainQuery(queryInstance)
        setThorchainAmm(ammInstance)

        console.log('[useLiquidity] Liquidity service initialized')
        setLoading(false)
      } catch (e) {
        if (cancelled) return
        console.error('[useLiquidity] Failed to initialize:', e)
        setWallet(null)
        setThorchainAmm(null)
        setThorchainQuery(null)
        setError(e as Error)
        setLoading(false)
      }
    }

    initLiquidity()

    return () => {
      cancelled = true
    }
  }, [phrase, isConnected, network])

  return {
    thorchainAmm,
    thorchainQuery,
    wallet,
    loading,
    error,
    supportedChains: LP_SUPPORTED_CHAINS,
  }
}
