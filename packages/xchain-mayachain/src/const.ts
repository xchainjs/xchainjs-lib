import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, AssetType, TokenAsset, baseAmount, BaseAmount } from '@xchainjs/xchain-util'

import types from './types/proto/MsgCompiled'
import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

export const CACAO_DECIMAL = 10

export const CACAO_DENOM = 'cacao'

export const MAYA_DENOM = 'maya'

export const MAYA_DECIMAL = 4

export const SYNTH_DECIMAL = 8

export const DEFAULT_GAS_LIMIT_VALUE = '4000000'

export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'

export const MAYAChain = 'MAYA' as const

export const DEFAULT_FEE: BaseAmount = baseAmount(2000000000, CACAO_DECIMAL)

/**
 * Based on definition in mayachain `common`
 * @see https://gitlab.com/mayachain/mayanode
 */
export const AssetCacao: Asset = { chain: MAYAChain, symbol: 'CACAO', ticker: 'CACAO', type: AssetType.NATIVE }

export const AssetMaya: TokenAsset = { chain: MAYAChain, symbol: 'MAYA', ticker: 'MAYA', type: AssetType.TOKEN }

export const MSG_SEND_TYPE_URL = '/types.MsgSend' as const

export const MSG_DEPOSIT_TYPE_URL = '/types.MsgDeposit' as const

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
