import { useState, useEffect } from 'react'
import { Network } from '@xchainjs/xchain-client'
import type { NodesApi, NetworkApi, MimirApi } from '@xchainjs/xchain-thornode'
import type { ClientKeystore as ThorchainClient } from '@xchainjs/xchain-thorchain'
import { useWallet } from '../contexts/WalletContext'

// THORNode API types and configuration
interface THORNodeConfig {
  nodesApi: NodesApi | null
  networkApi: NetworkApi | null
  mimirApi: MimirApi | null
  loading: boolean
  error: string | null
}

interface THORNodeApis {
  nodesApi: NodesApi
  networkApi: NetworkApi
  mimirApi: MimirApi
}

export function useTHORNode(): THORNodeConfig {
  const { network } = useWallet()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apis, setApis] = useState<THORNodeApis | null>(null)

  useEffect(() => {
    let cancelled = false

    const initApis = async () => {
      setLoading(true)
      setError(null)

      try {
        // Dynamically import thornode to avoid SSR issues
        const { NodesApi, NetworkApi, MimirApi, Configuration, THORNODE_API_9R_URL } = await import(
          '@xchainjs/xchain-thornode'
        )

        // Use appropriate endpoint based on network
        let baseUrl = THORNODE_API_9R_URL
        if (network === Network.Stagenet) {
          baseUrl = 'https://stagenet-thornode.ninerealms.com/'
        } else if (network === Network.Testnet) {
          baseUrl = 'https://testnet-thornode.ninerealms.com/'
        }

        const config = new Configuration({ basePath: baseUrl })

        if (cancelled) return

        setApis({
          nodesApi: new NodesApi(config),
          networkApi: new NetworkApi(config),
          mimirApi: new MimirApi(config),
        })
      } catch (err) {
        if (cancelled) return
        console.error('Failed to initialize THORNode APIs:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize THORNode APIs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void initApis()

    return () => {
      cancelled = true
    }
  }, [network])

  return {
    nodesApi: apis?.nodesApi ?? null,
    networkApi: apis?.networkApi ?? null,
    mimirApi: apis?.mimirApi ?? null,
    loading,
    error,
  }
}

// Hook to get THORChain client for deposit operations
export function useTHORChainClient() {
  const { phrase, network } = useWallet()
  const [client, setClient] = useState<ThorchainClient | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!phrase) {
      setClient(null)
      return
    }

    let cancelled = false

    const initClient = async () => {
      setLoading(true)
      setError(null)

      try {
        const { Client, defaultClientConfig } = await import('@xchainjs/xchain-thorchain')
        const thorClient = new Client({ ...defaultClientConfig, network, phrase })

        if (cancelled) return

        setClient(thorClient)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to initialize THORChain client:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize THORChain client')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void initClient()

    return () => {
      cancelled = true
    }
  }, [phrase, network])

  return { client, loading, error }
}
