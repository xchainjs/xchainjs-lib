import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { CachedValue } from '@xchainjs/xchain-util'

import { MidgardApi } from './midgard-api'

const MILLISECOND_CACHE_POOLS = 5000

/**
 * This class retrieves raw information from Midgard API and cached it
 */
export class MidgardCache {
  readonly midgardApi: MidgardApi
  private readonly cachedPools: CachedValue<PoolDetail[]>
  /**
   * Constructor to create a ThorchainCache
   *
   * @param {MidgardApi} midgardApi - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @returns MidgardCache
   */
  constructor(midgardApi = new MidgardApi()) {
    this.midgardApi = midgardApi
    this.cachedPools = new CachedValue<PoolDetail[]>(() => this.midgardApi.getPools(), MILLISECOND_CACHE_POOLS)
  }

  /**
   * Get info about existing pools in the protocol from Midgard API
   *
   * @returns {PoolDetail[]} Array of pools
   */
  public async getPools(): Promise<PoolDetail[]> {
    return this.cachedPools.getValue()
  }
}
