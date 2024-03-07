import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'
import { CachedValue } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

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
    this.poolsCache = new CachedValue<PoolDetail[]>(this.refreshPoolsCache, this.conf.expirationTimePools)
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
    // Implementation details for refreshing the asset decimals cache
    // TODO: As soon as Mayachain returns native decimals from any endpoint of its API, refactor the function
    return {
      'BTC.BTC': 8,
      'ETH.ETH': 18,
      'DASH.DASH': 8,
      'KUJI.KUJI': 6,
      'THOR.RUNE': 8,
      'MAYA.CACAO': 8,
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
      'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,
      'ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0': 18,
      'KUJI.USK': 6,
    }
  }

  /**
   * Refreshes the Pools cache
   * @returns {PoolDetail[]} the list of pools
   */
  private async refreshPoolsCache(): Promise<PoolDetail[]> {
    return this.midgardQuery.getPools()
  }
}
