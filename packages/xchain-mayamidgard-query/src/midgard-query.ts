import { Network } from '@xchainjs/xchain-client'
import { MemberDetails, PoolDetail, PoolStatsDetail } from '@xchainjs/xchain-mayamidgard'
import { Asset, assetToString } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { ActionHistory, GetActionsParams, MAYANameDetails, ReverseMAYANames } from './types'

export class MidgardQuery {
  private midgardCache: MidgardCache

  constructor(midgardCache = new MidgardCache()) {
    this.midgardCache = midgardCache
  }

  public async getLatestBlockHeight(): Promise<number> {
    const health = await this.midgardCache.midgardApi.getHealth()
    return +health.scannerHeight
  }

  public async getPools(): Promise<PoolDetail[]> {
    return this.midgardCache.getPools()
  }

  public async getPool(asset: Asset): Promise<PoolDetail> {
    const pools = await this.midgardCache.getPools()
    const assetStringify = assetToString(asset)
    const pool = pools.find((pool) => pool.asset === assetStringify)
    if (!pool) {
      throw new Error(`Can't find pool for asset: ${assetStringify}`)
    }
    return pool
  }

  public async getPoolStats(asset: Asset): Promise<PoolStatsDetail> {
    return this.midgardCache.midgardApi.getPoolStats(assetToString(asset))
  }

  public async getMAYANameDetails(mayaName: string): Promise<MAYANameDetails | undefined> {
    return this.midgardCache.midgardApi.getMayaNameDetails(mayaName)
  }

  public async getMAYANameReverseLookup(address: string): Promise<ReverseMAYANames | undefined> {
    return this.midgardCache.midgardApi.getMAYANameReverseLookup(address)
  }

  public getMemberDetails(address: string): Promise<MemberDetails> {
    return this.midgardCache.midgardApi.getMemberDetails(address)
  }

  public getNetwork(): Network {
    return this.midgardCache.midgardApi.network
  }

  /**
   * Paginated by 50. address, asset, type, and affiliate are comma-separated; asset also accepts synth, nosynth, norune.
   * timestamp/height are older-than; fromTimestamp/fromHeight are newer-than. limit defaults to 50, offset to 0.
   */
  public async getActions({
    address,
    txid,
    asset,
    type,
    affiliate,
    limit,
    offset,
    nextPageToken,
    timestamp,
    height,
    prevPageToken,
    fromTimestamp,
    fromHeight,
  }: GetActionsParams): Promise<ActionHistory> {
    return this.midgardCache.midgardApi.getActions({
      address,
      txid,
      asset,
      type,
      affiliate,
      limit,
      offset,
      nextPageToken,
      timestamp,
      height,
      prevPageToken,
      fromTimestamp,
      fromHeight,
    })
  }
}
