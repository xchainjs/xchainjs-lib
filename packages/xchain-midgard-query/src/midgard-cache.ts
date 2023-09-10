import { PoolDetail, SaverDetails } from '@xchainjs/xchain-midgard'
import { CachedValue } from '@xchainjs/xchain-util'

import { Midgard } from './utils/midgard'

const MILLISECOND_CACHE_POOLS = 5000
const MILLISECOND_CACHE_SAVERS = 5000

const defaultMidgard = new Midgard()

/**
 * This class manages retrieving information from Midgard API and cached it
 */
export class MidgardCache {
  private readonly midgard: Midgard
  private readonly cachedPools: CachedValue<PoolDetail[]>
  private readonly cachedSavers: CachedValue<SaverDetails>
  /**
   * Constructor to create a ThorchainCache
   *
   * @param midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @returns MidgardCache
   */
  constructor(midgard = defaultMidgard) {
    this.midgard = midgard
    this.cachedPools = new CachedValue<PoolDetail[]>(() => this.midgard.getPools(), MILLISECOND_CACHE_POOLS)
    this.cachedSavers = new CachedValue<SaverDetails>(() => this.midgard.getSavers(''), MILLISECOND_CACHE_SAVERS)
  }

  public async getPools(): Promise<PoolDetail[]> {
    return this.cachedPools.getValue()
  }

  public async getSavers(address: string): Promise<SaverDetails> {
    return this.cachedSavers.getValue(address)
  }
}
