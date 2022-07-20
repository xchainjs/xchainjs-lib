import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import {
  Asset,
  assetToBase,
  // assetAmount,
  // assetToBase,
  assetToString,
  // baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'
import { LiquidityPool } from './liquidityPool'
import { PoolCache, SwapOutput } from './types'
import { Midgard } from './utils/midgard'
import { getDoubleSwap, getSingleSwap } from './utils/swap'

const SAME_ASSET_EXCHANGE_RATE = new BigNumber(1)

export class AllPools {
  private midgard: Midgard
  private poolCache: PoolCache | undefined
  private expirePoolCacheMillis

  constructor(midgard: Midgard, expirePoolCacheMillis = 6000) {
    this.midgard = midgard
    this.expirePoolCacheMillis = expirePoolCacheMillis

    //initialize the cache
    this.refereshPoolCache()
  }
  async getExchangeRate(from: Asset, to: Asset): Promise<BigNumber> {
    let exchangeRate: BigNumber
    if (eqAsset(from, to)) {
      exchangeRate = SAME_ASSET_EXCHANGE_RATE
    } else if (isAssetRuneNative(from)) {
      //  Runes per Asset
      const lpTo = await this.getPoolForAsset(to)
      exchangeRate = lpTo.assetToRuneRatio
    } else if (isAssetRuneNative(to)) {
      //  Asset per rune
      const lpFrom = await this.getPoolForAsset(from)
      exchangeRate = lpFrom.runeToAssetRatio
    } else {
      //  AssetA per AssetB
      const lpFrom = await this.getPoolForAsset(from)
      const lpTo = await this.getPoolForAsset(to)
      // from/R * R/to = from/to
      exchangeRate = lpFrom.runeToAssetRatio.times(lpTo.assetToRuneRatio)
    }
    console.log(`1 ${from.ticker} = ${exchangeRate.toFixed()} ${to.ticker} `)
    return exchangeRate
  }
  /**
   * Gets the Liquidity Pool for a given Asset
   * @param asset - cannot be RUNE.
   * @returns
   */
  async getPoolForAsset(asset: Asset): Promise<LiquidityPool> {
    if (isAssetRuneNative(asset)) throw Error(`AssetRuneNative doesn't have a pool`)
    const pools = await this.getPools()
    // Not: we use ticker, not asset string to get the same pool for both assets and synths
    const pool = pools[asset.ticker]
    if (pool) {
      return pool
    }
    throw Error(`Pool for ${assetToString(asset)} not found`)
  }
  /**
   * Refereshs the pool values
   * @returns
   */
  async getPools(): Promise<Record<string, LiquidityPool>> {
    const millisSinceLastRefeshed = Date.now() - (this.poolCache?.lastRefreshed || 0)
    if (millisSinceLastRefeshed > this.expirePoolCacheMillis) {
      try {
        await this.refereshPoolCache()
        console.log('updated pool cache')
      } catch (e) {
        console.error(e)
      }
    }
    if (this.poolCache) {
      return this.poolCache?.pools
    } else {
      throw Error(`Could not refresh Pools `)
    }
  }
  /**
   * NOTE: do not call refereshPoolCache() directly, call getPools() instead
   * which will refresh the cache if it's expired
   */
  async refereshPoolCache(): Promise<void> {
    const pools = await this.midgard.getPools()
    const poolMap: Record<string, LiquidityPool> = {}
    if (pools) {
      for (const pool of pools) {
        const lp = new LiquidityPool(pool)
        poolMap[lp.asset.ticker] = lp
      }
      this.poolCache = {
        lastRefreshed: Date.now(),
        pools: poolMap,
      }
    }
  }
  /**
   *
   * @param inputAmount - amount to swap
   * @param pool - Pool Data, RUNE and ASSET Depths
   * @returns swap output object - output - fee - slip
   */
  async getExpectedSwapOutput(inputAmount: CryptoAmount, destinationAsset: Asset): Promise<SwapOutput> {
    if (isAssetRuneNative(inputAmount.asset)) {
      //singleswap from rune -> asset
      const pool = await this.getPoolForAsset(destinationAsset)
      return getSingleSwap(inputAmount.baseAmount, pool, false)
    } else if (isAssetRuneNative(destinationAsset)) {
      //singleswap from  asset -> rune
      const pool = await this.getPoolForAsset(inputAmount.asset)
      return getSingleSwap(inputAmount.baseAmount, pool, true)
    } else {
      //doubleswap asset-> asset
      const inPpool = await this.getPoolForAsset(inputAmount.asset)
      const destPool = await this.getPoolForAsset(destinationAsset)
      return getDoubleSwap(inputAmount.baseAmount, inPpool, destPool)
    }
  }
  async convert(input: CryptoAmount, outAsset: Asset): Promise<CryptoAmount> {
    const exchangeRate = await this.getExchangeRate(input.asset, outAsset)

    const amt = input.assetAmount.times(exchangeRate)
    const result = new CryptoAmount(assetToBase(amt), outAsset)
    // console.log(`${input.baseAmount.amount().toFixed()} = ${result.baseAmount.amount().toFixed()}`)
    return result
  }
}
