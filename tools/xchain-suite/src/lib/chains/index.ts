export type ChainCategory = 'utxo' | 'evm' | 'cosmos' | 'other'

export interface ChainConfig {
  id: string
  name: string
  symbol: string
  category: ChainCategory
  decimals: number
}

const ALL_SUPPORTED_CHAINS: ChainConfig[] = [
  // UTXO Chains
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', category: 'utxo', decimals: 8 },
  { id: 'BCH', name: 'Bitcoin Cash', symbol: 'BCH', category: 'utxo', decimals: 8 },
  { id: 'LTC', name: 'Litecoin', symbol: 'LTC', category: 'utxo', decimals: 8 },
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE', category: 'utxo', decimals: 8 },
  { id: 'DASH', name: 'Dash', symbol: 'DASH', category: 'utxo', decimals: 8 },
  { id: 'ZEC', name: 'Zcash', symbol: 'ZEC', category: 'utxo', decimals: 8 },
  // EVM Chains
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', category: 'evm', decimals: 18 },
  { id: 'AVAX', name: 'Avalanche', symbol: 'AVAX', category: 'evm', decimals: 18 },
  { id: 'BSC', name: 'BNB Smart Chain', symbol: 'BNB', category: 'evm', decimals: 18 },
  { id: 'ARB', name: 'Arbitrum', symbol: 'ETH', category: 'evm', decimals: 18 },
  // Cosmos Chains
  { id: 'GAIA', name: 'Cosmos Hub', symbol: 'ATOM', category: 'cosmos', decimals: 6 },
  { id: 'THOR', name: 'THORChain', symbol: 'RUNE', category: 'cosmos', decimals: 8 },
  { id: 'MAYA', name: 'Maya Protocol', symbol: 'CACAO', category: 'cosmos', decimals: 10 },
  // Other Chains
  { id: 'XMR', name: 'Monero', symbol: 'XMR', category: 'other', decimals: 12 },
  { id: 'NEAR', name: 'NEAR', symbol: 'NEAR', category: 'other', decimals: 24 },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', category: 'other', decimals: 9 },
  { id: 'SUI', name: 'Sui', symbol: 'SUI', category: 'other', decimals: 9 },
  { id: 'XRD', name: 'Radix', symbol: 'XRD', category: 'other', decimals: 18 },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA', category: 'other', decimals: 6 },
  { id: 'XRP', name: 'Ripple', symbol: 'XRP', category: 'other', decimals: 6 },
  { id: 'TRON', name: 'Tron', symbol: 'TRX', category: 'other', decimals: 6 },
]

/** True when suite was started with `--nomonero` / `NO_MONERO=1`. */
export const isMoneroDisabled = (): boolean => import.meta.env.VITE_NO_MONERO === '1'

export const SUPPORTED_CHAINS: ChainConfig[] = isMoneroDisabled()
  ? ALL_SUPPORTED_CHAINS.filter((c) => c.id !== 'XMR')
  : ALL_SUPPORTED_CHAINS

export const getChainById = (id: string): ChainConfig | undefined => SUPPORTED_CHAINS.find((c) => c.id === id)

export const getChainsByCategory = (category: ChainCategory): ChainConfig[] =>
  SUPPORTED_CHAINS.filter((c) => c.category === category)

export const CHAIN_CATEGORIES: ChainCategory[] = ['utxo', 'evm', 'cosmos', 'other']

/**
 * Minimum swap amounts per chain (in asset units, not base).
 * Derived from THORChain/MAYAChain dust thresholds:
 *   BTC, BCH, LTC: 10,000 sats = 0.0001
 *   DOGE: 1,000,000 sats = 0.01
 *   DASH: 10,000 sats = 0.0001
 * Amounts below these will be rejected by the AMMs or fail at the UTXO client level.
 */
export const CHAIN_MIN_SWAP_AMOUNT: Record<string, number> = {
  BTC: 0.0001,
  BCH: 0.0001,
  LTC: 0.0001,
  DOGE: 0.01,
  DASH: 0.0001,
  ZEC: 0.00001,
}
