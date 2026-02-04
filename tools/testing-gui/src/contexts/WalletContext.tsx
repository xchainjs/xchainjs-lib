import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Network } from '@xchainjs/xchain-client'

interface WalletContextValue {
  phrase: string | null
  isConnected: boolean
  network: Network
  connect: (phrase: string) => { success: boolean; error?: string }
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [phrase, setPhrase] = useState<string | null>(null)

  // Network is fixed to Mainnet
  const network = Network.Mainnet

  const connect = useCallback((inputPhrase: string): { success: boolean; error?: string } => {
    const trimmedPhrase = inputPhrase.trim()

    if (!validatePhrase(trimmedPhrase)) {
      return { success: false, error: 'Invalid mnemonic phrase' }
    }

    setPhrase(trimmedPhrase)
    return { success: true }
  }, [])

  const disconnect = useCallback(() => {
    setPhrase(null)
  }, [])

  const isConnected = phrase !== null

  const value = useMemo<WalletContextValue>(
    () => ({
      phrase,
      isConnected,
      network,
      connect,
      disconnect,
    }),
    [phrase, isConnected, network, connect, disconnect]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
