import { Amount, Asset } from '@xchainjs/xchain-util'

import { Midgard } from `@thorswap-lib/midgard-sdk`

export interface IPool {
  readonly asset: Asset
  readonly runeDepth: Amount
  readonly assetDepth: Amount
  readonly assetUSDPrice: Amount
  readonly detail: PoolDetail
}

export class Pool implements IPool {

  public readonly asset: Asset
  public readonly runeDepth: Amount
  public readonly
}
