import { Network } from '@xchainjs/xchain-client/lib'
import { Asset } from '@xchainjs/xchain-util/lib'

import { ExplorerUrls } from './types'

const MAINNET_EXPLORER_URL = 'https://mayascan.org'
const STAGENET_EXPLORER_URL = 'https://stagenet.mayascan.org'

export const CACAO_DECIMAL = 10
export const MAYA_SYNTH_DECIMAL = 8
export const MAYA_DECIMAL = 4
export const DEFAULT_GAS_ADJUSTMENT = 2
export const DEFAULT_GAS_LIMIT_VALUE = '4000000'
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'
export const MAX_TX_COUNT = 100
export const defaultExplorerUrls: ExplorerUrls = {
  root: {
    [Network.Testnet]: `deprecated`,
    [Network.Stagenet]: STAGENET_EXPLORER_URL,
    [Network.Mainnet]: MAINNET_EXPLORER_URL,
  },
  tx: {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/tx`,
    [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/tx`,
  },
  address: {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/address`,
    [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/address`,
  },
}

/**
 * Chain identifier for MayaChain
 *
 */
export const MAYAChain = 'MAYA' as const

/**
 * Base "chain" asset on mayachain main net.
 *
 * Based on definition in mayachain `common`
 * @see https://gitlab.com/mayachain/mayanode
 */
export const AssetCacao: Asset = { chain: MAYAChain, symbol: 'CACAO', ticker: 'CACAO', synth: false }
export const AssetMaya: Asset = { chain: MAYAChain, symbol: 'MAYA', ticker: 'MAYA', synth: false }
