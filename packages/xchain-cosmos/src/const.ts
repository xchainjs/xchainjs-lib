import { Network } from '@xchainjs/xchain-client/lib'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, baseAmount } from '@xchainjs/xchain-util'

import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

/**
 * Number of decimals for the native asset of the Cosmos network.
 */
export const COSMOS_DECIMAL = 6

/**
 * Default gas limit for Cosmos transactions.
 * As defined in Cosmosstation's web wallet.
 * @see https://github.com/cosmostation/web-wallet-ts-react/blob/4d78718b613defbd6c92079b33aa8ce9f86d597c/src/constants/chain.ts#L76
 */
export const DEFAULT_GAS_LIMIT = '200000'

/**
 * Default fee for Cosmos transactions.
 * As defined in Cosmosstation's web wallet.
 * @see https://github.com/cosmostation/web-wallet-ts-react/blob/4d78718b613defbd6c92079b33aa8ce9f86d597c/src/constants/chain.ts#L66
 */
export const DEFAULT_FEE = baseAmount(5000, COSMOS_DECIMAL)

/**
 * Chain identifier for the Cosmos network.
 */
export const GAIAChain = 'GAIA' as const

/**
 * Base "chain" asset on the Cosmos mainnet.
 * Based on the definition in Thorchain `common`.
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetATOM: Asset = { chain: GAIAChain, symbol: 'ATOM', ticker: 'ATOM', synth: false }

/**
 * Denomination for the native Cosmos asset.
 */
export const ATOM_DENOM = 'uatom' as const

/**
 * Message type URL used to make transactions on the Cosmos network.
 */
export const MSG_SEND_TYPE_URL = '/cosmos.bank.v1beta1.MsgSend' as const

/**
 * Default parameters for Cosmos SDK client configuration.
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
