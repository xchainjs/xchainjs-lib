export interface ChainAsset {
  chainId: string
  chainName: string
  symbol: string
  contractAddress?: string
  decimals?: number
  /** True for non-native tokens without a contract address (e.g. MAYA on MAYAChain) */
  isToken?: boolean
}
