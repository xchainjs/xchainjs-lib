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
  { id: 'LTC', name: 'Litecoin', symbol: 'LTC', category: 'utxo', decimals: 8 },
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE', category: 'utxo', decimals: 8 },
  // EVM Chains
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', category: 'evm', decimals: 18 },
  // Cosmos Chains
  { id: 'THOR', name: 'THORChain', symbol: 'RUNE', category: 'cosmos', decimals: 8 },
]

export const getChainById = (id: string): ChainConfig | undefined => SUPPORTED_CHAINS.find((c) => c.id === id)

export const getChainsByCategory = (category: ChainCategory): ChainConfig[] =>
  SUPPORTED_CHAINS.filter((c) => c.category === category)

export const CHAIN_CATEGORIES: ChainCategory[] = ['utxo', 'evm', 'cosmos', 'other']
