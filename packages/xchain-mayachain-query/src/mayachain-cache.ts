import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { Pool } from '@xchainjs/xchain-mayanode'
import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'
import { CachedValue } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { InboundDetail } from './types'
import { MayaChain, Mayanode } from './utils'

export type MayachainCacheConf = {
  expirationTimeInboundAddress: number // Expiration time for the inbound address cache in milliseconds
  expirationTimePools: number // Expiration time for the inbound address cache in milliseconds
}

/**
 * This class manages retrieving information from up-to-date Mayachain.
 */
export class MayachainCache {
  readonly midgardQuery: MidgardQuery // Instance of the Maya MidgardQuery API
  readonly mayanode: Mayanode // Instance of the Maya Mayanode API
  private conf: MayachainCacheConf // Configuration for the cache
  private readonly inboundDetailCache: CachedValue<Record<string, InboundDetail>> // Cached value for inbound details
  private readonly assetDecimalsCache: CachedValue<Record<string, number>> // Cached value for asset decimals
  private readonly poolsCache: CachedValue<PoolDetail[]> // Cached value pools

  /**
   * Constructor to create a MayachainCache.
   *
   * @param midgardQuery - An instance of the Maya MidgardQuery API.
   * @param mayanode - An instance of the Maya Mayanode API.
   * @param configuration - Optional configuration for the cache.
   * @returns MayachainCache.
   */
  constructor(
    midgardQuery = new MidgardQuery(),
    mayanode = new Mayanode(),
    configuration?: Partial<MayachainCacheConf>,
  ) {
    // Initialize instances and configuration
    this.midgardQuery = midgardQuery
    this.mayanode = mayanode
    this.conf = { expirationTimeInboundAddress: 60000, expirationTimePools: 60000, ...configuration }

    // Initialize cached values
    this.inboundDetailCache = new CachedValue<Record<string, InboundDetail>>(
      () => this.refreshInboundDetailCache(),
      this.conf.expirationTimeInboundAddress,
    )
    this.assetDecimalsCache = new CachedValue<Record<string, number>>(() => this.refreshAssetDecimalsCache())
    this.poolsCache = new CachedValue<PoolDetail[]>(() => this.refreshPoolsCache(), this.conf.expirationTimePools)
  }

  /**
   * Get inbound addresses details.
   *
   * @returns Inbound details.
   */
  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    if (!this.inboundDetailCache) throw Error(`Could not refresh inbound details`)
    return await this.inboundDetailCache.getValue()
  }

  /**
   * Get the number of decimals of the supported Mayachain tokens.
   *
   * @returns {Record<string, number>} A record with the string asset notation as key and the number of decimals as value.
   */
  public async getAssetDecimals(): Promise<Record<string, number>> {
    if (!this.assetDecimalsCache) throw Error(`Could not refresh assets decimals`)
    try {
      return await this.assetDecimalsCache.getValue()
    } catch (error) {
      // Fallback: if cache refresh fails (e.g., Mayamidgard is down), use static fallback
      console.warn('Maya asset decimals cache refresh failed, using static fallback:', error)
      return this.getFallbackAssetDecimals()
    }
  }

  public async getPools(): Promise<PoolDetail[]> {
    if (!this.poolsCache) throw Error(`Could not refresh pools cache`)
    try {
      return await this.poolsCache.getValue()
    } catch (error) {
      // If pools cache fails to refresh (e.g., Mayamidgard is down), throw the error
      // The calling code should handle this gracefully with optimistic fallbacks
      console.warn('Maya pools cache refresh failed:', error)
      throw error
    }
  }

  /**
   * Refreshes the InboundDetailCache cache.
   */
  private async refreshInboundDetailCache(): Promise<Record<string, InboundDetail>> {
    // Implementation details for refreshing the inbound detail cache
    const [mimirDetails, allInboundAddresses] = await Promise.all([
      this.mayanode.getMimir(),
      this.mayanode.getInboundAddresses(),
    ])
    const inboundDetails: Record<string, InboundDetail> = {}
    for (const inbound of allInboundAddresses) {
      const chain = inbound.chain
      if (
        !chain ||
        !inbound.gas_rate ||
        !inbound.address ||
        !inbound.gas_rate_units ||
        !inbound.outbound_tx_size ||
        !inbound.outbound_fee ||
        !inbound.gas_rate_units
      )
        throw new Error(`Missing required inbound info`)

      inboundDetails[chain] = {
        chain: chain,
        address: inbound.address,
        router: inbound.router,
        gasRate: new BigNumber(inbound.gas_rate),
        gasRateUnits: inbound.gas_rate_units,
        outboundTxSize: new BigNumber(inbound.outbound_tx_size),
        outboundFee: new BigNumber(inbound.outbound_fee),
        haltedChain: inbound?.halted || !!mimirDetails[`HALT${chain}CHAIN`] || !!mimirDetails['HALTCHAINGLOBAL'],
        haltedTrading: !!mimirDetails['HALTTRADING'] || !!mimirDetails[`HALT${chain}TRADING`],
        haltedLP: !!mimirDetails['PAUSELP'] || !!mimirDetails[`PAUSELP${chain}`],
      }
    }
    // add mock MAYAChain inbound details
    inboundDetails[MayaChain] = {
      chain: MayaChain,
      address: '',
      router: '',
      gasRate: new BigNumber(0),
      gasRateUnits: '',
      outboundTxSize: new BigNumber(0),
      outboundFee: new BigNumber(0),
      haltedChain: false,
      haltedTrading: !!mimirDetails['HALTTRADING'],
      haltedLP: false, //
    }

    return inboundDetails
  }

  /**
   * Refreshes the number of decimals of the supported Mayachain tokens.
   */
  private async refreshAssetDecimalsCache(): Promise<Record<string, number>> {
    try {
      // Try to get pool data and extract decimals if available
      const pools = await this.midgardQuery.getPools()
      const decimals: Record<string, number> = {}

      for (const pool of pools) {
        if (pool.nativeDecimal) {
          decimals[pool.asset] = Number(pool.nativeDecimal)
        }
      }

      // Merge with fallback data for assets that don't have native decimals specified
      return { ...this.getFallbackAssetDecimals(), ...decimals }
    } catch (error) {
      console.warn('Failed to refresh Maya asset decimals from pools, using fallback:', error)
      return this.getFallbackAssetDecimals()
    }
  }

  /**
   * Provides fallback decimal values for Maya assets when Mayamidgard is unavailable.
   * Data sourced from https://mayanode.mayachain.info/mayachain/pools
   * Updated with live pool data as of latest fetch
   */
  private getFallbackAssetDecimals(): Record<string, number> {
    return {
      // Current Maya pools with verified decimals from Mayanode
      'BTC.BTC': 8,
      'ARB.USDC-0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 6,
      'ARB.USDT-0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 6,
      'ARB.LEO-0x5985D2Dc68E67aeE82F4e30e8e74F1ea8e532a3c': 3,
      'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
      'KUJI.KUJI': 6,
      'KUJI.USK': 6,
      'THOR.RUNE': 8,

      // Chain defaults for native assets
      'ETH.ETH': 18,
      'ARB.ETH': 18,
      'MAYA.CACAO': 10,

      // Additional pool assets (using chain defaults where decimals not specified)
      'DASH.DASH': 8,
      'XDR.XDR': 18,
      'ZEC.ZEC': 8,

      // Legacy mappings for backward compatibility
      'ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0': 18,
    }
  }

  /**
   * Refreshes the Pools cache
   * @returns {PoolDetail[]} the list of pools
   */
  private async refreshPoolsCache(): Promise<PoolDetail[]> {
    try {
      // Try Mayanode first (like THORChain uses Thornode first)
      const mayanodePools = await this.mayanode.getPools()
      return this.convertMayanodePoolsToMidgardFormat(mayanodePools)
    } catch (error) {
      console.warn('Mayanode pools unavailable, falling back to Mayamidgard:', error)
      // Fallback to Midgard like before
      return this.midgardQuery.getPools()
    }
  }

  /**
   * Convert Mayanode pool format to Midgard PoolDetail format
   * @param pools - Pools from Mayanode API
   * @returns PoolDetail array compatible with Midgard format
   */
  private convertMayanodePoolsToMidgardFormat(pools: Pool[]): PoolDetail[] {
    return pools.map((pool): PoolDetail => {
      // Get the fallback decimal for this asset if available
      const fallbackDecimals = this.getFallbackAssetDecimals()
      const nativeDecimal = fallbackDecimals[pool.asset]?.toString() || '8'

      return {
        // Core pool data from Mayanode
        asset: pool.asset,
        assetDepth: pool.balance_asset,
        runeDepth: pool.balance_cacao,
        liquidityUnits: pool.LP_units,
        status: 'available', // Assume available if returned by Mayanode

        // Calculated fields
        assetPrice:
          pool.balance_cacao && pool.balance_asset
            ? (parseFloat(pool.balance_cacao) / parseFloat(pool.balance_asset)).toString()
            : '0',

        // Required fields with appropriate defaults
        annualPercentageRate: '0',
        assetPriceUSD: '0',
        nativeDecimal,
        poolAPY: '0',
        saversAPR: '0',
        saversDepth: '0',
        saversUnits: '0',
        synthSupply: '0',
        synthUnits: '0',
        totalCollateral: '0',
      } as PoolDetail
    })
  }
}
