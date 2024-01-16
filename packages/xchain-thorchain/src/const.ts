import { Network } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { getDefaultClientUrls, getDefaultRootDerivationPaths } from './utils'

export const DEFAULT_EXPLORER_URL = 'https://runescan.io'

export const RUNE_DECIMAL = 8
export const RUNE_DENOM = 'rune'

const RUNE_TICKER = 'RUNE'

export const DEFAULT_FEE: BaseAmount = assetToBase(assetAmount(0.02, RUNE_DECIMAL))

export const THORChain = 'THOR' as const

export const AssetRUNE: Asset = { chain: THORChain, symbol: RUNE_TICKER, ticker: RUNE_TICKER, synth: false }

export const defaultClientConfig: CosmosSdkClientParams = {
  chain: AssetRUNE.chain,
  network: Network.Mainnet,
  clientUrls: getDefaultClientUrls(),
  rootDerivationPaths: getDefaultRootDerivationPaths(),
  prefix: 'thor',
  defaultDecimals: RUNE_DECIMAL,
  defaultFee: DEFAULT_FEE,
  baseDenom: RUNE_DENOM,
}
