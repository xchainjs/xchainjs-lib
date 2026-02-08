import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react'
import { validatePhrase, encryptToKeyStore, decryptFromKeystore, generatePhrase, type Keystore } from '@xchainjs/xchain-crypto'
import { Network } from '@xchainjs/xchain-client'

const WALLETS_STORAGE_KEY = 'xchainjs-testing-gui-wallets'
const ACTIVE_WALLET_KEY = 'xchainjs-testing-gui-active-wallet'

export interface SavedWallet {
  id: string
  name: string
  keystore: Keystore
  createdAt: number
}

interface WalletContextValue {
  // Current session
  phrase: string | null
  isConnected: boolean
  network: Network
  activeWalletId: string | null
  activeWalletName: string | null

  // Wallet management
  savedWallets: SavedWallet[]
  connect: (phrase: string) => { success: boolean; error?: string }
  connectWithKeystore: (keystore: Keystore, password: string, walletName?: string) => Promise<{ success: boolean; error?: string }>
  disconnect: () => void

  // Keystore operations (save to storage)
  createWallet: (name: string, password: string) => Promise<{ success: boolean; error?: string; phrase?: string }>
  importFromPhrase: (name: string, phrase: string, password: string) => Promise<{ success: boolean; error?: string }>
  importFromKeystore: (name: string, keystore: Keystore, password: string) => Promise<{ success: boolean; error?: string }>
  unlockWallet: (walletId: string, password: string) => Promise<{ success: boolean; error?: string }>
  deleteWallet: (walletId: string) => void
  exportKeystore: (walletId: string) => Keystore | null
}

const WalletContext = createContext<WalletContextValue | null>(null)

interface WalletProviderProps {
  children: ReactNode
}

function loadSavedWallets(): SavedWallet[] {
  try {
    const stored = localStorage.getItem(WALLETS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('[WalletContext] Failed to load saved wallets:', e)
  }
  return []
}

function saveSavedWallets(wallets: SavedWallet[]) {
  try {
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets))
  } catch (e) {
    console.warn('[WalletContext] Failed to save wallets:', e)
  }
}

function generateWalletId(): string {
  return `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [phrase, setPhrase] = useState<string | null>(null)
  const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([])
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null)
  const [tempWalletName, setTempWalletName] = useState<string | null>(null) // For non-saved connections

  // Network is fixed to Mainnet
  const network = Network.Mainnet

  // Load saved wallets on mount
  useEffect(() => {
    setSavedWallets(loadSavedWallets())
    const activeId = localStorage.getItem(ACTIVE_WALLET_KEY)
    if (activeId) {
      setActiveWalletId(activeId)
    }
  }, [])

  // Save wallets when they change
  useEffect(() => {
    if (savedWallets.length > 0) {
      saveSavedWallets(savedWallets)
    }
  }, [savedWallets])

  const activeWalletName = useMemo(() => {
    // First check temp wallet name (for non-saved connections)
    if (tempWalletName) return tempWalletName
    // Then check saved wallet
    if (!activeWalletId) return null
    const wallet = savedWallets.find(w => w.id === activeWalletId)
    return wallet?.name || null
  }, [activeWalletId, savedWallets, tempWalletName])

  // Simple connect with phrase (for backwards compatibility)
  const connect = useCallback((inputPhrase: string): { success: boolean; error?: string } => {
    const trimmedPhrase = inputPhrase.trim()

    if (!validatePhrase(trimmedPhrase)) {
      return { success: false, error: 'Invalid mnemonic phrase' }
    }

    setPhrase(trimmedPhrase)
    setActiveWalletId(null)
    setTempWalletName(null)
    return { success: true }
  }, [])

  // Connect with keystore file without saving (quick connect)
  const connectWithKeystore = useCallback(async (keystore: Keystore, password: string, walletName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const decryptedPhrase = await decryptFromKeystore(keystore, password)

      if (!validatePhrase(decryptedPhrase)) {
        return { success: false, error: 'Decrypted data is not a valid mnemonic' }
      }

      setPhrase(decryptedPhrase)
      setActiveWalletId(null)
      setTempWalletName(walletName || 'Keystore Wallet')

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to decrypt keystore. Check your password.' }
    }
  }, [])

  const disconnect = useCallback(() => {
    setPhrase(null)
    setActiveWalletId(null)
    setTempWalletName(null)
    localStorage.removeItem(ACTIVE_WALLET_KEY)
  }, [])

  // Create a new wallet with generated phrase
  const createWallet = useCallback(async (name: string, password: string): Promise<{ success: boolean; error?: string; phrase?: string }> => {
    try {
      const newPhrase = generatePhrase(12)
      const keystore = await encryptToKeyStore(newPhrase, password)

      const wallet: SavedWallet = {
        id: generateWalletId(),
        name: name.trim() || 'My Wallet',
        keystore,
        createdAt: Date.now(),
      }

      setSavedWallets(prev => [...prev, wallet])
      setPhrase(newPhrase)
      setActiveWalletId(wallet.id)
      localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id)

      return { success: true, phrase: newPhrase }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to create wallet' }
    }
  }, [])

  // Import wallet from phrase
  const importFromPhrase = useCallback(async (name: string, inputPhrase: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedPhrase = inputPhrase.trim()

    if (!validatePhrase(trimmedPhrase)) {
      return { success: false, error: 'Invalid mnemonic phrase' }
    }

    try {
      const keystore = await encryptToKeyStore(trimmedPhrase, password)

      const wallet: SavedWallet = {
        id: generateWalletId(),
        name: name.trim() || 'Imported Wallet',
        keystore,
        createdAt: Date.now(),
      }

      setSavedWallets(prev => [...prev, wallet])
      setPhrase(trimmedPhrase)
      setActiveWalletId(wallet.id)
      localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id)

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to import wallet' }
    }
  }, [])

  // Import wallet from keystore file
  const importFromKeystore = useCallback(async (name: string, keystore: Keystore, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify we can decrypt the keystore
      const decryptedPhrase = await decryptFromKeystore(keystore, password)

      if (!validatePhrase(decryptedPhrase)) {
        return { success: false, error: 'Decrypted data is not a valid mnemonic' }
      }

      const wallet: SavedWallet = {
        id: generateWalletId(),
        name: name.trim() || 'Imported Keystore',
        keystore,
        createdAt: Date.now(),
      }

      setSavedWallets(prev => [...prev, wallet])
      setPhrase(decryptedPhrase)
      setActiveWalletId(wallet.id)
      localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id)

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to decrypt keystore. Check your password.' }
    }
  }, [])

  // Unlock an existing saved wallet
  const unlockWallet = useCallback(async (walletId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const wallet = savedWallets.find(w => w.id === walletId)
    if (!wallet) {
      return { success: false, error: 'Wallet not found' }
    }

    try {
      const decryptedPhrase = await decryptFromKeystore(wallet.keystore, password)

      if (!validatePhrase(decryptedPhrase)) {
        return { success: false, error: 'Decrypted data is not a valid mnemonic' }
      }

      setPhrase(decryptedPhrase)
      setActiveWalletId(walletId)
      setTempWalletName(null)
      localStorage.setItem(ACTIVE_WALLET_KEY, walletId)

      return { success: true }
    } catch (e) {
      return { success: false, error: 'Incorrect password' }
    }
  }, [savedWallets])

  // Delete a saved wallet
  const deleteWallet = useCallback((walletId: string) => {
    setSavedWallets(prev => prev.filter(w => w.id !== walletId))
    if (activeWalletId === walletId) {
      setPhrase(null)
      setActiveWalletId(null)
      localStorage.removeItem(ACTIVE_WALLET_KEY)
    }
  }, [activeWalletId])

  // Export keystore for download
  const exportKeystore = useCallback((walletId: string): Keystore | null => {
    const wallet = savedWallets.find(w => w.id === walletId)
    return wallet?.keystore || null
  }, [savedWallets])

  const isConnected = phrase !== null

  const value = useMemo<WalletContextValue>(
    () => ({
      phrase,
      isConnected,
      network,
      activeWalletId,
      activeWalletName,
      savedWallets,
      connect,
      connectWithKeystore,
      disconnect,
      createWallet,
      importFromPhrase,
      importFromKeystore,
      unlockWallet,
      deleteWallet,
      exportKeystore,
    }),
    [phrase, isConnected, network, activeWalletId, activeWalletName, savedWallets, connect, connectWithKeystore, disconnect, createWallet, importFromPhrase, importFromKeystore, unlockWallet, deleteWallet, exportKeystore]
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
