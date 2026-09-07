import { AssetType, type TokenAsset } from '@xchainjs/xchain-util'

import type { ChainAsset } from './types'

/** Circle USDC on NEAR (NEP-141). */
export const NEAR_CIRCLE_USDC_CONTRACT =
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1'

/** Known NEP-141 assets used by suite swap / balance / transfer UIs. */
export const NEAR_TOKEN_ASSETS: ChainAsset[] = [
  {
    chainId: 'NEAR',
    chainName: 'NEAR',
    symbol: 'USDC',
    contractAddress: NEAR_CIRCLE_USDC_CONTRACT,
    decimals: 6,
  },
  {
    chainId: 'NEAR',
    chainName: 'NEAR',
    symbol: 'wNEAR',
    contractAddress: 'wrap.near',
    decimals: 24,
  },
]

/** TokenAsset form for `client.getBalance(address, assets)`. */
export const NEAR_POOL_TOKENS: TokenAsset[] = NEAR_TOKEN_ASSETS.map((token) => ({
  chain: 'NEAR',
  symbol: `${token.symbol}-${token.contractAddress}`,
  ticker: token.symbol,
  type: AssetType.TOKEN,
}))
