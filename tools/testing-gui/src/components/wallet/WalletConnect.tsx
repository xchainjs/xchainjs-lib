import { useState, useRef } from 'react'
import { useWallet, type SavedWallet } from '../../contexts/WalletContext'
import { Wallet, Plus, Upload, Key, Trash2, Download, Eye, EyeOff, Zap } from 'lucide-react'
import type { Keystore } from '@xchainjs/xchain-crypto'

type ViewMode = 'list' | 'create' | 'import-phrase' | 'import-keystore' | 'unlock' | 'quick-connect'

interface WalletConnectProps {
  onClose: () => void
}

export function WalletConnect({ onClose }: WalletConnectProps) {
  const {
    savedWallets,
    connect,
    connectWithKeystore,
    createWallet,
    importFromPhrase,
    importFromKeystore,
    unlockWallet,
    deleteWallet,
    exportKeystore,
  } = useWallet()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedWallet, setSelectedWallet] = useState<SavedWallet | null>(null)

  // Form state
  const [walletName, setWalletName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keystoreFile, setKeystoreFile] = useState<Keystore | null>(null)
  const [keystoreFileName, setKeystoreFileName] = useState('')
  const [quickConnectMode, setQuickConnectMode] = useState<'phrase' | 'keystore'>('keystore')

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const quickConnectFileRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setWalletName('')
    setPassword('')
    setConfirmPassword('')
    setMnemonic('')
    setKeystoreFile(null)
    setKeystoreFileName('')
    setError(null)
    setGeneratedPhrase(null)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCreateWallet = async () => {
    setError(null)

    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const result = await createWallet(walletName || 'My Wallet', password)
      if (result.success) {
        setGeneratedPhrase(result.phrase || null)
      } else {
        setError(result.error || 'Failed to create wallet')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportPhrase = async () => {
    setError(null)

    const words = mnemonic.trim().split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      setError('Mnemonic must be 12 or 24 words')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const result = await importFromPhrase(walletName || 'Imported Wallet', mnemonic.trim(), password)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to import wallet')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportKeystore = async () => {
    setError(null)

    if (!keystoreFile) {
      setError('Please select a keystore file')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)
    try {
      const result = await importFromKeystore(walletName || 'Imported Keystore', keystoreFile, password)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to import keystore')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlockWallet = async () => {
    if (!selectedWallet) return
    setError(null)

    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)
    try {
      const result = await unlockWallet(selectedWallet.id, password)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to unlock wallet')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Quick connect handlers (connect without saving)
  const handleQuickConnectKeystore = async () => {
    setError(null)

    if (!keystoreFile) {
      setError('Please select a keystore file')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)
    try {
      const result = await connectWithKeystore(keystoreFile, password, walletName || undefined)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to connect with keystore')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickConnectPhrase = async () => {
    setError(null)

    const words = mnemonic.trim().split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      setError('Mnemonic must be 12 or 24 words')
      return
    }

    setIsLoading(true)
    try {
      const result = connect(mnemonic.trim())
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to connect')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const keystore = JSON.parse(event.target?.result as string) as Keystore
        if (!keystore.crypto || !keystore.version) {
          setError('Invalid keystore file format')
          return
        }
        setKeystoreFile(keystore)
        setKeystoreFileName(file.name)
        setError(null)
      } catch {
        setError('Failed to parse keystore file')
      }
    }
    reader.readAsText(file)
  }

  const handleExportKeystore = (wallet: SavedWallet) => {
    const keystore = exportKeystore(wallet.id)
    if (!keystore) return

    const blob = new Blob([JSON.stringify(keystore, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${wallet.name.toLowerCase().replace(/\s+/g, '-')}-keystore.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteWallet = (wallet: SavedWallet) => {
    if (window.confirm(`Are you sure you want to delete "${wallet.name}"? This cannot be undone.`)) {
      deleteWallet(wallet.id)
    }
  }

  const renderWalletList = () => (
    <>
      {/* Quick Connect Option */}
      <div className="mb-4">
        <button
          onClick={() => { resetForm(); setViewMode('quick-connect') }}
          className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:from-cyan-100 hover:to-blue-100 dark:hover:from-cyan-900/50 dark:hover:to-blue-900/50 transition-colors"
        >
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-full">
            <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-gray-100">Quick Connect</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connect with keystore or phrase without saving
            </p>
          </div>
        </button>
      </div>

      {savedWallets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Saved Wallets</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <button
                  onClick={() => {
                    setSelectedWallet(wallet)
                    resetForm()
                    setViewMode('unlock')
                  }}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{wallet.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(wallet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportKeystore(wallet)
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Export keystore"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteWallet(wallet)
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete wallet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Save a new wallet:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { resetForm(); setViewMode('create') }}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Create New</span>
          </button>
          <button
            onClick={() => { resetForm(); setViewMode('import-phrase') }}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Import Phrase</span>
          </button>
          <button
            onClick={() => { resetForm(); setViewMode('import-keystore') }}
            className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Upload className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Import File</span>
          </button>
        </div>
      </div>
    </>
  )

  const renderCreateForm = () => (
    <>
      {generatedPhrase ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
              Wallet created successfully!
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mb-3">
              Save your recovery phrase securely. You will need it to recover your wallet.
            </p>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700">
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-words">
                {generatedPhrase}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            I've saved my phrase - Continue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wallet Name
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="My Wallet"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleCreateWallet}
            disabled={isLoading || !password || !confirmPassword}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </button>
        </div>
      )}
    </>
  )

  const renderImportPhraseForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Wallet Name
        </label>
        <input
          type="text"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          placeholder="Imported Wallet"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mnemonic Phrase
        </label>
        <textarea
          rows={3}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="Enter your 12 or 24 word mnemonic phrase..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password (to encrypt wallet)
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      <button
        onClick={handleImportPhrase}
        disabled={isLoading || !mnemonic.trim() || !password || !confirmPassword}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Importing...' : 'Import Wallet'}
      </button>
    </div>
  )

  const renderImportKeystoreForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Wallet Name
        </label>
        <input
          type="text"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          placeholder="Imported Keystore"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Keystore File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          {keystoreFile ? (
            <div className="text-center">
              <Upload className="w-6 h-6 mx-auto text-green-600 dark:text-green-400 mb-1" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{keystoreFileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click to change</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to select keystore file</p>
            </div>
          )}
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Keystore Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter keystore password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button
        onClick={handleImportKeystore}
        disabled={isLoading || !keystoreFile || !password}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Importing...' : 'Import Keystore'}
      </button>
    </div>
  )

  const renderUnlockForm = () => (
    <div className="space-y-4">
      {selectedWallet && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedWallet.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created {new Date(selectedWallet.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter wallet password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
            onKeyDown={(e) => e.key === 'Enter' && handleUnlockWallet()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button
        onClick={handleUnlockWallet}
        disabled={isLoading || !password}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Unlocking...' : 'Unlock Wallet'}
      </button>
    </div>
  )

  const renderQuickConnectForm = () => (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
        <button
          onClick={() => setQuickConnectMode('keystore')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            quickConnectMode === 'keystore'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Keystore File
        </button>
        <button
          onClick={() => setQuickConnectMode('phrase')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            quickConnectMode === 'phrase'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Mnemonic Phrase
        </button>
      </div>

      {quickConnectMode === 'keystore' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wallet Name (optional)
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Keystore Wallet"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Keystore File
            </label>
            <input
              ref={quickConnectFileRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => quickConnectFileRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
            >
              {keystoreFile ? (
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto text-cyan-600 dark:text-cyan-400 mb-1" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{keystoreFileName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to select keystore file</p>
                </div>
              )}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Keystore Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter keystore password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && handleQuickConnectKeystore()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleQuickConnectKeystore}
            disabled={isLoading || !keystoreFile || !password}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mnemonic Phrase
            </label>
            <textarea
              rows={3}
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your 12 or 24 word mnemonic phrase..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleQuickConnectPhrase}
            disabled={isLoading || !mnemonic.trim()}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        This connection is temporary and won't be saved to your wallet list.
      </p>
    </div>
  )

  const getTitle = () => {
    switch (viewMode) {
      case 'list': return 'Connect Wallet'
      case 'create': return 'Create New Wallet'
      case 'import-phrase': return 'Import from Phrase'
      case 'import-keystore': return 'Import Keystore'
      case 'unlock': return 'Unlock Wallet'
      case 'quick-connect': return 'Quick Connect'
    }
  }

  const showBackButton = viewMode !== 'list'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <button
                  onClick={() => { resetForm(); setViewMode('list') }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 mr-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getTitle()}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {viewMode !== 'unlock' && viewMode !== 'quick-connect' && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Warning:</strong> Testing only. Do not use with significant funds.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {viewMode === 'list' && renderWalletList()}
          {viewMode === 'create' && renderCreateForm()}
          {viewMode === 'import-phrase' && renderImportPhraseForm()}
          {viewMode === 'import-keystore' && renderImportKeystoreForm()}
          {viewMode === 'unlock' && renderUnlockForm()}
          {viewMode === 'quick-connect' && renderQuickConnectForm()}
        </div>
      </div>
    </div>
  )
}
