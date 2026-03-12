import { NavLink } from 'react-router-dom'
import {
  ArrowRightLeft, Droplets, Server, Repeat, Coins, AtSign, Shield,
  BarChart3, Tag, CalendarClock, PanelLeftClose, PanelLeftOpen, LayoutDashboard,
} from 'lucide-react'

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
      { id: 'XMR', name: 'Monero' },
      { id: 'SOL', name: 'Solana' },
      { id: 'XRD', name: 'Radix' },
      { id: 'ADA', name: 'Cardano' },
      { id: 'XRP', name: 'Ripple' },
    ],
  },
]

interface NavItem {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/portfolio', icon: LayoutDashboard, label: 'Portfolio' },
  { to: '/swap', icon: ArrowRightLeft, label: 'Swap' },
  { to: '/recurring', icon: CalendarClock, label: 'Recurring Swaps' },
  { to: '/pools', icon: BarChart3, label: 'Pools' },
  { to: '/liquidity', icon: Droplets, label: 'Liquidity' },
  { to: '/trade-assets', icon: Repeat, label: 'Trade Assets' },
  { to: '/runepool', icon: Coins, label: 'RUNEPool' },
  { to: '/thornode', icon: Server, label: 'THORNode' },
  { to: '/mayanode', icon: Server, label: 'MAYANode' },
  { to: '/mayaname', icon: AtSign, label: 'MAYAName' },
  { to: '/thorname', icon: Tag, label: 'THORName' },
  { to: '/router-approval', icon: Shield, label: 'Router Approval' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white overflow-y-auto transition-all duration-200 flex flex-col`}>
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">XChain Suite</h1>
            <p className="text-sm text-gray-400 mt-1">Developer Tools</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
      <nav className="p-4 flex-1">
        {/* DeFi Links */}
        <div className="mb-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                collapsed
                  ? `flex items-center justify-center p-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  : linkClass(isActive)
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </div>

        {/* Chain Groups */}
        {CHAIN_GROUPS.map((group) => (
          <div key={group.name} className="mb-6">
            {!collapsed && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.name}
              </h2>
            )}
            {collapsed && (
              <div className="h-px bg-gray-700 mb-2" />
            )}
            <ul className="space-y-1">
              {group.chains.map((chain) => (
                <li key={chain.id}>
                  <NavLink
                    to={`/chain/${chain.id}`}
                    title={collapsed ? chain.name : undefined}
                    className={({ isActive }) =>
                      collapsed
                        ? `flex items-center justify-center p-2.5 rounded-md text-xs font-bold transition-colors ${
                            isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`
                        : `block px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`
                    }
                  >
                    {collapsed ? chain.id : chain.name}
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
