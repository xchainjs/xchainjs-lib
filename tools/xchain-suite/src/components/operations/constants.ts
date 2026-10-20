export const EXPLORER_TX_URLS: Record<string, string> = {
  BTC: 'https://blockstream.info/tx/',
  BCH: 'https://blockchair.com/bitcoin-cash/transaction/',
  LTC: 'https://blockchair.com/litecoin/transaction/',
  DOGE: 'https://blockchair.com/dogecoin/transaction/',
  DASH: 'https://blockchair.com/dash/transaction/',
  ZEC: 'https://blockchair.com/zcash/transaction/',
  ETH: 'https://etherscan.io/tx/',
  AVAX: 'https://snowtrace.io/tx/',
  BSC: 'https://bscscan.com/tx/',
  ARB: 'https://arbiscan.io/tx/',
  BASE: 'https://basescan.org/tx/',
  GAIA: 'https://www.mintscan.io/cosmos/txs/',
  THOR: 'https://runescan.io/tx/',
  MAYA: 'https://www.explorer.mayachain.info/tx/',
  NEAR: 'https://nearblocks.io/txns/',
  SOL: 'https://solscan.io/tx/',
  SUI: 'https://suiscan.xyz/mainnet/tx/',
  ADA: 'https://cardanoscan.io/transaction/',
  XRP: 'https://xrpscan.com/tx/',
  TRON: 'https://tronscan.org/#/transaction/',
}

export function getExplorerTxUrl(chainId: string, txHash: string): string | null {
  const baseUrl = EXPLORER_TX_URLS[chainId]
  return baseUrl ? `${baseUrl}${txHash}` : null
}
