import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  SochainNetwork,
  SochainProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

/**
 * Minimum transaction fee in satoshis.
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000
/**
 * Lower bound for transaction fee rate in satoshis per byte.
 */
export const LOWER_FEE_BOUND = 0.5
/**
 * Upper bound for transaction fee rate in satoshis per byte.
 */
export const UPPER_FEE_BOUND = 500
/**
 * Number of decimal places for Litecoin.
 */
export const LTC_DECIMAL = 8

/**
 * Chain identifier for Litecoin.
 */
export const LTCChain = 'LTC' as const

/**
 * Base "chain" asset on Litecoin mainnet.
 *
 * Based on definition in Thorchain `common`.
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetLTC: Asset = { chain: LTCChain, symbol: 'LTC', ticker: 'LTC', type: AssetType.NATIVE }

const LTC_MAINNET_EXPLORER = new ExplorerProvider(
  'https://blockchair.com/litecoin/',
  'https://blockchair.com/litecoin/address/%%ADDRESS%%',
  'https://blockchair.com/litecoin/transaction/%%TX_ID%%',
)
const LTC_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockexplorer.one/litecoin/testnet/',
  'https://blockexplorer.one/litecoin/testnet/address/%%ADDRESS%%',
  'https://blockexplorer.one/litecoin/testnet/blockHash/%%TX_ID%%',
)
/**
 * Explorer providers for Litecoin.
 */
export const explorerProviders = {
  [Network.Testnet]: LTC_TESTNET_EXPLORER,
  [Network.Stagenet]: LTC_MAINNET_EXPLORER,
  [Network.Mainnet]: LTC_MAINNET_EXPLORER,
}
//======================
// sochain
//======================

const testnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || '',
  LTCChain,
  AssetLTC,
  8,
  SochainNetwork.LTCTEST,
)
const mainnetSochainProvider = new SochainProvider(
  'https://sochain.com/api/v3',
  process.env.SOCHAIN_API_KEY || '',
  LTCChain,
  AssetLTC,
  8,
  SochainNetwork.LTC,
)
/**
 * Sochain data providers for Litecoin.
 */
export const sochainDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetSochainProvider,
  [Network.Stagenet]: mainnetSochainProvider,
  [Network.Mainnet]: mainnetSochainProvider,
}
//======================
// Blockcypher
//======================

const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  LTCChain,
  AssetLTC,
  8,
  BlockcypherNetwork.LTC,
  process.env.BLOCKCYPHER_API_KEY || '',
)
/**
 * Blockcypher data providers for Litecoin.
 */
export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}

/**
 * Bitgo data providers for Litecoin.
 */
const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: LTCChain,
})

export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
