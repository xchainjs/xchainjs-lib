import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import { Asset, assetToBase, assetToString, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'
import { LiquidityPool } from './liquidity-pool'
import { PoolCache, SwapOutput } from './types'
import { Midgard } from './utils/midgard'
import { getDoubleSwap, getSingleSwap } from './utils/swap'

const SAME_ASSET_EXCHANGE_RATE = new BigNumber(1)

/**
 * This class manages retrieving information from up to date Thorchain Liquidity Pools
 */
export class LiquidityPoolCache {
  private midgard: Midgard
  private poolCache: PoolCache | undefined
  private expirePoolCacheMillis

  /**
   * Contrustor to create a LiquidityPoolCache
   *
   * @param midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @param expirePoolCacheMillis - how long should the pools be cached before expiry
   * @returns LiquidityPoolCache
   */
  constructor(midgard: Midgard, expirePoolCacheMillis = 6000) {
    this.midgard = midgard
    this.expirePoolCacheMillis = expirePoolCacheMillis

    //initialize the cache
    this.refereshPoolCache()
  }

  /**
   * Gets the exchange rate of the from asset in terms on the to asset
   *
   * @param asset - cannot be RUNE.
   * @returns Promise<BigNumber>
   */
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

    return exchangeRate
  }

  /**
   * Gets the Liquidity Pool for a given Asset
   *
   * @param asset - cannot be RUNE, since Rune is the other side of each pool.
   * @returns Promise<LiquidityPool>
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
   * Get all the Liquidity Pools currently cached.
   * if the cache is expired, the pools wioll be re-fetched from midgard
   *
   * @returns Promise<Record<string, LiquidityPool>>
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
   * Refreshes the Pool Cache
   *
   * NOTE: do not call refereshPoolCache() directly, call getPools() instead
   * which will refresh the cache if it's expired
   */
  private async refereshPoolCache(): Promise<void> {
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
   *  Calcuate the expected slip, output & swapFee given the current pool depths
   *
   *  swapFee - the amount of asset lost  according to slip calculations
   *  slip - the percent (0-1) of original amount lost to slipfees
   *  output - the amount of asset expected from the swap   *
   *
   * @param inputAmount - CryptoAmount amount to swap from
   * @param destinationAsset - destimation Asset to swap to
   * @returns SwapOutput - swap output object - output - fee - slip
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
  /**
   * Returns the exchange of a CryptoAmount to a different Asset
   *
   * Ex. convert(input:100 BUSD, outAsset: BTC) -> 0.0001234 BTC
   *
   * @param input - amount/asset to convert to outAsset
   * @param ouAsset - the Asset you want to convert to
   * @returns CryptoAmount of input
   */
  async convert(input: CryptoAmount, outAsset: Asset): Promise<CryptoAmount> {
    const exchangeRate = await this.getExchangeRate(input.asset, outAsset)

    const amt = input.assetAmount.times(exchangeRate)
    const result = new CryptoAmount(assetToBase(amt), outAsset)

    return result
  }
}
