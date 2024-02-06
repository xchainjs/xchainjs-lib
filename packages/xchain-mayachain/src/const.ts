import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, baseAmount } from '@xchainjs/xchain-util'

import types from './types/proto/MsgCompiled'
import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

/**
 * CACAO asset number of decimals
 */
export const CACAO_DECIMAL = 10

/**
 * CACAO denom
 */
export const CACAO_DENOM = 'cacao'

/**
 * MAYA denom
 */
export const MAYA_DENOM = 'maya'

/**
 * MAYA asset number of decimals
 */
export const MAYA_DECIMAL = 4

export const DEFAULT_GAS_LIMIT_VALUE = '4000000'
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'

/**
 * Chain identifier for MayaChain
 *
 */
export const MAYAChain = 'MAYA' as const

/**
 * Mayachain default fee
 */
export const DEFAULT_FEE = baseAmount(5000000000, CACAO_DECIMAL)

/**
 * Base "chain" asset on mayachain main net.
 *
 * Based on definition in mayachain `common`
 * @see https://gitlab.com/mayachain/mayanode
 */
export const AssetCacao: Asset = { chain: MAYAChain, symbol: 'CACAO', ticker: 'CACAO', synth: false }

/**
 * Maya asset
 */
export const AssetMaya: Asset = { chain: MAYAChain, symbol: 'MAYA', ticker: 'MAYA', synth: false }

/**
 * Message type url used to make transactions
 */
export const MSG_SEND_TYPE_URL = '/types.MsgSend' as const

/**
 * Message type url used to make deposits
 */
export const MSG_DEPOSIT_TYPE_URL = '/types.MsgDeposit' as const

/**
 * Default parameters used by the client
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
