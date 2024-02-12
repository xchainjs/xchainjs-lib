import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { CachedValue } from '@xchainjs/xchain-util'

import { MidgardApi } from './midgard-api'

/**
 * Milliseconds for caching pool data.
 */
const MILLISECOND_CACHE_POOLS = 5000

/**
 * This class retrieves raw information from the Midgard API and caches it.
 */
export class MidgardCache {
  readonly midgardApi: MidgardApi
  private readonly cachedPools: CachedValue<PoolDetail[]>

  /**
   * Constructor to create a MidgardCache instance.
   * @param {MidgardApi} midgardApi - An instance of the Midgard API (could be pointing to stagenet, testnet, mainnet).
   * @returns MidgardCache
   */
  constructor(midgardApi = new MidgardApi()) {
    this.midgardApi = midgardApi
    this.cachedPools = new CachedValue<PoolDetail[]>(() => this.midgardApi.getPools(), MILLISECOND_CACHE_POOLS)
  }

  /**
   * Get information about existing pools in the protocol from the Midgard API.
   * @returns {PoolDetail[]} Array of pool details.
   */
  public async getPools(): Promise<PoolDetail[]> {
    return this.cachedPools.getValue()
  }
}
