import { useState, useEffect } from 'react'
import { Network } from '@xchainjs/xchain-client'
import { useWallet } from '../contexts/WalletContext'
import { useConfig } from '../contexts/ConfigContext'

// THORNode API types and configuration
interface THORNodeConfig {
  nodesApi: any
  networkApi: any
  mimirApi: any
  loading: boolean
  error: string | null
}

export function useTHORNode(): THORNodeConfig {
  const { network } = useConfig()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apis, setApis] = useState<{ nodesApi: any; networkApi: any; mimirApi: any } | null>(null)

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

    initApis()

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
  const { phrase } = useWallet()
  const { network } = useConfig()
  const [client, setClient] = useState<any>(null)
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

    initClient()

    return () => {
      cancelled = true
    }
  }, [phrase, network])

  return { client, loading, error }
}
