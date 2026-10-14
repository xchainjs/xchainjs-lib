import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { CachedValue } from '@xchainjs/xchain-util'

import { MidgardApi } from './midgard-api'

const MILLISECOND_CACHE_POOLS = 5000

export class MidgardCache {
  readonly midgardApi: MidgardApi
  private readonly cachedPools: CachedValue<PoolDetail[]>

  constructor(midgardApi = new MidgardApi()) {
    this.midgardApi = midgardApi
    this.cachedPools = new CachedValue<PoolDetail[]>(() => this.midgardApi.getPools(), MILLISECOND_CACHE_POOLS)
  }

  public async getPools(): Promise<PoolDetail[]> {
    return this.cachedPools.getValue()
  }
}
