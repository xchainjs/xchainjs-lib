import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { Asset, assetToString } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'

/**
 * Class for getting data and process from Midgard API using MidgardCache for optimize request number (MAYAChain L2 Api).
 */
export class MidgardQuery {
  private midgardCache: MidgardCache

  /**
   * Constructor to create a MidgardQuery
   * @param midgardCache - an instance of the midgardCache (could be pointing to stagenet,testnet,mainnet)
   * @returns MidgardQuery
   */
  constructor(midgardCache = new MidgardCache()) {
    this.midgardCache = midgardCache
  }

  /**
   * Gets the latest block using the Health endpoint within Midgard
   * @returns
   */
  public async getLatestBlockHeight(): Promise<number> {
    const health = await this.midgardCache.midgardApi.getHealth()
    return +health.scannerHeight
  }

  /**
   * Get pool list
   * @returns an array containing details for a set of pools
   */
  public async getPools(): Promise<PoolDetail[]> {
    return this.midgardCache.getPools()
  }

  /**
   * Get pool by string asset
   *
   * @param {Asset} asset In example: BTC.BTC
   * @returns {PoolDetail} Details of selected pool
   * @throws {Error} Can't find pool for asset
   */
  public async getPool(asset: Asset): Promise<PoolDetail> {
    const pools = await this.midgardCache.getPools()
    const assetStringify = assetToString(asset)
    const pool = pools.find((pool) => pool.asset === assetStringify)
    if (!pool) {
      throw new Error(`Can't find pool for asset: ${asset}`)
    }
    return pool
  }
}
