import { Asset, AssetType, Chain } from '@xchainjs/xchain-util/lib'

// XRP chain identifier
export const XRPChain: Chain = 'XRP' as const

// XRP asset definition
export const AssetXRP: Asset = {
  chain: XRPChain,
  symbol: 'XRP',
  ticker: 'XRP',
  type: AssetType.NATIVE,
}

// Decimal places for XRP (drops: 1 XRP = 1,000,000 drops)
export const XRP_DECIMAL = 6

// Minimum transaction fee in drops (default base fee)
export const DEFAULT_FEE = 10
