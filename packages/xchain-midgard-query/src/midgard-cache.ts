import { PoolDetail } from '@xchainjs/xchain-midgard'
import { CachedValue } from '@xchainjs/xchain-util'

import { Midgard } from './utils/midgard'

const MILLISECOND_CACHE_POOLS = 5000

const defaultMidgard = new Midgard()

export class MidgardCache {
  readonly midgard: Midgard
  private readonly cachedPools: CachedValue<PoolDetail[]>

  constructor(midgard = defaultMidgard) {
    this.midgard = midgard
    this.cachedPools = new CachedValue<PoolDetail[]>(() => this.midgard.getPools(), MILLISECOND_CACHE_POOLS)
  }

  public async getPools(): Promise<PoolDetail[]> {
    return this.cachedPools.getValue()
  }
}
