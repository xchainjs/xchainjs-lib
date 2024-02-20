import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, baseAmount } from '@xchainjs/xchain-util'

import types from './types/proto/MsgCompiled'
import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

/**
 * Number of decimals for the CACAO asset.
 */
export const CACAO_DECIMAL = 10

/**
 * Denomination for the CACAO asset.
 */
export const CACAO_DENOM = 'cacao'

/**
 * Denomination for the MAYA asset.
 */
export const MAYA_DENOM = 'maya'

/**
 * Number of decimals for the MAYA asset.
 */
export const MAYA_DECIMAL = 4

/**
 * Default gas limit value for transactions.
 */
export const DEFAULT_GAS_LIMIT_VALUE = '4000000'

/**
 * Gas limit value for deposit transactions.
 */
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'

/**
 * Chain identifier for MayaChain.
 */
export const MAYAChain = 'MAYA' as const

/**
 * Default fee for MayaChain transactions.
 */
export const DEFAULT_FEE = baseAmount(5000000000, CACAO_DECIMAL)

/**
 * Base "chain" asset on MayaChain main net.
 * Based on definition in mayachain `common`
 * @see https://gitlab.com/mayachain/mayanode
 */
export const AssetCacao: Asset = { chain: MAYAChain, symbol: 'CACAO', ticker: 'CACAO', synth: false, trade: false }

/**
 * Maya asset.
 */
export const AssetMaya: Asset = { chain: MAYAChain, symbol: 'MAYA', ticker: 'MAYA', synth: false, trade: false }

/**
 * Message type URL used to send transactions.
 */
export const MSG_SEND_TYPE_URL = '/types.MsgSend' as const

/**
 * Message type URL used for deposit transactions.
 */
export const MSG_DEPOSIT_TYPE_URL = '/types.MsgDeposit' as const

/**
 * Default configuration parameters used by the client.
 */
export const defaultClientConfig: CosmosSdkClientParams = {
  chain: AssetCacao.chain,
  network: Network.Mainnet,
  clientUrls: getDefaultClientUrls(),
  rootDerivationPaths: getDefaultRootDerivationPaths(),
  prefix: 'maya',
  defaultDecimals: CACAO_DECIMAL,
  defaultFee: DEFAULT_FEE,
  baseDenom: CACAO_DENOM,
  registryTypes: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [MSG_SEND_TYPE_URL, { ...(types.types.MsgSend as any) }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [MSG_DEPOSIT_TYPE_URL, { ...(types.types.MsgDeposit as any) }],
  ],
}
