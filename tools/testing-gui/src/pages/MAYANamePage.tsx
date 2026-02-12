import { useState } from 'react'
import { Search, User } from 'lucide-react'
import { useOperation } from '../hooks/useOperation'
import { ResultPanel } from '../components/ui/ResultPanel'
import { CodePreview } from '../components/ui/CodePreview'

type Tab = 'lookup' | 'owned'

interface MAYANameDetails {
  name: string
  owner: string
  expireBlockHeight: number
  aliases: { address: string; chain: string }[]
}

export default function MAYANamePage() {
  const [activeTab, setActiveTab] = useState<Tab>('lookup')
  const [mayaName, setMayaName] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')
  const lookupOp = useOperation<MAYANameDetails>()
  const ownedOp = useOperation<MAYANameDetails[]>()

  const handleLookup = async () => {
    if (!mayaName) return

    await lookupOp.execute(
      async () => {
        const { MayachainAMM } = await import('@xchainjs/xchain-mayachain-amm')
        const mayachainAmm = new MayachainAMM()
        const details = await mayachainAmm.getMAYANameDetails(mayaName)
        if (!details) {
          throw new Error(`MAYAName "${mayaName}" not found`)
        }
        return details
      },
      { operation: 'getMAYANameDetails', params: { name: mayaName } }
    )
  }

  const handleGetOwned = async () => {
    if (!ownerAddress) return

    await ownedOp.execute(
      async () => {
        const { MayachainAMM } = await import('@xchainjs/xchain-mayachain-amm')
        const mayachainAmm = new MayachainAMM()
        const names = await mayachainAmm.getMAYANamesByOwner(ownerAddress)
        return names
      },
      { operation: 'getMAYANamesByOwner', params: { address: ownerAddress } }
    )
  }

  const generateLookupCode = () => {
    return `import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'

const mayachainAmm = new MayachainAMM()

// Lookup MAYAName details
const details = await mayachainAmm.getMAYANameDetails('${mayaName || 'example'}')

console.log({
  name: details.name,
  owner: details.owner,
  expire: details.expireBlockHeight,
  aliases: details.aliases.map(entry => ({
    address: entry.address,
    chain: entry.chain,
  })),
})`
  }

  const generateOwnedCode = () => {
    return `import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'

const mayachainAmm = new MayachainAMM()

// Get all MAYANames owned by an address
const mayaNames = await mayachainAmm.getMAYANamesByOwner('${ownerAddress || 'maya1...'}')

mayaNames.forEach(mayaName => {
  console.log({
    name: mayaName.name,
    owner: mayaName.owner,
    expire: mayaName.expireBlockHeight,
    aliases: mayaName.aliases,
  })
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
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">MAYAName</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Lookup MAYAName registrations and aliases
          </p>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">What is MAYAName?</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            MAYAName is a naming service on MAYAChain that maps human-readable names to blockchain addresses.
            Each MAYAName can have aliases for multiple chains, making it easier to receive funds.
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
                {/* MAYAName Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    MAYAName
                  </label>
                  <input
                    type="text"
                    value={mayaName}
                    onChange={(e) => setMayaName(e.target.value)}
                    placeholder="Enter a MAYAName (e.g., alice)"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Lookup Button */}
                <button
                  onClick={handleLookup}
                  disabled={!mayaName || lookupOp.loading}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <span className="text-xs text-gray-500 dark:text-gray-400">Expires at Block</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {lookupOp.result.expireBlockHeight.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Owner</span>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                        {lookupOp.result.owner}
                      </p>
                    </div>
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
              <CodePreview code={generateLookupCode()} title="Lookup MAYAName Details" />
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
                    placeholder="maya1..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleGetOwned}
                  disabled={!ownerAddress || ownedOp.loading}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      Found {ownedOp.result.length} MAYAName{ownedOp.result.length !== 1 ? 's' : ''}
                    </p>
                    {ownedOp.result.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No MAYANames found for this address
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {ownedOp.result.map((name, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {name.name}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Expires: {name.expireBlockHeight.toLocaleString()}
                              </span>
                            </div>
                            {renderAliases(name.aliases)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ResultPanel>

              {/* Code Example */}
              <CodePreview code={generateOwnedCode()} title="Get MAYANames by Owner" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
