import { useState, useEffect } from 'react'
import { Network } from '@xchainjs/xchain-client'
import type { NodesApi, NetworkApi, MimirApi } from '@xchainjs/xchain-mayanode'
import type { Client as MayachainClient } from '@xchainjs/xchain-mayachain'
import { useWallet } from '../contexts/WalletContext'

// MAYANode API types and configuration
interface MAYANodeConfig {
  nodesApi: NodesApi | null
  networkApi: NetworkApi | null
  mimirApi: MimirApi | null
  loading: boolean
  error: string | null
}

interface MAYANodeApis {
  nodesApi: NodesApi
  networkApi: NetworkApi
  mimirApi: MimirApi
}

const MAYANODE_URLS: Record<Network, string> = {
  [Network.Mainnet]: 'https://mayanode.mayachain.info/',
  [Network.Stagenet]: 'https://stagenet.mayanode.mayachain.info/',
  [Network.Testnet]: 'https://stagenet.mayanode.mayachain.info/',
}

export function useMAYANode(): MAYANodeConfig {
  const { network } = useWallet()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apis, setApis] = useState<MAYANodeApis | null>(null)

  useEffect(() => {
    let cancelled = false

    const initApis = async () => {
      setLoading(true)
      setError(null)

      try {
        const { NodesApi, NetworkApi, MimirApi, Configuration } = await import('@xchainjs/xchain-mayanode')

        const baseUrl = MAYANODE_URLS[network]
        const config = new Configuration({ basePath: baseUrl })

        if (cancelled) return

        setApis({
          nodesApi: new NodesApi(config),
          networkApi: new NetworkApi(config),
          mimirApi: new MimirApi(config),
        })
      } catch (err) {
        if (cancelled) return
        console.error('Failed to initialize MAYANode APIs:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize MAYANode APIs')
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

// Hook to get MAYAChain client for deposit operations
export function useMAYAChainClient() {
  const { phrase, network } = useWallet()
  const [client, setClient] = useState<MayachainClient | null>(null)
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
        const { Client, defaultClientConfig } = await import('@xchainjs/xchain-mayachain')
        const mayaClient = new Client({ ...defaultClientConfig, network, phrase })

        if (cancelled) return

        setClient(mayaClient)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to initialize MAYAChain client:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize MAYAChain client')
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
