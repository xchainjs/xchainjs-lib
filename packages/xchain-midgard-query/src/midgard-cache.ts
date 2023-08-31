import { PoolDetail, SaverDetails } from '@xchainjs/xchain-midgard'

import { CachedValue } from './utils'
import { Midgard } from './utils/midgard'

const MILLISECOND_CACHE_POOLS = 5000
const MILLISECOND_CACHE_SAVERS = 5000

const defaultMidgard = new Midgard()

/**
 * This class manages retrieving information from Midgard API and cached it
 */
export class MidgardCache {
  private readonly midgard: Midgard
  /**
   * Constructor to create a ThorchainCache
   *
   * @param midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @returns MidgardCache
   */
  constructor(midgard = defaultMidgard) {
    this.midgard = midgard
  }

  public async getPools(): Promise<PoolDetail[]> {
    return new CachedValue<PoolDetail[]>(() => this.midgard.getPools(), MILLISECOND_CACHE_POOLS).getValue()
  }

  public async getSavers(address: string): Promise<SaverDetails> {
    return new CachedValue<SaverDetails>(() => this.midgard.getSavers(address), MILLISECOND_CACHE_SAVERS).getValue()
  }
}
