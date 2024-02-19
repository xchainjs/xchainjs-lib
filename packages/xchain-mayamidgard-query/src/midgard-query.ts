import { Network } from '@xchainjs/xchain-client'
import { MemberDetails, PoolDetail, PoolStatsDetail } from '@xchainjs/xchain-mayamidgard'
import { Asset, assetToString } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { MAYANameDetails, ReverseMAYANames } from './types'

/**
 * Class for retrieving data and processing it from the Midgard API using MidgardCache to optimize the number of requests (MAYAChain L2 API).
 */
export class MidgardQuery {
  private midgardCache: MidgardCache

  /**
   * Constructor to create a MidgardQuery instance.
   * @param midgardCache - An instance of the MidgardCache (could be pointing to stagenet, testnet, mainnet).
   * @returns MidgardQuery
   */
  constructor(midgardCache = new MidgardCache()) {
    this.midgardCache = midgardCache
  }

  /**
   * Retrieves the latest block height using the Health endpoint within Midgard.
   * @returns The latest block height.
   */
  public async getLatestBlockHeight(): Promise<number> {
    const health = await this.midgardCache.midgardApi.getHealth()
    return +health.scannerHeight
  }

  /**
   * Retrieves the list of pools.
   * @returns An array containing details for a set of pools.
   */
  public async getPools(): Promise<PoolDetail[]> {
    return this.midgardCache.getPools()
  }

  /**
   * Retrieves the pool details for a specific asset.
   * @param asset - The asset for which pool details are requested.
   * @returns Details of the selected pool.
   * @throws {Error} If the pool for the asset cannot be found.
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

  /**
   * Retrieves pool statistics for a particular asset.
   * @param asset - The asset string to query its pool stats.
   * @returns Pool statistics details.
   */
  public async getPoolStats(asset: Asset): Promise<PoolStatsDetail> {
    return this.midgardCache.midgardApi.getPoolStats(assetToString(asset))
  }

  /**
   * Retrieves MAYAName details.
   * @param mayaName - The MAYAName.
   * @returns An array of chains and their addresses associated with the given MAYAName.
   */
  public async getMAYANameDetails(mayaName: string): Promise<MAYANameDetails | undefined> {
    return this.midgardCache.midgardApi.getMayaNameDetails(mayaName)
  }

  /**
   * Performs a reverse lookup to get MAYAName(s) associated with the given address.
   * @param address - The address to check for associated MAYAName(s).
   * @returns An array of MAYAName(s) associated with the given address.
   */
  public async getMAYANameReverseLookup(address: string): Promise<ReverseMAYANames | undefined> {
    return this.midgardCache.midgardApi.getMAYANameReverseLookup(address)
  }

  /**
   * Retrieves member details.
   * @param address - The member address.
   * @returns An array of statistics for all the liquidity providers associated with a given member address.
   */
  public getMemberDetails(address: string): Promise<MemberDetails> {
    return this.midgardCache.midgardApi.getMemberDetails(address)
  }

  /**
   * Gets the network MidgardQuery is working with.
   * @returns The network.
   */
  public getNetwork(): Network {
    return this.midgardCache.midgardApi.network
  }
}
