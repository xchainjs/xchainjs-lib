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
 * Hook that creates a client for the given chain ID.
 * Supports phrase/keystore wallets and Ledger (BTC + ETH only).
 */
export function useChainClient(chainId: string): UseChainClientResult {
  const {
    phrase,
    isConnected,
    network,
    walletType,
    transport,
    btcAddressFormat,
    ethDerivationStyle,
    accountIndex,
    customRootPath,
  } = useWallet()
  const [client, setClient] = useState<XChainClient | null>(null)
  // Start loading if wallet is connected (client will be created in useEffect)
  const [loading, setLoading] = useState(isConnected)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isConnected) {
      setClient(null)
      setError(null)
      setLoading(false)
      return
    }

    if (walletType === 'phrase' && !phrase) {
      setClient(null)
      setError(null)
      setLoading(false)
      return
    }

    if (walletType === 'ledger' && !transport) {
      setClient(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`[useChainClient] Creating ${walletType} client for ${chainId}...`)
      const newClient = createClient(chainId, {
        network,
        walletType,
        phrase: phrase ?? undefined,
        transport: transport ?? undefined,
        btcAddressFormat,
        ethDerivationStyle,
        accountIndex,
        customRootPath: customRootPath.trim() || undefined,
      })
      console.log(`[useChainClient] Client created successfully:`, newClient)
      setClient(newClient)
      setLoading(false)
    } catch (e) {
      console.error(`[useChainClient] Failed to create client for ${chainId}:`, e)
      setClient(null)
      setError(e as Error)
      setLoading(false)
    }
  }, [
    phrase,
    chainId,
    isConnected,
    network,
    walletType,
    transport,
    btcAddressFormat,
    ethDerivationStyle,
    accountIndex,
    customRootPath,
  ])

  return { client, loading, error }
}
