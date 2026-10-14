import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, AssetType, baseAmount, BaseAmount } from '@xchainjs/xchain-util'

import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

export const COSMOS_DECIMAL = 6

/**
 * As defined in Cosmosstation's web wallet.
 * @see https://github.com/cosmostation/web-wallet-ts-react/blob/4d78718b613defbd6c92079b33aa8ce9f86d597c/src/constants/chain.ts#L76
 */
export const DEFAULT_GAS_LIMIT = '200000'

/**
 * As defined in Cosmosstation's web wallet.
 * @see https://github.com/cosmostation/web-wallet-ts-react/blob/4d78718b613defbd6c92079b33aa8ce9f86d597c/src/constants/chain.ts#L66
 */
export const DEFAULT_FEE: BaseAmount = baseAmount(5000, COSMOS_DECIMAL)

export const GAIAChain = 'GAIA' as const

/**
 * Based on the definition in Thorchain `common`.
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetATOM: Asset = { chain: GAIAChain, symbol: 'ATOM', ticker: 'ATOM', type: AssetType.NATIVE }

export const ATOM_DENOM = 'uatom' as const

export const MSG_SEND_TYPE_URL = '/cosmos.bank.v1beta1.MsgSend' as const

export const defaultClientConfig: CosmosSdkClientParams = {
  chain: GAIAChain,
  network: Network.Mainnet,
  clientUrls: getDefaultClientUrls(),
  rootDerivationPaths: getDefaultRootDerivationPaths(),
  prefix: 'cosmos',
  defaultDecimals: 6,
  defaultFee: DEFAULT_FEE,
  baseDenom: 'uatom',
  registryTypes: [],
}
