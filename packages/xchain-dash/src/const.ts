import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import {
  BitgoProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-utxo-providers'

/**
 * @deprecated No longer applied as a fee floor.
 * 1000 duff/kB, similar to `minrelaytxfee`. @see https://github.com/dashpay/dash/blob/master/src/validation.h
 */
export const MIN_TX_FEE = 1000

export const DASH_DECIMAL = 8

export const LOWER_FEE_BOUND = 1

export const UPPER_FEE_BOUND = 500

export const DASH_SYMBOL = 'Đ'
export const DEFAULT_FEE_RATE = 1

export const DASHChain = 'DASH' as const

/** Thorchain asset shape. @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24 */
export const AssetDASH: Asset = { chain: DASHChain, symbol: 'DASH', ticker: 'DASH', type: AssetType.NATIVE }

const DASH_MAINNET_EXPLORER = new ExplorerProvider(
  'https://blockchair.com/dash',
  'https://blockchair.com/dash/address/%%ADDRESS%%',
  'https://blockchair.com/dash/transaction/%%TX_ID%%',
)

const DASH_TESTNET_EXPLORER = new ExplorerProvider(
  'https://blockexplorer.one/dash/testnet/',
  'https://blockexplorer.one/dash/testnet/address/%%ADDRESS%%',
  'https://blockexplorer.one/dash/testnet/tx/%%TX_ID%%',
)

export const explorerProviders = {
  [Network.Testnet]: DASH_TESTNET_EXPLORER,
  [Network.Stagenet]: DASH_MAINNET_EXPLORER,
  [Network.Mainnet]: DASH_MAINNET_EXPLORER,
}

const mainnetBlockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  DASHChain,
  AssetDASH,
  DASH_DECIMAL,
  BlockcypherNetwork.DASH,
)

export const BlockcypherDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBlockcypherProvider,
  [Network.Mainnet]: mainnetBlockcypherProvider,
}

const mainnetBitgoProvider = new BitgoProvider({
  baseUrl: 'https://app.bitgo.com',
  chain: DASHChain,
})

export const BitgoProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBitgoProvider,
  [Network.Mainnet]: mainnetBitgoProvider,
}
