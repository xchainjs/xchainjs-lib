import { Network } from '@xchainjs/xchain-client/lib'
import { Asset } from '@xchainjs/xchain-util/lib'

import { ExplorerUrls } from './types'

const DEFAULT_EXPLORER_URL = 'https://explorer.mayachain.info'
const txUrl = `${DEFAULT_EXPLORER_URL}/tx`
const addressUrl = `${DEFAULT_EXPLORER_URL}/address`

export const DECIMAL = 8
export const DEFAULT_GAS_ADJUSTMENT = 2
export const DEFAULT_GAS_LIMIT_VALUE = '4000000'
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'
export const MAX_TX_COUNT = 100
export const defaultExplorerUrls: ExplorerUrls = {
  root: {
    [Network.Testnet]: `${DEFAULT_EXPLORER_URL}?network=testnet`,
    [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}?network=stagenet`,
    [Network.Mainnet]: DEFAULT_EXPLORER_URL,
  },
  tx: {
    [Network.Testnet]: txUrl,
    [Network.Stagenet]: txUrl,
    [Network.Mainnet]: txUrl,
  },
  address: {
    [Network.Testnet]: addressUrl,
    [Network.Stagenet]: addressUrl,
    [Network.Mainnet]: addressUrl,
  },
}

/**
 * Chain identifier for MayaChain
 *
 */
export const MAYAChain = 'MAYA' as const

/**
 * Base "chain" asset on thorchain main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetCacao: Asset = { chain: MAYAChain, symbol: 'CACAO', ticker: 'CACAO', synth: false }
