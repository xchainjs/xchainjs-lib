export type ChainCategory = 'utxo' | 'evm' | 'cosmos' | 'other'

export interface ChainConfig {
  id: string
  name: string
  symbol: string
  category: ChainCategory
  decimals: number
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
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
  { id: 'KUJI', name: 'Kujira', symbol: 'KUJI', category: 'cosmos', decimals: 6 },
  // Other Chains
  { id: 'SOL', name: 'Solana', symbol: 'SOL', category: 'other', decimals: 9 },
  { id: 'XRD', name: 'Radix', symbol: 'XRD', category: 'other', decimals: 18 },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA', category: 'other', decimals: 6 },
  { id: 'XRP', name: 'Ripple', symbol: 'XRP', category: 'other', decimals: 6 },
]

export const getChainById = (id: string): ChainConfig | undefined => SUPPORTED_CHAINS.find((c) => c.id === id)

export const getChainsByCategory = (category: ChainCategory): ChainConfig[] =>
  SUPPORTED_CHAINS.filter((c) => c.category === category)

export const CHAIN_CATEGORIES: ChainCategory[] = ['utxo', 'evm', 'cosmos', 'other']
