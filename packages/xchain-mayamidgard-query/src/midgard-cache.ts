import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { CachedValue } from '@xchainjs/xchain-util'

import { Midgard } from './utils/midgard'

const MILLISECOND_CACHE_POOLS = 5000

/**
 * This class retrieves raw information from Midgard API and cached it
 */
export class MidgardCache {
  readonly midgard: Midgard
  private readonly cachedPools: CachedValue<PoolDetail[]>
  /**
   * Constructor to create a ThorchainCache
   *
   * @param {Midgard} midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @returns MidgardCache
   */
  constructor(midgard = new Midgard()) {
    this.midgard = midgard
    this.cachedPools = new CachedValue<PoolDetail[]>(() => this.midgard.getPools(), MILLISECOND_CACHE_POOLS)
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
