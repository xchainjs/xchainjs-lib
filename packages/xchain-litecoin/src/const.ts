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
 * 1000 satoshi/kB, similar to current `minrelaytxfee`. @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000
/** Satoshis per byte. */
export const LOWER_FEE_BOUND = 0.5
/** Satoshis per byte. */
export const UPPER_FEE_BOUND = 500
export const LTC_DECIMAL = 8

export const LTCChain = 'LTC' as const

/** Thorchain asset shape. @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24 */
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
export const explorerProviders = {
  [Network.Testnet]: LTC_TESTNET_EXPLORER,
  [Network.Stagenet]: LTC_MAINNET_EXPLORER,
  [Network.Mainnet]: LTC_MAINNET_EXPLORER,
}
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
export const sochainDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: testnetSochainProvider,
  [Network.Stagenet]: mainnetSochainProvider,
  [Network.Mainnet]: mainnetSochainProvider,
}
const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  LTCChain,
  AssetLTC,
  8,
  BlockcypherNetwork.LTC,
  process.env.BLOCKCYPHER_API_KEY || '',
)
export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}

// nativeswap.io operated Blockbook instance — no SLA or API key auth - 500 requests per hour
// Changeable to any blockbook api. For example: Nownodes
const mainnetLtcBlockbookProvider = new BlockbookProvider('https://ltc.nativeswap.io/api/v2', AssetLTC, LTC_DECIMAL)
export const BlockbookDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined, // NowNodes does not provide an LTC testnet Blockbook node
  [Network.Stagenet]: mainnetLtcBlockbookProvider,
  [Network.Mainnet]: mainnetLtcBlockbookProvider,
}

const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: LTCChain,
})

export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
