import { Network } from '@xchainjs/xchain-client'
import { MemberDetails, PoolDetail, PoolStatsDetail } from '@xchainjs/xchain-mayamidgard'
import { Asset, assetToString } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { MAYANameDetails, ReverseMAYANames } from './types'

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

  /**
   * Function to return pool statistics for a particular asset
   * @param asset - asset string to query its pool stats
   * @returns - type object poolStatsDetail
   */
  public async getPoolStats(asset: Asset): Promise<PoolStatsDetail> {
    return this.midgardCache.midgardApi.getPoolStats(assetToString(asset))
  }

  /**
   * Get MAYAName details
   * @param {string} mayaName MayaName
   * @returns an array of chains and their addresses associated with the given THORName
   */
  public async getMAYANameDetails(mayaName: string): Promise<MAYANameDetails | undefined> {
    return this.midgardCache.midgardApi.getMayaNameDetails(mayaName)
  }

  /**
   * Gives a list of MayaNames by reverse lookup
   * @param {string} address to know if it has a MayaName associated with
   * @returns an array of THORNames associated with the given address
   */
  public async getMAYANameReverseLookup(address: string): Promise<ReverseMAYANames | undefined> {
    return this.midgardCache.midgardApi.getMAYANameReverseLookup(address)
  }

  /**
   * Return member details
   * @param {string} address
   * @returns an array of statistics for all the liquidity providers associated with a given member address
   */
  public getMemberDetails(address: string): Promise<MemberDetails> {
    return this.midgardCache.midgardApi.getMemberDetails(address)
  }

  /**
   * Get the network midgard query is working with
   * @returns
   */
  public getNetwork(): Network {
    return this.midgardCache.midgardApi.network
  }
}
