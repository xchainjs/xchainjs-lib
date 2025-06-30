/**
 * Import necessary modules and types for the Thorchain client configuration.
 */
import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, AssetType, BaseAmount, TokenAsset, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import types from './types/proto/MsgCompiled'
import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

/**
 * Explorer Url for THORChain
 */
export const DEFAULT_EXPLORER_URL = 'https://runescan.io'

/**
 * Number of decimals for the RUNE asset
 */
export const RUNE_DECIMAL = 8

/**
 * Denomination of the RUNE asset
 */
export const RUNE_DENOM = 'rune'

/**
 * Denomination of the TCY asset
 */
export const TCY_DENOM = 'tcy'

/**
 * Denomination of the ruji asset
 */
export const RUJI_DENOM = 'x/ruji'

/**
 * Ticker symbol for the RUNE asset
 */
export const RUNE_TICKER = 'RUNE'

/**
 * Ticker symbol for the TCY asset
 */
export const TCY_TICKER = 'TCY'

/**
 * Ticker symbol for the RUJI asset
 */
export const RUJI_TICKER = 'RUJI'

/**
 * Default fee used by the client to make transactions
 */
export const DEFAULT_FEE: BaseAmount = assetToBase(assetAmount(0.02, RUNE_DECIMAL))

/**
 * Default gas used by the transfer offline function
 */
export const DEFAULT_GAS_LIMIT_VALUE = '6000000'

/**
 * Default gas used by the deposit function
 */
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'

/**
 * Symbol for THORChain
 */
export const THORChain = 'THOR' as const

/**
 * Native asset representation for RUNE in Thorchain
 */
export const AssetRuneNative: Asset = {
  chain: THORChain,
  symbol: RUNE_TICKER,
  ticker: RUNE_TICKER,
  type: AssetType.NATIVE,
}

/**
 * Native asset representation for TCY in Thorchain
 */
export const AssetTCY: TokenAsset = {
  chain: THORChain,
  symbol: TCY_TICKER,
  ticker: TCY_TICKER,
  type: AssetType.TOKEN,
}

/**
 * Native asset representation for TCY in Thorchain
 */
export const AssetRUJI: Asset = {
  chain: THORChain,
  symbol: RUJI_TICKER,
  ticker: RUJI_TICKER,
  type: AssetType.NATIVE,
}

/**
 * Message type URL used to make send transactions
 */
export const MSG_SEND_TYPE_URL = '/types.MsgSend' as const

/**
 * Message type URL used to make deposit transactions
 */
export const MSG_DEPOSIT_TYPE_URL = '/types.MsgDeposit' as const

/**
 * Default configuration parameters used by the client
 */
export const defaultClientConfig: CosmosSdkClientParams = {
  chain: AssetRuneNative.chain,
  network: Network.Mainnet,
  clientUrls: getDefaultClientUrls(),
  rootDerivationPaths: getDefaultRootDerivationPaths(),
  prefix: 'thor',
  defaultDecimals: RUNE_DECIMAL,
  defaultFee: DEFAULT_FEE,
  baseDenom: RUNE_DENOM,
  registryTypes: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [MSG_SEND_TYPE_URL, { ...(types.types.MsgSend as any) }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [MSG_DEPOSIT_TYPE_URL, { ...(types.types.MsgDeposit as any) }],
  ],
}
