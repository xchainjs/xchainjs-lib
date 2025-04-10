import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  NownodesProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

export const MIN_TX_FEE = 10000

export const ZEC_DECIMAL = 8

export const LOWER_FEE_BOUND = 1
export const UPPER_FEE_BOUND = 1_000

// export const ZEC_SYMBOL = '₿'
// export const ZEC_SATOSHI_SYMBOL = '⚡'

/**
 * Chain identifier for Zcash mainnet
 */
export const ZECChain = 'ZEC' as const

/**
 * Base "chain" asset on Zcash main net.
 */
export const AssetZEC: Asset = { chain: ZECChain, symbol: 'ZEC', ticker: 'ZEC', type: AssetType.NATIVE }

// Explorer providers for Zcash
const ZEC_MAINNET_EXPLORER = new ExplorerProvider(
  'https://mainnet.zcashexplorer.app/',
  'https://mainnet.zcashexplorer.app/address/%%ADDRESS%%',
  'https://mainnet.zcashexplorer.app/transactions/%%TX_ID%%',
)
const ZEC_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.zcashexplorer.app/',
  'https://testnet.zcashexplorer.app/address/%%ADDRESS%%',
  'https://testnet.zcashexplorer.app/transactions/%%TX_ID%%',
)
export const blockstreamExplorerProviders = {
  [Network.Testnet]: ZEC_TESTNET_EXPLORER,
  [Network.Stagenet]: ZEC_MAINNET_EXPLORER,
  [Network.Mainnet]: ZEC_MAINNET_EXPLORER,
}

// Bitgo data providers for Zcash
// const mainnetBitgoProvider = new BitgoProvider({
//   baseUrl: 'https://app.bitgo.com',
//   chain: ZECChain,
// })

// export const BitgoProviders: UtxoOnlineDataProviders = {
//   [Network.Testnet]: undefined,
//   [Network.Stagenet]: mainnetBitgoProvider,
//   [Network.Mainnet]: mainnetBitgoProvider,
// }

const mainnetNownodesProvider = new NownodesProvider(
  'https://zecbook.nownodes.io/api/v2',
  ZECChain,
  AssetZEC,
  ZEC_DECIMAL,
  process.env.NOWNODES_API_KEY || ''
)

export const NownodesProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetNownodesProvider,
  [Network.Mainnet]: mainnetNownodesProvider,
}

