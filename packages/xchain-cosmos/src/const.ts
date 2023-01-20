import { Asset, baseAmount } from '@xchainjs/xchain-util'

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
