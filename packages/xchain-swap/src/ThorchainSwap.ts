import { Configuration, MIDGARD_API_TS_URL, MidgardApi } from '@xchainjs/xchain-midgard/lib'

import { LiquidityPool } from './LiquidityPool'

type PoolCache = {
  lastRefreshed: number
  pools: LiquidityPool[]
}

export class ThorchainSwap {
  private midgardApi: MidgardApi
  private poolCache: PoolCache | undefined

  constructor() {
    this.midgardApi = new MidgardApi(new Configuration({ basePath: MIDGARD_API_TS_URL }))
    this.refereshPoolCache()
  }
  prepareSwap() {

  }
  private async refereshPoolCache() {
    try {
      const pools = (await this.midgardApi.getPools()).data
      if (pools) {
        const lps = pools.map((pool) => new LiquidityPool(pool))
        this.poolCache = {
          lastRefreshed: Date.now(),
          pools: lps,
        }
        console.log('updated pool cache')
      }
    } catch (error) {
      console.error(error)
    }
  }
}
