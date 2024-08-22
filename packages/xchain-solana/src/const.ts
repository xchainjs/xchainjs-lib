import { Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

import { SOLClientParams } from './types'

/**
 * Solana chain symbol
 */
export const SOLChain = 'SOL' as const

/**
 * Solana native asset
 */
export const SOLAsset: Asset = {
  chain: 'SOL',
  ticker: 'SOL',
  symbol: 'SOL',
  type: AssetType.NATIVE,
}

export const defaultSolanaParams: SOLClientParams = {
  network: Network.Mainnet,
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/501'/",
    [Network.Testnet]: "m/44'/501'/",
    [Network.Stagenet]: "m/44'/501'/",
  },
}
