import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { createClient } from '../lib/clients/factory'
import type { XChainClient } from '@xchainjs/xchain-client'
import type { Chain } from '@xchainjs/xchain-util'

// Chains supported for trade assets on THORChain and MAYAChain
const TRADE_SUPPORTED_CHAINS: string[] = [
  'BTC',
  'BCH',
  'LTC',
  'DOGE',
  'ETH',
  'AVAX',
  'BSC',
  'GAIA',
  'THOR',
  'MAYA',
]

interface UseTradeAssetsResult {
  thorchainAmm: any | null
  thorchainQuery: any | null
  mayachainAmm: any | null
  mayachainQuery: any | null
  wallet: any | null
  loading: boolean
  error: Error | null
  supportedChains: string[]
}

/**
 * Hook that provides THORChain and MAYAChain AMM/Query for trade asset operations.
 */
export function useTradeAssets(): UseTradeAssetsResult {
  const { phrase, isConnected, network } = useWallet()
  const [wallet, setWallet] = useState<any | null>(null)
  const [thorchainAmm, setThorchainAmm] = useState<any | null>(null)
  const [thorchainQuery, setThorchainQuery] = useState<any | null>(null)
  const [mayachainAmm, setMayachainAmm] = useState<any | null>(null)
  const [mayachainQuery, setMayachainQuery] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConnected || !phrase) {
      setWallet(null)
      setThorchainAmm(null)
      setThorchainQuery(null)
      setMayachainAmm(null)
      setMayachainQuery(null)
      setError(null)
      return
    }

    let cancelled = false

    const init = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('[useTradeAssets] Initializing trade assets service...')

        const [
          { Wallet },
          { ThorchainAMM },
          { ThorchainQuery },
          { MayachainAMM },
          { MayachainQuery },
        ] = await Promise.all([
          import('@xchainjs/xchain-wallet'),
          import('@xchainjs/xchain-thorchain-amm'),
          import('@xchainjs/xchain-thorchain-query'),
          import('@xchainjs/xchain-mayachain-amm'),
          import('@xchainjs/xchain-mayachain-query'),
        ])

        if (cancelled) return

        // Create clients for supported chains
        const clients: Record<Chain, XChainClient> = {}
        for (const chainId of TRADE_SUPPORTED_CHAINS) {
          try {
            clients[chainId as Chain] = createClient(chainId, { phrase, network })
          } catch (e) {
            console.warn(`[useTradeAssets] Failed to create client for ${chainId}:`, e)
          }
        }

        if (cancelled) return

        if (Object.keys(clients).length === 0) {
          throw new Error('Failed to create any chain clients')
        }

        const walletInstance = new Wallet(clients)
        const thorQueryInstance = new ThorchainQuery()
        const thorAmmInstance = new ThorchainAMM(thorQueryInstance, walletInstance)
        const mayaQueryInstance = new MayachainQuery()
        const mayaAmmInstance = new MayachainAMM(mayaQueryInstance, walletInstance)

        if (cancelled) return

        setWallet(walletInstance)
        setThorchainQuery(thorQueryInstance)
        setThorchainAmm(thorAmmInstance)
        setMayachainQuery(mayaQueryInstance)
        setMayachainAmm(mayaAmmInstance)

        console.log('[useTradeAssets] Trade assets service initialized')
        setLoading(false)
      } catch (e) {
        if (cancelled) return
        console.error('[useTradeAssets] Failed to initialize:', e)
        setWallet(null)
        setThorchainAmm(null)
        setThorchainQuery(null)
        setMayachainAmm(null)
        setMayachainQuery(null)
        setError(e as Error)
        setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [phrase, isConnected, network])

  return {
    thorchainAmm,
    thorchainQuery,
    mayachainAmm,
    mayachainQuery,
    wallet,
    loading,
    error,
    supportedChains: TRADE_SUPPORTED_CHAINS,
  }
}
