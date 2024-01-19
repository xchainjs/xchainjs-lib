import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import types from './types/proto/MsgCompiled'
import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

export const DEFAULT_EXPLORER_URL = 'https://runescan.io'

export const RUNE_DECIMAL = 8
export const RUNE_DENOM = 'rune'

const RUNE_TICKER = 'RUNE'

export const DEFAULT_FEE: BaseAmount = assetToBase(assetAmount(0.02, RUNE_DECIMAL))
export const DEFAULT_GAS_LIMIT_VALUE = '6000000'
export const DEPOSIT_GAS_LIMIT_VALUE = '600000000'

export const THORChain = 'THOR' as const

export const AssetRuneNative: Asset = { chain: THORChain, symbol: RUNE_TICKER, ticker: RUNE_TICKER, synth: false }

export const MSG_SEND_TYPE_URL = '/types.MsgSend' as const
export const MSG_DEPOSIT_TYPE_URL = '/types.MsgDeposit' as const

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
