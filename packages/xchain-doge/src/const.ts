import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockbookProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  SochainNetwork,
  SochainProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'
/**
 * @deprecated No longer applied as a fee floor.
 * 100000 satoshi/kB. @see https://github.com/dogecoin/dogecoin/blob/master/src/validation.h#L58
 */
export const MIN_TX_FEE = 100000

export const DOGE_DECIMAL = 8

/** @see https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md */
export const LOWER_FEE_BOUND = 100

/** @see https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md */
export const UPPER_FEE_BOUND = 20_000_000

export const DOGEChain = 'DOGE' as const

export const AssetDOGE: Asset = { chain: DOGEChain, symbol: 'DOGE', ticker: 'DOGE', type: AssetType.NATIVE }

const DOGE_MAINNET_EXPLORER = new ExplorerProvider(
  'https://blockchair.com/dogecoin',
  'https://blockchair.com/dogecoin/address/%%ADDRESS%%',
  'https://blockchair.com/dogecoin/transaction/%%TX_ID%%',
)
const DOGE_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockexplorer.one/dogecoin/testnet',
  'https://blockexplorer.one/dogecoin/testnet/address/%%ADDRESS%%',
  'https://blockexplorer.one/dogecoin/testnet/tx/%%TX_ID%%',
)
export const blockstreamExplorerProviders = {
  [Network.Testnet]: DOGE_TESTNET_EXPLORER,
  [Network.Stagenet]: DOGE_MAINNET_EXPLORER,
  [Network.Mainnet]: DOGE_MAINNET_EXPLORER,
}

const testnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || '',
  DOGEChain,
  AssetDOGE,
  8,
  SochainNetwork.DOGETEST,
)
const mainnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || '',
  DOGEChain,
  AssetDOGE,
  8,
  SochainNetwork.DOGE,
)
export const sochainDataProviders = {
  [Network.Testnet]: testnetSochainProvider,
  [Network.Stagenet]: mainnetSochainProvider,
  [Network.Mainnet]: mainnetSochainProvider,
}

const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  DOGEChain,
  AssetDOGE,
  8,
  BlockcypherNetwork.DOGE,
  process.env.BLOCKCYPHER_API_KEY || '',
)
export const blockcypherDataProviders = {
  [Network.Testnet]: undefined, //no provider here
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}

// nativeswap.io operated Blockbook instance — no SLA or API key auth - 500 requests per hour
// Changeable to any blockbook api. For example: Nownodes
const mainnetDogeBlockbookProvider = new BlockbookProvider('https://doge.nativeswap.io/api/v2', AssetDOGE, DOGE_DECIMAL)
export const BlockbookDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined, // NowNodes does not provide a DOGE testnet Blockbook node
  [Network.Stagenet]: mainnetDogeBlockbookProvider,
  [Network.Mainnet]: mainnetDogeBlockbookProvider,
}

const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: DOGEChain,
})

export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
