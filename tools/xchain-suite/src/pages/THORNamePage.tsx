import { useState, useEffect } from 'react'
import { Search, User, PenLine } from 'lucide-react'
import { useOperation } from '../hooks/useOperation'
import { ResultPanel } from '../components/ui/ResultPanel'
import { CodePreview } from '../components/ui/CodePreview'
import { useWallet } from '../contexts/WalletContext'
import { useAggregator } from '../hooks/useAggregator'

type Tab = 'lookup' | 'owned' | 'register'

interface THORNameDetails {
  name: string
  owner: string
  expireBlockHeight: number
  currentBlockHeight: number
  estimatedExpiry: Date | null
  preferredAsset: string
  aliases: { address: string; chain: string }[]
}

// THORChain block time constants
const BLOCKS_PER_YEAR = 5_256_000
const SECONDS_PER_BLOCK = (365.25 * 24 * 60 * 60) / BLOCKS_PER_YEAR // ~6 seconds

const ALIAS_CHAINS = ['BTC', 'ETH', 'AVAX', 'BSC', 'GAIA', 'THOR', 'DOGE', 'LTC', 'BCH', 'DASH', 'ARB', 'SOL', 'KUJI']

const EXPIRY_OPTIONS = [
  { label: '1 year', years: 1 },
  { label: '2 years', years: 2 },
  { label: '5 years', years: 5 },
  { label: '10 years', years: 10 },
]

interface NameQuote {
  memo: string
  value: string
  allowed: boolean
  errors: string[]
}

interface NameTxResult {
  hash: string
  url: string
}

export default function THORNamePage() {
  const [activeTab, setActiveTab] = useState<Tab>('lookup')
  const [thorName, setThorName] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')
  const lookupOp = useOperation<THORNameDetails>()
  const ownedOp = useOperation<string[]>()

  // Register tab state
  const [regMode, setRegMode] = useState<'register' | 'update'>('register')
  const [regName, setRegName] = useState('')
  const [regChain, setRegChain] = useState('BTC')
  const [regChainAddress, setRegChainAddress] = useState('')
  const [regOwner, setRegOwner] = useState('')
  const [regExpiry, setRegExpiry] = useState(1)
  const quoteOp = useOperation<NameQuote>()
  const registerOp = useOperation<NameTxResult>()
  const { wallet } = useAggregator()
  const { isConnected } = useWallet()

  // Auto-populate owner address from wallet
  useEffect(() => {
    if (wallet && !regOwner) {
      wallet.getAddress('THOR').then((addr: string) => setRegOwner(addr)).catch(() => {})
    }
  }, [wallet])

  const handleLookup = async () => {
    if (!thorName) return

    await lookupOp.execute(
      async () => {
        const { ThorchainQuery } = await import('@xchainjs/xchain-thorchain-query')
        const thorchainQuery = new ThorchainQuery()

        // Fetch THORName details and current block height in parallel
        const [details, lastBlock] = await Promise.all([
          thorchainQuery.getThornameDetails(thorName),
          fetch('https://thornode.ninerealms.com/thorchain/lastblock').then(r => r.json()),
        ])

        if (!details || !details.name) {
          throw new Error(`THORName "${thorName}" not found`)
        }

        // Calculate estimated expiry date
        const currentBlockHeight = lastBlock[0]?.thorchain || 0
        const blocksRemaining = details.expireBlockHeight - currentBlockHeight
        let estimatedExpiry: Date | null = null

        if (blocksRemaining > 0) {
          const secondsRemaining = blocksRemaining * SECONDS_PER_BLOCK
          estimatedExpiry = new Date(Date.now() + secondsRemaining * 1000)
        }

        return {
          name: details.name,
          owner: details.owner,
          expireBlockHeight: details.expireBlockHeight,
          currentBlockHeight,
          estimatedExpiry,
          preferredAsset: details.preferredAsset || '',
          aliases: (details.aliases || []).map((alias: any) => ({
            address: alias.address,
            chain: alias.chain,
          })),
        }
      },
      { operation: 'getThornameDetails', params: { name: thorName } }
    )
  }

  const handleGetOwned = async () => {
    if (!ownerAddress) return

    await ownedOp.execute(
      async () => {
        const { ThorchainAMM } = await import('@xchainjs/xchain-thorchain-amm')
        const thorchainAmm = new ThorchainAMM()
        const names = await thorchainAmm.getThornamesByAddress(ownerAddress)
        return names || []
      },
      { operation: 'getThornamesByAddress', params: { address: ownerAddress } }
    )
  }

  const generateLookupCode = () => {
    return `import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'

const thorchainQuery = new ThorchainQuery()

// Lookup THORName details
const details = await thorchainQuery.getThornameDetails('${thorName || 'example'}')

console.log({
  name: details.name,
  owner: details.owner,
  expire: details.expireBlockHeight,
  preferredAsset: details.preferredAsset,
  aliases: details.aliases.map(alias => ({
    address: alias.address,
    chain: alias.chain,
  })),
})`
  }

  const generateOwnedCode = () => {
    return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'

const thorchainAmm = new ThorchainAMM()

// Get all THORNames owned by an address
const thorNames = await thorchainAmm.getThornamesByAddress('${ownerAddress || 'thor1...'}')

thorNames.forEach(name => {
  console.log(name)
})`
  }

  const handleGetQuote = async () => {
    if (!regName) return

    await quoteOp.execute(
      async () => {
        registerOp.reset()
        const { ThorchainAMM } = await import('@xchainjs/xchain-thorchain-amm')
        const thorchainAmm = new ThorchainAMM()
        const expiry = new Date(Date.now() + regExpiry * 365.25 * 24 * 60 * 60 * 1000)

        if (regMode === 'register') {
          if (!regChain || !regChainAddress || !regOwner) {
            throw new Error('All fields are required for registration')
          }
          const quote = await thorchainAmm.estimateTHORNameRegistration({
            name: regName,
            owner: regOwner,
            chain: regChain,
            chainAddress: regChainAddress,
            expiry,
          })
          return {
            memo: quote.memo,
            value: `${quote.value.assetAmount.amount().toFixed(4)} ${quote.value.asset.ticker}`,
            allowed: quote.allowed,
            errors: quote.errors,
          }
        } else {
          const quote = await thorchainAmm.estimateTHORNameUpdate({
            name: regName,
            ...(regOwner && { owner: regOwner }),
            ...(regChain && regChainAddress && { chain: regChain, chainAddress: regChainAddress }),
            expiry,
          })
          return {
            memo: quote.memo,
            value: `${quote.value.assetAmount.amount().toFixed(4)} ${quote.value.asset.ticker}`,
            allowed: quote.allowed,
            errors: quote.errors,
          }
        }
      },
      { operation: regMode === 'register' ? 'estimateTHORNameRegistration' : 'estimateTHORNameUpdate', params: { name: regName } }
    )
  }

  const handleRegister = async () => {
    if (!wallet) return

    await registerOp.execute(
      async () => {
        const { ThorchainAMM } = await import('@xchainjs/xchain-thorchain-amm')
        const { ThorchainQuery, ThorchainCache, Thornode } = await import('@xchainjs/xchain-thorchain-query')
        const { MidgardQuery, MidgardCache, Midgard } = await import('@xchainjs/xchain-midgard-query')

        const network = wallet.getNetwork()
        const midgardCache = new MidgardCache(new Midgard(network))
        const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
        const thorchainQuery = new ThorchainQuery(thorchainCache)
        const thorchainAmm = new ThorchainAMM(thorchainQuery, wallet)
        const expiry = new Date(Date.now() + regExpiry * 365.25 * 24 * 60 * 60 * 1000)

        if (regMode === 'register') {
          return await thorchainAmm.registerTHORName({
            name: regName,
            owner: regOwner,
            chain: regChain,
            chainAddress: regChainAddress,
            expiry,
          })
        } else {
          return await thorchainAmm.updateTHORName({
            name: regName,
            ...(regOwner && { owner: regOwner }),
            ...(regChain && regChainAddress && { chain: regChain, chainAddress: regChainAddress }),
            expiry,
          })
        }
      },
      { operation: regMode === 'register' ? 'registerTHORName' : 'updateTHORName', params: { name: regName } }
    )
  }

  const generateRegisterCode = () => {
    if (regMode === 'register') {
      return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { Wallet } from '@xchainjs/xchain-wallet'

// Create wallet with chain clients
const wallet = new Wallet({ /* chain clients */ })
const thorchainAmm = new ThorchainAMM(undefined, wallet)

// Estimate registration cost
const quote = await thorchainAmm.estimateTHORNameRegistration({
  name: '${regName || 'myname'}',
  owner: '${regOwner || 'thor1...'}',
  chain: '${regChain}',
  chainAddress: '${regChainAddress || '...'}',
  expiry: new Date(Date.now() + ${regExpiry} * 365.25 * 24 * 60 * 60 * 1000),
})

console.log('Cost:', quote.value.assetAmount.amount().toFixed(4), quote.value.asset.ticker)
console.log('Memo:', quote.memo)

// Execute registration
if (quote.allowed) {
  const tx = await thorchainAmm.registerTHORName({
    name: '${regName || 'myname'}',
    owner: '${regOwner || 'thor1...'}',
    chain: '${regChain}',
    chainAddress: '${regChainAddress || '...'}',
    expiry: new Date(Date.now() + ${regExpiry} * 365.25 * 24 * 60 * 60 * 1000),
  })
  console.log('Tx hash:', tx.hash)
  console.log('Explorer:', tx.url)
}`
    } else {
      return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { Wallet } from '@xchainjs/xchain-wallet'

// Create wallet with chain clients
const wallet = new Wallet({ /* chain clients */ })
const thorchainAmm = new ThorchainAMM(undefined, wallet)

// Estimate update cost
const quote = await thorchainAmm.estimateTHORNameUpdate({
  name: '${regName || 'myname'}',${regOwner ? `\n  owner: '${regOwner}',` : ''}${regChain && regChainAddress ? `\n  chain: '${regChain}',\n  chainAddress: '${regChainAddress}',` : ''}
  expiry: new Date(Date.now() + ${regExpiry} * 365.25 * 24 * 60 * 60 * 1000),
})

// Execute update
if (quote.allowed) {
  const tx = await thorchainAmm.updateTHORName({
    name: '${regName || 'myname'}',${regOwner ? `\n    owner: '${regOwner}',` : ''}${regChain && regChainAddress ? `\n    chain: '${regChain}',\n    chainAddress: '${regChainAddress}',` : ''}
    expiry: new Date(Date.now() + ${regExpiry} * 365.25 * 24 * 60 * 60 * 1000),
  })
  console.log('Tx hash:', tx.hash)
  console.log('Explorer:', tx.url)
}`
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Search }[] = [
    { id: 'lookup', label: 'Lookup Name', icon: Search },
    { id: 'owned', label: 'Names by Owner', icon: User },
    { id: 'register', label: 'Register', icon: PenLine },
  ]

  const renderAliases = (aliases: { address: string; chain: string }[]) => {
    if (aliases.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400 text-sm">No aliases configured</p>
    }
    return (
      <div className="space-y-2">
        {aliases.map((alias, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md"
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16">
              {alias.chain}
            </span>
            <span className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate flex-1 ml-2">
              {alias.address}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">THORName</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Lookup THORName registrations and aliases
              </p>
            </div>

            {/* Info Banner */}
            <div className="mx-6 mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
              <h3 className="text-sm font-medium text-cyan-800 dark:text-cyan-200">What is THORName?</h3>
              <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                THORName is a naming service on THORChain that maps human-readable names to blockchain addresses.
                Each THORName can have aliases for multiple chains, making it easier to receive funds.
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mt-4">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'lookup' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* THORName Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        THORName
                      </label>
                      <input
                        type="text"
                        value={thorName}
                        onChange={(e) => setThorName(e.target.value)}
                        placeholder="Enter a THORName (e.g., t, swapper)"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Lookup Button */}
                    <button
                      onClick={handleLookup}
                      disabled={!thorName || lookupOp.loading}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {lookupOp.loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Looking up...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Lookup
                        </>
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  <ResultPanel loading={lookupOp.loading} error={lookupOp.error} duration={lookupOp.duration}>
                    {lookupOp.result && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Name</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {lookupOp.result.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Expiry</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {lookupOp.result.estimatedExpiry ? (
                                <>
                                  {lookupOp.result.estimatedExpiry.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    (~{Math.ceil((lookupOp.result.expireBlockHeight - lookupOp.result.currentBlockHeight) / (BLOCKS_PER_YEAR / 365))} days)
                                  </span>
                                </>
                              ) : (
                                <span className="text-red-500">Expired</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Block {lookupOp.result.expireBlockHeight.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Owner</span>
                          <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                            {lookupOp.result.owner}
                          </p>
                        </div>
                        {lookupOp.result.preferredAsset && (
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Preferred Asset</span>
                            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                              {lookupOp.result.preferredAsset}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                            Chain Aliases ({lookupOp.result.aliases.length})
                          </span>
                          {renderAliases(lookupOp.result.aliases)}
                        </div>
                      </div>
                    )}
                  </ResultPanel>

                  {/* Code Example */}
                  <CodePreview code={generateLookupCode()} title="Lookup THORName Details" />
                </div>
              )}

              {activeTab === 'owned' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Owner Address Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Owner Address
                      </label>
                      <input
                        type="text"
                        value={ownerAddress}
                        onChange={(e) => setOwnerAddress(e.target.value)}
                        placeholder="thor1... or any chain address"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                      />
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={handleGetOwned}
                      disabled={!ownerAddress || ownedOp.loading}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {ownedOp.loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          Find Names
                        </>
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  <ResultPanel loading={ownedOp.loading} error={ownedOp.error} duration={ownedOp.duration}>
                    {ownedOp.result && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Found {ownedOp.result.length} THORName{ownedOp.result.length !== 1 ? 's' : ''}
                        </p>
                        {ownedOp.result.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400">
                            No THORNames found for this address
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {ownedOp.result.map((name, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                              >
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {name}
                                </span>
                                <button
                                  onClick={() => {
                                    setThorName(name)
                                    setActiveTab('lookup')
                                    setTimeout(handleLookup, 100)
                                  }}
                                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                                >
                                  View Details
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </ResultPanel>

                  {/* Code Example */}
                  <CodePreview code={generateOwnedCode()} title="Get THORNames by Owner" />
                </div>
              )}

              {activeTab === 'register' && (
                <div className="space-y-6">
                  {/* Mode Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setRegMode('register'); quoteOp.reset(); registerOp.reset() }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        regMode === 'register'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Register New
                    </button>
                    <button
                      onClick={() => { setRegMode('update'); quoteOp.reset(); registerOp.reset() }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        regMode === 'update'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Update Existing
                    </button>
                  </div>

                  {!isConnected && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Connect a wallet to register or update THORNames. A wallet with RUNE is required to pay fees.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        THORName
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value.toLowerCase())}
                        placeholder="Enter name to register"
                        disabled={!isConnected}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                      />
                    </div>

                    {/* Chain */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chain {regMode === 'update' && <span className="text-gray-400">(optional)</span>}
                      </label>
                      <select
                        value={regChain}
                        onChange={(e) => setRegChain(e.target.value)}
                        disabled={!isConnected}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                      >
                        {ALIAS_CHAINS.map((chain) => (
                          <option key={chain} value={chain}>{chain}</option>
                        ))}
                      </select>
                    </div>

                    {/* Chain Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chain Address {regMode === 'update' && <span className="text-gray-400">(optional)</span>}
                      </label>
                      <input
                        type="text"
                        value={regChainAddress}
                        onChange={(e) => setRegChainAddress(e.target.value)}
                        placeholder={`Address on ${regChain}`}
                        disabled={!isConnected}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono disabled:opacity-50"
                      />
                    </div>

                    {/* Owner */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Owner {regMode === 'update' && <span className="text-gray-400">(optional)</span>}
                      </label>
                      <input
                        type="text"
                        value={regOwner}
                        onChange={(e) => setRegOwner(e.target.value)}
                        placeholder="thor1... (auto-filled from wallet)"
                        disabled={!isConnected}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono disabled:opacity-50"
                      />
                    </div>

                    {/* Expiry */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry
                      </label>
                      <select
                        value={regExpiry}
                        onChange={(e) => setRegExpiry(Number(e.target.value))}
                        disabled={!isConnected}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                      >
                        {EXPIRY_OPTIONS.map((opt) => (
                          <option key={opt.years} value={opt.years}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Get Quote Button */}
                    <button
                      onClick={handleGetQuote}
                      disabled={!regName || quoteOp.loading || !isConnected}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {quoteOp.loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Getting Quote...
                        </>
                      ) : (
                        'Get Quote'
                      )}
                    </button>
                  </div>

                  {/* Quote Result */}
                  <ResultPanel loading={quoteOp.loading} error={quoteOp.error} duration={quoteOp.duration}>
                    {quoteOp.result && (
                      <div className="space-y-4">
                        {!quoteOp.result.allowed && quoteOp.result.errors.length > 0 && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            {quoteOp.result.errors.map((err, i) => (
                              <p key={i} className="text-sm text-red-700 dark:text-red-300">{err}</p>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Cost</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {quoteOp.result.value}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Allowed</span>
                            <p className={`font-medium ${quoteOp.result.allowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {quoteOp.result.allowed ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Memo</span>
                          <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md mt-1">
                            {quoteOp.result.memo}
                          </p>
                        </div>

                        {quoteOp.result.allowed && (
                          <button
                            onClick={handleRegister}
                            disabled={!wallet || registerOp.loading}
                            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {registerOp.loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {regMode === 'register' ? 'Registering...' : 'Updating...'}
                              </>
                            ) : (
                              regMode === 'register' ? 'Register THORName' : 'Update THORName'
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </ResultPanel>

                  {/* Tx Result */}
                  <ResultPanel loading={registerOp.loading} error={registerOp.error} duration={registerOp.duration}>
                    {registerOp.result && (
                      <div className="space-y-3">
                        <span className="text-green-600 dark:text-green-400 font-medium">Success</span>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Transaction Hash</span>
                          <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                            {registerOp.result.hash}
                          </p>
                        </div>
                        {registerOp.result.url && (
                          <a
                            href={registerOp.result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                          >
                            View on Explorer
                          </a>
                        )}
                      </div>
                    )}
                  </ResultPanel>

                  {/* Code Example */}
                  <CodePreview code={generateRegisterCode()} title={`${regMode === 'register' ? 'Register' : 'Update'} THORName`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
