import { MidgardQuery } from '@xchainjs/xchain-midgard-query'
import {
  Address,
  Asset,
  CachedValue,
  Chain,
  CryptoAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  assetToString,
  baseAmount,
  eqAsset,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { LiquidityPool } from './liquidity-pool'
import { InboundDetail } from './types'
import { THORChain, isAssetRuneNative } from './utils'
import { Thornode } from './utils/thornode'
const SAME_ASSET_EXCHANGE_RATE = new BigNumber(1)
const TEN_MINUTES = 10 * 60 * 1000
const defaultThornode = new Thornode()
const defaultMidgardQuery = new MidgardQuery()

export class ThorchainCache {
  readonly thornode: Thornode
  readonly midgardQuery: MidgardQuery
  private readonly poolCache: CachedValue<Record<string, LiquidityPool> | undefined>
  private readonly inboundDetailCache: CachedValue<Record<string, InboundDetail>>
  private readonly networkValuesCache: CachedValue<Record<string, number>>

  constructor(
    thornode = defaultThornode,
    midgardQuery = defaultMidgardQuery,
    expirePoolCacheMillis = 6000,
    expireInboundDetailsCacheMillis = 6000,
    expireNetworkValuesCacheMillis = TEN_MINUTES,
  ) {
    this.thornode = thornode
    this.midgardQuery = midgardQuery
    this.poolCache = new CachedValue<Record<string, LiquidityPool> | undefined>(
      () => this.refreshPoolCache(),
      expirePoolCacheMillis,
    )
    this.inboundDetailCache = new CachedValue<Record<string, InboundDetail>>(
      () => this.refreshInboundDetailCache(),
      expireInboundDetailsCacheMillis,
    )
    this.networkValuesCache = new CachedValue<Record<string, number>>(
      () => thornode.getNetworkValues(),
      expireNetworkValuesCacheMillis,
    )
  }

  async getExchangeRate(
    from: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset,
    to: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset,
  ): Promise<BigNumber> {
    let exchangeRate: BigNumber
    if (eqAsset(from, to)) {
      exchangeRate = SAME_ASSET_EXCHANGE_RATE
    } else if (isAssetRuneNative(from)) {
      //  Runes per Asset
      const poolToAsset =
        isSynthAsset(to) || isTradeAsset(to) || isSecuredAsset(to) ? await this.getAnalogAsset(to) : to
      const lpTo = await this.getPoolForAsset(poolToAsset)
      exchangeRate = lpTo.assetToRuneRatio
    } else if (isAssetRuneNative(to)) {
      //  Asset per rune
      const poolFromAsset =
        isSynthAsset(from) || isTradeAsset(from) || isSecuredAsset(from) ? await this.getAnalogAsset(from) : from
      const lpFrom = await this.getPoolForAsset(poolFromAsset)
      exchangeRate = lpFrom.runeToAssetRatio
    } else {
      //  AssetA per AssetB
      const poolFromAsset =
        isSynthAsset(from) || isTradeAsset(from) || isSecuredAsset(from) ? await this.getAnalogAsset(from) : from
      const poolToAsset =
        isSynthAsset(to) || isTradeAsset(to) || isSecuredAsset(to) ? await this.getAnalogAsset(to) : to
      const lpFrom = await this.getPoolForAsset(poolFromAsset)
      const lpTo = await this.getPoolForAsset(poolToAsset)
      // from/R * R/to = from/to
      exchangeRate = lpFrom.runeToAssetRatio.times(lpTo.assetToRuneRatio)
    }
    // console.log(` 1 ${assetToString(from)} = ${exchangeRate} ${assetToString(to)}`)
    return exchangeRate
  }

  async getPoolForAsset(asset: Asset | TokenAsset): Promise<LiquidityPool> {
    if (isAssetRuneNative(asset)) throw Error(`AssetRuneNative doesn't have a pool`)
    const pools = await this.getPools()
    // chain.ticker, not the full asset string, so assets and synths share a pool; ticker alone collides across chains
    const pool = pools[`${asset.chain}.${asset.ticker}`]
    if (pool) {
      return pool
    }
    throw Error(`Pool for ${assetToString(asset)} not found`)
  }

  async getPools(): Promise<Record<string, LiquidityPool>> {
    const pools = await this.poolCache.getValue()
    if (pools) {
      return pools
    } else {
      throw Error('Could not refresh pools')
    }
  }
  private async refreshPoolCache(): Promise<Record<string, LiquidityPool> | undefined> {
    try {
      const thornodePools = await this.thornode.getPools()
      const poolMap: Record<string, LiquidityPool> = {}

      if (thornodePools) {
        for (const pool of thornodePools) {
          try {
            const thornodePool = thornodePools.find((p) => p.asset === pool.asset)
            if (!thornodePool) throw Error(`Could not find thornode pool ${pool.asset}`)
            const lp = new LiquidityPool(thornodePool)
            poolMap[`${lp.asset.chain}.${lp.asset.ticker}`] = lp
          } catch (error) {
            console.log(error)
          }
        }

        return poolMap
      }
    } catch (error) {
      console.error('Error refreshing pool cache:', error)
    }
    return undefined
  }

  private async refreshInboundDetailCache(): Promise<Record<string, InboundDetail>> {
    const [mimirDetails, allInboundAddresses] = await Promise.all([
      this.thornode.getMimir(),
      this.thornode.getInboundAddresses(),
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
        !inbound.outbound_fee
      )
        throw new Error(`Missing required inbound info`)
      const details: InboundDetail = {
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
        dustThreshold: inbound.dust_threshold ? new BigNumber(inbound.dust_threshold) : undefined,
      }
      inboundDetails[chain] = details
    }
    // add mock THORCHAIN inbound details
    const details: InboundDetail = {
      chain: THORChain,
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
    inboundDetails[THORChain] = details

    return inboundDetails
  }

  async convert<T extends Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>(
    input: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>,
    outAsset: T,
  ): Promise<CryptoAmount<T>> {
    const exchangeRate = await this.getExchangeRate(input.asset, outAsset)
    const outDecimals = await this.midgardQuery.getDecimalForAsset(outAsset)
    const inDecimals = input.baseAmount.decimal

    let baseAmountOut = input.baseAmount.times(exchangeRate).amount()
    const adjustDecimals = outDecimals - inDecimals

    baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
    const amt = baseAmount(baseAmountOut, outDecimals)
    const result = new CryptoAmount<T>(amt, outAsset)

    return result
  }
  async getRouterAddressForChain(chain: Chain): Promise<Address> {
    const inboundAsgard = (await this.getInboundDetails())[chain]

    if (!inboundAsgard?.router) {
      throw new Error('router address is not defined')
    }
    return inboundAsgard?.router
  }

  async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    if (this.inboundDetailCache) {
      return await this.inboundDetailCache.getValue()
    } else {
      throw Error(`Could not refresh inbound details `)
    }
  }
  async getNetworkValues(): Promise<Record<string, number>> {
    if (this.networkValuesCache) {
      return await this.networkValuesCache.getValue()
    } else {
      throw Error(`Could not refresh network values `)
    }
  }

  private async getAnalogAsset(asset: SynthAsset | TradeAsset | SecuredAsset): Promise<Asset | TokenAsset> {
    const pools = await this.getPools()
    const analogAssetPool = Object.values(pools).find((pool) => {
      return (
        pool.asset.chain === asset.chain && pool.asset.ticker === asset.ticker && pool.asset.symbol === asset.symbol
      )
    })

    if (!analogAssetPool) throw Error(`Can not find analog asset pool for ${assetToString(asset)}`)
    return analogAssetPool.asset
  }
}
