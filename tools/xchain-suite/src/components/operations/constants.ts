/**
 * Explorer transaction URL prefixes by chain ID.
 * Append the transaction hash to get the full explorer URL.
 */
export const EXPLORER_TX_URLS: Record<string, string> = {
  // UTXO chains
  BTC: 'https://blockstream.info/tx/',
  BCH: 'https://blockchair.com/bitcoin-cash/transaction/',
  LTC: 'https://blockchair.com/litecoin/transaction/',
  DOGE: 'https://blockchair.com/dogecoin/transaction/',
  DASH: 'https://blockchair.com/dash/transaction/',
  ZEC: 'https://blockchair.com/zcash/transaction/',
  // EVM chains
  ETH: 'https://etherscan.io/tx/',
  AVAX: 'https://snowtrace.io/tx/',
  BSC: 'https://bscscan.com/tx/',
  ARB: 'https://arbiscan.io/tx/',
  // Cosmos chains
  GAIA: 'https://www.mintscan.io/cosmos/txs/',
  THOR: 'https://runescan.io/tx/',
  MAYA: 'https://www.mayascan.org/tx/',
  KUJI: 'https://finder.kujira.network/kaiyo-1/tx/',
  // Other chains
  SOL: 'https://solscan.io/tx/',
  XRD: 'https://dashboard.radixdlt.com/transaction/',
  ADA: 'https://cardanoscan.io/transaction/',
}

/**
 * Get the explorer URL for a transaction hash on a given chain.
 * Returns null if the chain is not supported.
 */
export function getExplorerTxUrl(chainId: string, txHash: string): string | null {
  const baseUrl = EXPLORER_TX_URLS[chainId]
  return baseUrl ? `${baseUrl}${txHash}` : null
}
