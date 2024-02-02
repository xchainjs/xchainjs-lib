import { Network } from '@xchainjs/xchain-client/lib'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, baseAmount } from '@xchainjs/xchain-util'

import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

/**
 * The decimal for cosmos chain.
 */
export const COSMOS_DECIMAL = 6

/**
 * Default gas limit
 * As same as definition in Cosmosstation's web wallet
 * @see https://github.com/cosmostation/web-wallet-ts-react/blob/4d78718b613defbd6c92079b33aa8ce9f86d597c/src/constants/chain.ts#L76
 */
export const DEFAULT_GAS_LIMIT = '200000'

/**
 * Default fee
 * As same as definition in Cosmosstation's web wallet
 * @see https://github.com/cosmostation/web-wallet-ts-react/blob/4d78718b613defbd6c92079b33aa8ce9f86d597c/src/constants/chain.ts#L66
 */
export const DEFAULT_FEE = baseAmount(5000, COSMOS_DECIMAL)

/**
 * Chain identifier for Cosmos chain
 *
 */
export const GAIAChain = 'GAIA' as const
/**
 * Base "chain" asset on cosmos main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetATOM: Asset = { chain: GAIAChain, symbol: 'ATOM', ticker: 'ATOM', synth: false }

/**
 * Native Cosmos asset denom
 */
export const DENOM_ATOM = 'uatom' as const

/**
 * ATOM asset number of decimals
 */
export const ATOM_DECIMAL = 6

/**
 * Message type url used to make transactions
 */
export const MSG_SEND_TYPE_URL = '/cosmos.bank.v1beta1.MsgSend' as const

/**
 * Default Cosmos client params
 */
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
