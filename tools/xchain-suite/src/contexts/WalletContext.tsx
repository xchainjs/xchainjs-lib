import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react'
import type Transport from '@ledgerhq/hw-transport'
import { validatePhrase, encryptToKeyStore, decryptFromKeystore, generatePhrase, type Keystore } from '@xchainjs/xchain-crypto'
import { Network } from '@xchainjs/xchain-client'

import { closeLedgerTransport, openLedgerTransport } from '../lib/ledger/transport'
import type {
  BtcAddressFormatOption,
  EthDerivationStyle,
  SuiteWalletType,
} from '../lib/ledger/types'

const WALLETS_STORAGE_KEY = 'xchainjs-testing-gui-wallets'
const ACTIVE_WALLET_KEY = 'xchainjs-testing-gui-active-wallet'

export interface SavedWallet {
  id: string
  name: string
  keystore: Keystore
  createdAt: number
}

export type ConnectLedgerOptions = {
  btcAddressFormat?: BtcAddressFormatOption
  ethDerivationStyle?: EthDerivationStyle
  /** BIP account index (default 0). No effect on Ledger Live ETH `{index}` paths. */
  accountIndex?: number
  /** Optional root path override for BTC/ETH, e.g. m/84'/0'/5'/0/ */
  customRootPath?: string
}

interface WalletContextValue {
  // Current session
  phrase: string | null
  walletType: SuiteWalletType
  transport: Transport | null
  btcAddressFormat: BtcAddressFormatOption
  ethDerivationStyle: EthDerivationStyle
  accountIndex: number
  customRootPath: string
  isConnected: boolean
  network: Network
  activeWalletId: string | null
  activeWalletName: string | null

  // Wallet management
  savedWallets: SavedWallet[]
  connect: (phrase: string) => { success: boolean; error?: string }
  connectWithKeystore: (keystore: Keystore, password: string, walletName?: string) => Promise<{ success: boolean; error?: string }>
  connectLedger: (options?: ConnectLedgerOptions) => Promise<{ success: boolean; error?: string }>
  disconnect: () => void
  setBtcAddressFormat: (format: BtcAddressFormatOption) => void
  setEthDerivationStyle: (style: EthDerivationStyle) => void
  setAccountIndex: (index: number) => void
  setCustomRootPath: (path: string) => void

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
  const [walletType, setWalletType] = useState<SuiteWalletType>('phrase')
  const [transport, setTransport] = useState<Transport | null>(null)
  const [btcAddressFormat, setBtcAddressFormat] = useState<BtcAddressFormatOption>('p2wpkh')
  const [ethDerivationStyle, setEthDerivationStyle] = useState<EthDerivationStyle>('default')
  const [accountIndex, setAccountIndex] = useState(0)
  const [customRootPath, setCustomRootPath] = useState('')
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

    // Drop any active Ledger session when switching to phrase
    void closeLedgerTransport(transport)
    setTransport(null)
    setWalletType('phrase')
    setPhrase(trimmedPhrase)
    setActiveWalletId(null)
    setTempWalletName(null)
    return { success: true }
  }, [transport])

  // Connect with keystore file without saving (quick connect)
  const connectWithKeystore = useCallback(async (keystore: Keystore, password: string, walletName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const decryptedPhrase = await decryptFromKeystore(keystore, password)

      if (!validatePhrase(decryptedPhrase)) {
        return { success: false, error: 'Decrypted data is not a valid mnemonic' }
      }

      void closeLedgerTransport(transport)
      setTransport(null)
      setWalletType('phrase')
      setPhrase(decryptedPhrase)
      setActiveWalletId(null)
      setTempWalletName(walletName || 'Keystore Wallet')

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to decrypt keystore. Check your password.' }
    }
  }, [transport])

  /**
   * Connect a Ledger device over WebHID.
   * Unlock the device, open the Bitcoin or Ethereum app before using those chains.
   */
  const connectLedger = useCallback(async (options?: ConnectLedgerOptions): Promise<{ success: boolean; error?: string }> => {
    try {
      // Close any previous transport first
      await closeLedgerTransport(transport)

      const next = await openLedgerTransport()
      setTransport(next)
      setWalletType('ledger')
      setPhrase(null)
      setActiveWalletId(null)
      setTempWalletName('Ledger')
      localStorage.removeItem(ACTIVE_WALLET_KEY)

      if (options?.btcAddressFormat) setBtcAddressFormat(options.btcAddressFormat)
      if (options?.ethDerivationStyle) setEthDerivationStyle(options.ethDerivationStyle)
      if (options?.accountIndex !== undefined) setAccountIndex(options.accountIndex)
      if (options?.customRootPath !== undefined) setCustomRootPath(options.customRootPath)

      return { success: true }
    } catch (e) {
      setTransport(null)
      setWalletType('phrase')
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Failed to connect Ledger. Unlock the device and try again.',
      }
    }
  }, [transport])

  const disconnect = useCallback(() => {
    void closeLedgerTransport(transport)
    setTransport(null)
    setWalletType('phrase')
    setPhrase(null)
    setActiveWalletId(null)
    setTempWalletName(null)
    localStorage.removeItem(ACTIVE_WALLET_KEY)
  }, [transport])

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

      void closeLedgerTransport(transport)
      setTransport(null)
      setWalletType('phrase')
      setSavedWallets(prev => [...prev, wallet])
      setPhrase(newPhrase)
      setActiveWalletId(wallet.id)
      localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id)

      return { success: true, phrase: newPhrase }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to create wallet' }
    }
  }, [transport])

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

      void closeLedgerTransport(transport)
      setTransport(null)
      setWalletType('phrase')
      setSavedWallets(prev => [...prev, wallet])
      setPhrase(trimmedPhrase)
      setActiveWalletId(wallet.id)
      localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id)

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to import wallet' }
    }
  }, [transport])

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

      void closeLedgerTransport(transport)
      setTransport(null)
      setWalletType('phrase')
      setSavedWallets(prev => [...prev, wallet])
      setPhrase(decryptedPhrase)
      setActiveWalletId(wallet.id)
      localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id)

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to decrypt keystore. Check your password.' }
    }
  }, [transport])

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

      void closeLedgerTransport(transport)
      setTransport(null)
      setWalletType('phrase')
      setPhrase(decryptedPhrase)
      setActiveWalletId(walletId)
      setTempWalletName(null)
      localStorage.setItem(ACTIVE_WALLET_KEY, walletId)

      return { success: true }
    } catch (e) {
      return { success: false, error: 'Incorrect password' }
    }
  }, [savedWallets, transport])

  // Delete a saved wallet
  const deleteWallet = useCallback((walletId: string) => {
    setSavedWallets(prev => prev.filter(w => w.id !== walletId))
    if (activeWalletId === walletId) {
      void closeLedgerTransport(transport)
      setTransport(null)
      setWalletType('phrase')
      setPhrase(null)
      setActiveWalletId(null)
      localStorage.removeItem(ACTIVE_WALLET_KEY)
    }
  }, [activeWalletId, transport])

  // Export keystore for download
  const exportKeystore = useCallback((walletId: string): Keystore | null => {
    const wallet = savedWallets.find(w => w.id === walletId)
    return wallet?.keystore || null
  }, [savedWallets])

  const isConnected = walletType === 'ledger' ? transport !== null : phrase !== null

  const value = useMemo<WalletContextValue>(
    () => ({
      phrase,
      walletType,
      transport,
      btcAddressFormat,
      ethDerivationStyle,
      accountIndex,
      customRootPath,
      isConnected,
      network,
      activeWalletId,
      activeWalletName,
      savedWallets,
      connect,
      connectWithKeystore,
      connectLedger,
      disconnect,
      setBtcAddressFormat,
      setEthDerivationStyle,
      setAccountIndex,
      setCustomRootPath,
      createWallet,
      importFromPhrase,
      importFromKeystore,
      unlockWallet,
      deleteWallet,
      exportKeystore,
    }),
    [
      phrase,
      walletType,
      transport,
      btcAddressFormat,
      ethDerivationStyle,
      accountIndex,
      customRootPath,
      isConnected,
      network,
      activeWalletId,
      activeWalletName,
      savedWallets,
      connect,
      connectWithKeystore,
      connectLedger,
      disconnect,
      createWallet,
      importFromPhrase,
      importFromKeystore,
      unlockWallet,
      deleteWallet,
      exportKeystore,
    ],
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
