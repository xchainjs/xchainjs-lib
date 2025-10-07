import { Network } from '@xchainjs/xchain-client'
import { MemberDetails, PoolDetail, PoolStatsDetail } from '@xchainjs/xchain-mayamidgard'
import { Asset, CachedValue, assetToString } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { ActionHistory, GetActionsParams, MAYANameDetails, ReverseMAYANames } from './types'

/**
 * Default number of decimals used for MAYAChain assets.
 */
const DEFAULT_MAYACHAIN_DECIMALS = 8

/**
 * Common asset decimals - avoids Midgard calls for well-known MAYAChain assets
 */
const COMMON_MAYACHAIN_ASSET_DECIMALS: Record<string, number> = {
  // MAYAChain ecosystem
  'MAYA.CACAO': 10,
  'MAYA.MAYA': 4,

  // Bitcoin ecosystem
  'BTC.BTC': 8,
  'DASH.DASH': 8,

  // Ethereum ecosystem
  'ETH.ETH': 18,
  'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6, // USDT on Ethereum
  'ETH.USDC-0xA0b86a33E6441d0075be7b17c8Cb89b91A6Db8Ed': 6, // USDC on Ethereum
  'ARB.ETH': 18,

  // Cosmos ecosystem
  'KUJI.KUJI': 6,

  // THORChain
  'THOR.RUNE': 8,
}

/**
 * Chain default decimals for MAYAChain supported chains
 */
const MAYACHAIN_CHAIN_DEFAULT_DECIMALS: Record<string, number> = {
  MAYA: 10,
  BTC: 8,
  DASH: 8,
  ZEC: 8,
  ETH: 18,
  ARB: 18,
  KUJI: 6,
  THOR: 8,
  XRD: 18,
}

/**
 * Aggressive cache TTL for asset decimals (24 hours) - decimals rarely change
 */
const DECIMALS_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Class for retrieving data and processing it from the Midgard API using MidgardCache to optimize the number of requests (MAYAChain L2 API).
 */
export class MidgardQuery {
  private midgardCache: MidgardCache
  readonly overrideDecimals: Record<string, number>
  private readonly decimalCache: CachedValue<Record<string, number>>

  /**
   * Constructor to create a MidgardQuery instance.
   * @param midgardCache - An instance of the MidgardCache (could be pointing to stagenet, testnet, mainnet).
   * @param overrideDecimals - Override decimals for specific assets.
   * @returns MidgardQuery
   */
  constructor(midgardCache = new MidgardCache(), overrideDecimals: Record<string, number> = {}) {
    this.midgardCache = midgardCache
    this.overrideDecimals = overrideDecimals
    // Initialize aggressive decimal cache with 24h TTL
    this.decimalCache = new CachedValue<Record<string, number>>(() => this.buildDecimalCache(), DECIMALS_CACHE_TTL)
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
      throw new Error(`Can't find pool for asset: ${assetStringify}`)
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

  /**
   * List actions along with their related transactions. An action is generated by one or more inbound transactions
   * with the intended action set in the transaction memo. The action may result in one or more outbound transactions.
   * Results are paginated by sets of 50. Filters may be applied to query actions.
   *
   * @param {GetActionsParams} params - Get actions params
   * @param {string} params.address - Comma separated list. Address of sender or recipient of any in/out transaction
   * related to the action.
   * @param {string} params.txid - ID of any in/out tx related to the action
   * @param {string} params.asset - Comma separated list. Any asset that is part of the action (CHAIN.SYMBOL) Additionally,
   * synth, nosynth, and norune filters can be used for swap, add/withdraw actions.
   * @param {ActionType} params.type - One or more comma separated unique types of action (swap, addLiquidity, withdraw,
   * donate, refund, switch)
   * @param {string} params.affiliate - Comma separated list. Affiliate address of the action (swap, refund)
   * @param {number} params.limit - Number of actions returned, default is 50
   * @param {number} params.offset - Pagination offset, default is 0
   * @param {number} params.nextPageToken - If this is given, the actions for the next page will be given
   * @param {number} params.timestamp - If this is given, the actions older than the timestamp will be given
   * @param {number} params.height - If this is given, the actions older than the height will be given
   * @param {number} params.prevPageToken - If this is given, the actions for the previous page will be given
   * @param {number} params.fromTimestamp - If this is given, the actions newer than the timestamp will be given
   * @param {number} params.fromHeight - If this is given, the actions newer than the height will be given
   *
   * @returns {ActionHistory} Array of actions for the given filters
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

  /**
   * Builds a cache of asset decimals from available pools.
   * This reduces the need to query pools repeatedly for decimal lookups.
   *
   * @returns {Record<string, number>} - Map of asset strings to decimal counts
   */
  private async buildDecimalCache(): Promise<Record<string, number>> {
    const decimalsMap: Record<string, number> = {}

    try {
      const pools = await this.midgardCache.getPools()

      // Cache decimals for all pool assets
      for (const pool of pools) {
        if (pool.asset && pool.nativeDecimal) {
          decimalsMap[pool.asset] = Number(pool.nativeDecimal)
        }
      }

      // Add known MAYAChain asset decimals
      decimalsMap['MAYA.CACAO'] = DEFAULT_MAYACHAIN_DECIMALS
    } catch (error) {
      console.warn('Failed to build decimal cache, using defaults:', error)
    }

    return decimalsMap
  }

  /**
   * Batch lookup for multiple asset decimals - more efficient than individual calls.
   *
   * @param {Asset[]} assets - Array of assets to get decimals for
   * @returns {Promise<Record<string, number>>} - Map of asset strings to decimal counts
   */
  public async getDecimalsForAssets(assets: Asset[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {}

    for (const asset of assets) {
      const assetString = assetToString(asset)
      
      // Check override decimals first
      if (this.overrideDecimals[assetString] !== undefined) {
        result[assetString] = this.overrideDecimals[assetString]
        continue
      }

      // Second try: static decimals for well-known assets
      if (COMMON_MAYACHAIN_ASSET_DECIMALS[assetString]) {
        result[assetString] = COMMON_MAYACHAIN_ASSET_DECIMALS[assetString]
        continue
      }

      // Third try: cached decimals
      try {
        const cachedDecimals = await this.decimalCache.getValue()
        if (cachedDecimals[assetString] !== undefined) {
          result[assetString] = cachedDecimals[assetString]
          continue
        }
      } catch (error) {
        console.warn(`Failed to get cached decimals for ${assetString}:`, error)
      }

      // Fourth try: chain-based defaults
      const chainDefault = MAYACHAIN_CHAIN_DEFAULT_DECIMALS[asset.chain]
      if (chainDefault !== undefined) {
        result[assetString] = chainDefault
        continue
      }

      // Final fallback: MAYAChain standard
      result[assetString] = DEFAULT_MAYACHAIN_DECIMALS
      console.warn(`Using MAYAChain default decimals for ${assetString}`)
    }

    return result
  }

  /**
   * Get decimal count for a specific asset with robust fallback layers.
   *
   * @param {Asset} asset - The asset to get decimals for
   * @returns {Promise<number>} - Number of decimals for the asset
   */
  public async getAssetDecimals(asset: Asset): Promise<number> {
    const assetString = assetToString(asset)
    
    // Check override decimals first
    if (this.overrideDecimals[assetString] !== undefined) {
      return this.overrideDecimals[assetString]
    }

    // Second try: static decimals for well-known assets
    if (COMMON_MAYACHAIN_ASSET_DECIMALS[assetString]) {
      return COMMON_MAYACHAIN_ASSET_DECIMALS[assetString]
    }

    // Third try: cached decimals
    try {
      const cachedDecimals = await this.decimalCache.getValue()
      if (cachedDecimals[assetString] !== undefined) {
        return cachedDecimals[assetString]
      }
    } catch (error) {
      console.warn(`Failed to get cached decimals for ${assetString}:`, error)
    }

    // Fourth try: chain-based defaults
    const chainDefault = MAYACHAIN_CHAIN_DEFAULT_DECIMALS[asset.chain]
    if (chainDefault !== undefined) {
      return chainDefault
    }

    // Final fallback: MAYAChain standard
    console.warn(`Using MAYAChain default decimals for ${assetString}`)
    return DEFAULT_MAYACHAIN_DECIMALS
  }
}
