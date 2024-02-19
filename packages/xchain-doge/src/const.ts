import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  SochainNetwork,
  SochainProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'
/**
 * Minimum transaction fee for Dogecoin transactions.
 * Defined as 100000 satoshi/kB.
 * @see https://github.com/dogecoin/dogecoin/blob/master/src/validation.h#L58
 */
export const MIN_TX_FEE = 100000

/**
 * Decimal places for Dogecoin.
 */
export const DOGE_DECIMAL = 8

/**
 * Lower fee bound for Dogecoin transactions.
 * Referenced from Dogecoin fee recommendation documentation.
 * @see https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md
 */
export const LOWER_FEE_BOUND = 100

/**
 * Upper fee bound for Dogecoin transactions.
 * Referenced from Dogecoin fee recommendation documentation.
 * @see https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md
 */
export const UPPER_FEE_BOUND = 20_000_000

/**
 * Chain identifier for Dogecoin.
 */
export const DOGEChain = 'DOGE' as const

/**
 * Base asset object for Dogecoin.
 * Represents the Dogecoin asset in various contexts.
 */
export const AssetDOGE: Asset = { chain: DOGEChain, symbol: 'DOGE', ticker: 'DOGE', synth: false }

/**
 * Explorer provider for Dogecoin mainnet and testnet.
 * Provides URLs for exploring Dogecoin transactions and addresses.
 */
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

/**
 * Sochain data providers for Dogecoin mainnet and testnet.
 * Provides API access to Sochain for Dogecoin.
 */
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

/**
 * Blockcypher data providers for Dogecoin mainnet and stagenet.
 * Provides API access to Blockcypher for Dogecoin.
 */
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

/**
 * Bitgo data providers for Dogecoin mainnet and stagenet.
 * Provides API access to Bitgo for Dogecoin.
 */
const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: DOGEChain,
})

export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
