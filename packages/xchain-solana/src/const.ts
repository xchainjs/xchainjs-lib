import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

import { SOLClientParams } from './types'

/**
 * Solana chain symbol
 */
export const SOLChain = 'SOL' as const

/**
 * Solana native asset decimals
 */
export const SOL_DECIMALS = 9

/**
 * Solana native asset
 */
export const SOLAsset: Asset = {
  chain: 'SOL',
  ticker: 'SOL',
  symbol: 'SOL',
  type: AssetType.NATIVE,
}

const mainnetExplorer = new ExplorerProvider(
  'https://explorer.solana.com/',
  'https://explorer.solana.com/address/%%ADDRESS%%',
  'https://explorer.solana.com/tx/%%TX_ID%%',
)

export const defaultSolanaParams: SOLClientParams = {
  network: Network.Mainnet,
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/501'/",
    [Network.Testnet]: "m/44'/501'/",
    [Network.Stagenet]: "m/44'/501'/",
  },
  explorerProviders: {
    [Network.Mainnet]: mainnetExplorer,
    [Network.Testnet]: new ExplorerProvider(
      'https://explorer.solana.com/?cluster=testnet',
      'https://explorer.solana.com/address/%%ADDRESS%%?cluster=testnet',
      'https://explorer.solana.com/tx/%%TX_ID%%?cluster=testnet',
    ),
    [Network.Stagenet]: mainnetExplorer,
  },
}
