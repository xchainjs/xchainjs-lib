import { NavLink } from 'react-router-dom'
import { ArrowRightLeft, Droplets } from 'lucide-react'

interface ChainGroup {
  name: string
  chains: { id: string; name: string }[]
}

const CHAIN_GROUPS: ChainGroup[] = [
  {
    name: 'UTXO',
    chains: [
      { id: 'BTC', name: 'Bitcoin' },
      { id: 'BCH', name: 'Bitcoin Cash' },
      { id: 'LTC', name: 'Litecoin' },
      { id: 'DOGE', name: 'Dogecoin' },
      { id: 'DASH', name: 'Dash' },
      { id: 'ZEC', name: 'Zcash' },
    ],
  },
  {
    name: 'EVM',
    chains: [
      { id: 'ETH', name: 'Ethereum' },
      { id: 'AVAX', name: 'Avalanche' },
      { id: 'BSC', name: 'BNB Smart Chain' },
      { id: 'ARB', name: 'Arbitrum' },
    ],
  },
  {
    name: 'Cosmos',
    chains: [
      { id: 'GAIA', name: 'Cosmos Hub' },
      { id: 'THOR', name: 'THORChain' },
      { id: 'MAYA', name: 'Maya Protocol' },
      { id: 'KUJI', name: 'Kujira' },
    ],
  },
  {
    name: 'Other',
    chains: [
      { id: 'SOL', name: 'Solana' },
      { id: 'XRD', name: 'Radix' },
      { id: 'ADA', name: 'Cardano' },
      { id: 'XRP', name: 'Ripple' },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">XChainJS Tester</h1>
        <p className="text-sm text-gray-400 mt-1">Chain Testing GUI</p>
      </div>
      <nav className="p-4">
        {/* DeFi Links */}
        <div className="mb-6 space-y-1">
          <NavLink
            to="/swap"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <ArrowRightLeft className="w-4 h-4" />
            Swap
          </NavLink>
          <NavLink
            to="/liquidity"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Droplets className="w-4 h-4" />
            Liquidity
          </NavLink>
        </div>

        {/* Chain Groups */}
        {CHAIN_GROUPS.map((group) => (
          <div key={group.name} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.name}
            </h2>
            <ul className="space-y-1">
              {group.chains.map((chain) => (
                <li key={chain.id}>
                  <NavLink
                    to={`/chain/${chain.id}`}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    {chain.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
