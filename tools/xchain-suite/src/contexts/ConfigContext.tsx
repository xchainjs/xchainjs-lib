import { createContext, useContext, useCallback, ReactNode, useMemo } from 'react'

type ApiProvider = 'etherscan' | 'blockcypher' | 'blockchair' | 'infura' | 'alchemy' | string

interface ConfigContextValue {
  setApiKey: (provider: ApiProvider, key: string) => void
  getApiKey: (provider: ApiProvider) => string | null
  removeApiKey: (provider: ApiProvider) => void
  listProviders: () => ApiProvider[]
}

const CONFIG_STORAGE_PREFIX = 'xchain-testing-gui-api-key-'

const ConfigContext = createContext<ConfigContextValue | null>(null)

interface ConfigProviderProps {
  children: ReactNode
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const setApiKey = useCallback((provider: ApiProvider, key: string) => {
    const storageKey = `${CONFIG_STORAGE_PREFIX}${provider}`
    localStorage.setItem(storageKey, key)
  }, [])

  const getApiKey = useCallback((provider: ApiProvider): string | null => {
    const storageKey = `${CONFIG_STORAGE_PREFIX}${provider}`
    return localStorage.getItem(storageKey)
  }, [])

  const removeApiKey = useCallback((provider: ApiProvider) => {
    const storageKey = `${CONFIG_STORAGE_PREFIX}${provider}`
    localStorage.removeItem(storageKey)
  }, [])

  const listProviders = useCallback((): ApiProvider[] => {
    const providers: ApiProvider[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CONFIG_STORAGE_PREFIX)) {
        providers.push(key.slice(CONFIG_STORAGE_PREFIX.length))
      }
    }
    return providers
  }, [])

  const value = useMemo<ConfigContextValue>(
    () => ({
      setApiKey,
      getApiKey,
      removeApiKey,
      listProviders,
    }),
    [setApiKey, getApiKey, removeApiKey, listProviders]
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
