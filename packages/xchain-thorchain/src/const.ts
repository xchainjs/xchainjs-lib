import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import types from './types/proto/MsgCompiled'
import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

/**
 * Explorer Url
 */
export const DEFAULT_EXPLORER_URL = 'https://runescan.io'

/**
 * RUNE asset number of decimals
 */
export const RUNE_DECIMAL = 8

/**
 * RUNE asset denom
 */
export const RUNE_DENOM = 'rune'

/**
 * RUNE asset ticker
 */
export const RUNE_TICKER = 'RUNE'

/**
 * Default fee used by the client to make transaction
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
 * Thorchain chain symbol
 */
export const THORChain = 'THOR' as const

/**
 * Thorchain native asset
 */
export const AssetRuneNative: Asset = { chain: THORChain, symbol: RUNE_TICKER, ticker: RUNE_TICKER, synth: false }

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
