import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { Pool } from '@xchainjs/xchain-mayanode'
import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'
import { CachedValue } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { InboundDetail } from './types'
import { MayaChain, Mayanode } from './utils'

export type MayachainCacheConf = {
  expirationTimeInboundAddress: number // Expiration time for the inbound address cache in milliseconds
  expirationTimePools: number // Expiration time for the pools cache in milliseconds
  expirationTimeAssetDecimals: number // Expiration time for the asset decimals cache in milliseconds
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
    // Initialize instances and configuration with optimized TTLs based on data volatility
    this.midgardQuery = midgardQuery
    this.mayanode = mayanode
    this.conf = {
      expirationTimeInboundAddress: 5 * 60 * 1000, // 5 minutes - inbound addresses change less frequently
      expirationTimePools: 30 * 1000, // 30 seconds - pool data changes frequently due to swaps
      expirationTimeAssetDecimals: 24 * 60 * 60 * 1000, // 24 hours - decimals rarely change
      ...configuration,
    }

    // Initialize cached values
    this.inboundDetailCache = new CachedValue<Record<string, InboundDetail>>(
      () => this.refreshInboundDetailCache(),
      this.conf.expirationTimeInboundAddress,
    )
    this.assetDecimalsCache = new CachedValue<Record<string, number>>(
      () => this.refreshAssetDecimalsCache(),
      this.conf.expirationTimeAssetDecimals,
    )
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
    return await this.assetDecimalsCache.getValue()
  }

  public async getPools(): Promise<PoolDetail[]> {
    if (!this.poolsCache) throw Error(`Could not refresh pools cache`)
    return await this.poolsCache.getValue()
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
    // Primary: Extract decimals directly from Mayanode pools - this is the real source of truth!
    try {
      const mayanodePools = await this.mayanode.getPools()
      const decimalsMap: Record<string, number> = {
        // Always include MAYAChain native assets
        'MAYA.CACAO': 10,
        'MAYA.MAYA': 4,
      }

      // Extract decimals from actual Mayanode pool data
      for (const pool of mayanodePools) {
        if (pool.asset && pool.decimals !== undefined) {
          decimalsMap[pool.asset] = pool.decimals
        }
      }

      return decimalsMap
    } catch (error) {
      console.warn('Failed to get decimals from Mayanode, using hardcoded fallbacks:', error)
      // Fallback: Use hardcoded values if Mayanode is unavailable
      return {
        // MAYAChain ecosystem
        'MAYA.CACAO': 10,
        'MAYA.MAYA': 4,

        // Bitcoin ecosystem
        'BTC.BTC': 8,
        'DASH.DASH': 8,

        // Ethereum ecosystem and tokens
        'ETH.ETH': 18,
        'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
        'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,
        'ETH.USDC-0xA0b86a33E6441d0075be7b17c8Cb89b91A6Db8Ed': 6, // Alternative USDC contract
        'ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0': 18,
        'ARB.ETH': 18,

        // Cosmos ecosystem
        'KUJI.KUJI': 6,
        'KUJI.USK': 6,

        // THORChain
        'THOR.RUNE': 8,
      }
    }
  }

  /**
   * Converts a Mayanode Pool to a PoolDetail for compatibility
   * @param pool Pool from Mayanode API
   * @returns PoolDetail compatible with existing code
   */
  private convertPoolToDetail(pool: Pool): PoolDetail {
    return {
      asset: pool.asset,
      status: pool.status,
      assetDepth: pool.balance_asset || '0',
      runeDepth: pool.balance_cacao || '0',
      // Set required fields with sensible defaults - most are not used for core functionality
      annualPercentageRate: '0',
      assetPrice: '0',
      assetPriceUSD: '0',
      liquidityUnits: pool.LP_units || '0',
      nativeDecimal: pool.decimals?.toString() || '8', // Use decimals from Mayanode!
      poolAPY: '0',
      poolUnits: pool.pool_units || '0',
      saversAPR: '0',
      saversDepth: '0',
      saversUnits: '0',
      synthSupply: pool.synth_supply || '0',
      synthUnits: pool.synth_units || '0',
      totalCollateral: '0',
      totalDebtTor: '0',
      units: pool.pool_units || '0',
      volume24h: '0',
    } as PoolDetail
  }

  /**
   * Refreshes the Pools cache using Mayanode directly (primary source)
   * Falls back to Midgard if Mayanode is unavailable
   * @returns {PoolDetail[]} the list of pools
   */
  private async refreshPoolsCache(): Promise<PoolDetail[]> {
    try {
      // Primary: Use Mayanode directly for real-time pool data
      const mayanodePools = await this.mayanode.getPools()
      return mayanodePools.map((pool) => this.convertPoolToDetail(pool))
    } catch (error) {
      console.warn('Failed to fetch pools from Mayanode, falling back to Midgard:', error)
      // Fallback: Use Midgard if Mayanode fails - let error propagate if this also fails
      return this.midgardQuery.getPools()
    }
  }
}
