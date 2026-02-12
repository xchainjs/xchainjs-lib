import { useState } from 'react'
import { Search, User } from 'lucide-react'
import { useOperation } from '../hooks/useOperation'
import { ResultPanel } from '../components/ui/ResultPanel'
import { CodePreview } from '../components/ui/CodePreview'

type Tab = 'lookup' | 'owned'

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

export default function THORNamePage() {
  const [activeTab, setActiveTab] = useState<Tab>('lookup')
  const [thorName, setThorName] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')
  const lookupOp = useOperation<THORNameDetails>()
  const ownedOp = useOperation<string[]>()

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

  const tabs: { id: Tab; label: string; icon: typeof Search }[] = [
    { id: 'lookup', label: 'Lookup Name', icon: Search },
    { id: 'owned', label: 'Names by Owner', icon: User },
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
