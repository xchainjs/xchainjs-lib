import { PoolDetail } from '@xchainjs/xchain-mayamidgard'
import { Pool } from '@xchainjs/xchain-mayanode'
import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'
import { CachedValue } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { InboundDetail } from './types'
import { CACAO_DECIMAL, MayaChain, Mayanode } from './utils'

export type MayachainCacheConf = {
  expirationTimeInboundAddress: number
  expirationTimePools: number
}

export class MayachainCache {
  readonly midgardQuery: MidgardQuery
  readonly mayanode: Mayanode
  private conf: MayachainCacheConf
  private readonly inboundDetailCache: CachedValue<Record<string, InboundDetail>>
  private readonly assetDecimalsCache: CachedValue<Record<string, number>>
  private readonly poolsCache: CachedValue<PoolDetail[]>

  constructor(
    midgardQuery = new MidgardQuery(),
    mayanode = new Mayanode(),
    configuration?: Partial<MayachainCacheConf>,
  ) {
    this.midgardQuery = midgardQuery
    this.mayanode = mayanode
    this.conf = { expirationTimeInboundAddress: 60000, expirationTimePools: 60000, ...configuration }

    this.inboundDetailCache = new CachedValue<Record<string, InboundDetail>>(
      () => this.refreshInboundDetailCache(),
      this.conf.expirationTimeInboundAddress,
    )
    this.assetDecimalsCache = new CachedValue<Record<string, number>>(() => this.refreshAssetDecimalsCache())
    this.poolsCache = new CachedValue<PoolDetail[]>(() => this.refreshPoolsCache(), this.conf.expirationTimePools)
  }

  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    if (!this.inboundDetailCache) throw Error(`Could not refresh inbound details`)
    return await this.inboundDetailCache.getValue()
  }

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
      // if Mayamidgard is down, rethrow; callers use optimistic fallbacks
      console.warn('Maya pools cache refresh failed:', error)
      throw error
    }
  }

  private async refreshInboundDetailCache(): Promise<Record<string, InboundDetail>> {
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
      haltedLP: false,
    }

    return inboundDetails
  }

  private async refreshAssetDecimalsCache(): Promise<Record<string, number>> {
    try {
      const pools = await this.midgardQuery.getPools()
      const decimals: Record<string, number> = {}

      for (const pool of pools) {
        if (pool.nativeDecimal) {
          const decimal = Number(pool.nativeDecimal)
          if (decimal >= 0) {
            decimals[pool.asset] = decimal
          }
        }
      }

      // Merge with fallback data for assets that don't have native decimals specified
      return { ...this.getFallbackAssetDecimals(), ...decimals }
    } catch (error) {
      console.warn('Failed to refresh Maya asset decimals from pools, using fallback:', error)
      return this.getFallbackAssetDecimals()
    }
  }

  // static decimals when Mayamidgard is down; https://mayanode.mayachain.info/mayachain/pools
  // Keys are matched case-insensitively. Live asset strings uppercase the contract.
  private getFallbackAssetDecimals(): Record<string, number> {
    return {
      'BTC.BTC': 8,
      'ADA.ADA': 6,
      'ARB.USDC-0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 6,
      'ARB.USDT-0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 6,
      'ARB.LEO-0X93864D81175095DD93360FFA2A529B8642F76A6E': 3,
      'ARB.TGT-0x429FED88F10285E61B12BDF00848315FBDFCC341': 18,
      'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
      'THOR.RUNE': 8,
      'ETH.ETH': 18,
      'ARB.ETH': 18,
      'MAYA.CACAO': 10,
      'DASH.DASH': 8,
      'ZEC.ZEC': 8,
      'ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0': 18,
    }
  }

  private fallbackDecimal(asset: string): number {
    const table = this.getFallbackAssetDecimals()
    if (table[asset] !== undefined) return table[asset]
    const upper = asset.toUpperCase()
    const key = Object.keys(table).find((candidate) => candidate.toUpperCase() === upper)
    return key !== undefined ? table[key] : 8
  }

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

  private convertMayanodePoolsToMidgardFormat(pools: Pool[]): PoolDetail[] {
    return pools.map((pool): PoolDetail => {
      const assetDecimals =
        pool.decimals !== undefined && pool.decimals >= 0 ? pool.decimals : this.fallbackDecimal(pool.asset)
      const liquidityUnits = pool.LP_units || '0'
      const synthUnits = pool.synth_units || '0'
      const cacao = new BigNumber(pool.balance_cacao || 0)
      const assetBalance = new BigNumber(pool.balance_asset || 0)
      const assetPrice =
        cacao.isZero() || assetBalance.isZero()
          ? '0'
          : cacao
              .div(new BigNumber(10).pow(CACAO_DECIMAL))
              .div(assetBalance.div(new BigNumber(10).pow(assetDecimals)))
              .toString()

      return {
        asset: pool.asset,
        assetDepth: pool.balance_asset,
        runeDepth: pool.balance_cacao,
        liquidityUnits,
        status: (pool.status || 'available').toLowerCase(),
        assetPrice,
        annualPercentageRate: '0',
        assetPriceUSD: '0',
        nativeDecimal: String(assetDecimals),
        poolAPY: '0',
        saversAPR: '0',
        saversDepth: '0',
        saversUnits: '0',
        synthSupply: pool.synth_supply || '0',
        synthUnits,
        totalCollateral: '0',
        totalDebtTor: '0',
        units: pool.pool_units || new BigNumber(liquidityUnits).plus(synthUnits).toString(),
        volume24h: '0',
      } as PoolDetail
    })
  }
}
