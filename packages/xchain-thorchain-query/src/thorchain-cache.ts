import { Address, Asset, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'
import { LiquidityPool } from './liquidity-pool'
import { InboundDetail, InboundDetailCache, NetworkValuesCache, PoolCache } from './types'
import { THORChain, isAssetRuneNative } from './utils'
import { Midgard } from './utils/midgard'
import { Thornode } from './utils/thornode'

const SAME_ASSET_EXCHANGE_RATE = new BigNumber(1)
const TEN_MINUTES = 10 * 60 * 1000
const DEFAULT_THORCHAIN_DECIMALS = 8
// const USD_ASSETS: Record<Network, Asset[]> = {
//   mainnet: [
//     assetFromStringEx('BNB.BUSD-BD1'),
//     assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48'),
//     assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7'),
//   ],
//   stagenet: [assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7')],
//   testnet: [
//     assetFromStringEx('BNB.BUSD-74E'),
//     assetFromStringEx('ETH.USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306'),
//   ],
// }
const defaultMidgard = new Midgard()
const defaultThornode = new Thornode()

/**
 * This class manages retrieving information from up to date Thorchain
 */
export class ThorchainCache {
  readonly midgard: Midgard
  readonly thornode: Thornode
  private poolCache: PoolCache | undefined
  private inboundDetailCache: InboundDetailCache | undefined = undefined
  private networkValuesCache: NetworkValuesCache | undefined = undefined

  private expirePoolCacheMillis
  private expireInboundDetailsCacheMillis
  private expireNetworkValuesCacheMillis

  /**
   * Contrustor to create a ThorchainCache
   *
   * @param midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @param expirePoolCacheMillis - how long should the pools be cached before expiry
   * @param expireAsgardCacheMillis - how long should the inboundAsgard Addresses be cached before expiry
   * @param expireInboundDetailsCacheMillis - how long should the InboundDetails be cached before expiry
   * @param expireNetworkValuesCacheMillis - how long should the Mimir/Constants be cached before expiry
   * @returns ThorchainCache
   */
  constructor(
    midgard = defaultMidgard,
    thornode = defaultThornode,
    expirePoolCacheMillis = 6000,
    expireInboundDetailsCacheMillis = 6000,
    expireNetworkValuesCacheMillis = TEN_MINUTES,
  ) {
    this.midgard = midgard
    this.thornode = thornode
    this.expirePoolCacheMillis = expirePoolCacheMillis
    this.expireInboundDetailsCacheMillis = expireInboundDetailsCacheMillis
    this.expireNetworkValuesCacheMillis = expireNetworkValuesCacheMillis

    //initialize the cache
    this.refreshPoolCache()
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
    // console.log(` 1 ${assetToString(from)} = ${exchangeRate} ${assetToString(to)}`)
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
    // Note: we use ticker, not asset string to get the same pool for both assets and synths
    // using ticker causes problems between same named tickers but different chains
    const pool = pools[`${asset.chain}.${asset.ticker}`]
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
        await this.refreshPoolCache()
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
   * NOTE: do not call refreshPoolCache() directly, call getPools() instead
   * which will refresh the cache if it's expired
   */
  private async refreshPoolCache(): Promise<void> {
    try {
      const [thornodePools, midgardPools] = await Promise.all([this.thornode.getPools(), this.midgard.getPools()])
      const poolMap: Record<string, LiquidityPool> = {}

      if (midgardPools) {
        for (const pool of midgardPools) {
          try {
            const thornodePool = thornodePools.find((p) => p.asset === pool.asset)
            if (!thornodePool) throw Error(`Could not find thornode pool ${pool.asset}`)
            const lp = new LiquidityPool(pool, thornodePool)
            poolMap[`${lp.asset.chain}.${lp.asset.ticker}`] = lp
          } catch (error) {
            console.log(error)
          }
        }

        this.poolCache = {
          lastRefreshed: Date.now(),
          pools: poolMap,
        }
      }
    } catch (error) {
      console.error('Error refreshing pool cache:', error)
    }
  }

  /**
   * Refreshes the InboundDetailCache Cache
   *
   * NOTE: do not call refereshInboundDetailCache() directly, call getInboundDetails() instead
   * which will refresh the cache if it's expired
   */
  private async refereshInboundDetailCache(): Promise<void> {
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
        !inbound.outbound_fee ||
        !inbound.gas_rate_units
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
      haltedLP: false, //
    }
    inboundDetails[THORChain] = details

    this.inboundDetailCache = {
      lastRefreshed: Date.now(),
      inboundDetails,
    }
  }
  /**
   * Refreshes the NetworkValuesCache Cache
   *
   * NOTE: do not call refereshNetworkValuesCache() directly, call getNetworkValuess() instead
   * which will refresh the cache if it's expired
   */
  private async refereshNetworkValuesCache(): Promise<void> {
    const networkValues = await this.thornode.getNetworkValues()

    this.networkValuesCache = {
      lastRefreshed: Date.now(),
      networkValues,
    }
  }

  /**
   * Returns the exchange of a CryptoAmount to a different Asset
   *
   * Ex. convert(input:100 BUSD, outAsset: BTC) -> 0.0001234 BTC
   *
   * @param input - amount/asset to convert to outAsset
   * @param outAsset - the Asset you want to convert to
   * @returns CryptoAmount of input
   */
  async convert(input: CryptoAmount, outAsset: Asset): Promise<CryptoAmount> {
    const exchangeRate = await this.getExchangeRate(input.asset, outAsset)
    const outDecimals = await this.getDecimalForAsset(outAsset)
    const inDecimals = input.baseAmount.decimal

    let baseAmountOut = input.baseAmount.times(exchangeRate).amount()
    const adjustDecimals = outDecimals - inDecimals

    baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
    const amt = baseAmount(baseAmountOut, outDecimals)
    const result = new CryptoAmount(amt, outAsset)
    // console.log(
    //   `${input.formatedAssetString()} ${input.asset.ticker} = ${result.formatedAssetString()} ${outAsset.ticker}`,
    // )

    return result
  }
  private async getDecimalForAsset(asset: Asset): Promise<number> {
    if (!isAssetRuneNative(asset)) {
      const pool = await this.getPoolForAsset(asset)
      const decimals = Number(pool.pool.nativeDecimal)
      if (decimals > 0) return decimals
      else return DEFAULT_THORCHAIN_DECIMALS
    }
    return DEFAULT_THORCHAIN_DECIMALS
  }

  async getRouterAddressForChain(chain: Chain): Promise<Address> {
    const inboundAsgard = (await this.getInboundDetails())[chain]

    if (!inboundAsgard?.router) {
      throw new Error('router address is not defined')
    }
    return inboundAsgard?.router
  }

  /**
   *
   * @returns - inbound details
   */
  async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    const millisSinceLastRefeshed = Date.now() - (this.inboundDetailCache?.lastRefreshed || 0)
    if (millisSinceLastRefeshed > this.expireInboundDetailsCacheMillis) {
      try {
        await this.refereshInboundDetailCache()
      } catch (e) {
        console.error(e)
      }
    }
    if (this.inboundDetailCache) {
      return this.inboundDetailCache.inboundDetails
    } else {
      throw Error(`Could not refereshInboundDetailCache `)
    }
  }
  /**
   *
   * @returns - network values
   */
  async getNetworkValues(): Promise<Record<string, number>> {
    const millisSinceLastRefeshed = Date.now() - (this.networkValuesCache?.lastRefreshed || 0)
    if (millisSinceLastRefeshed > this.expireNetworkValuesCacheMillis) {
      try {
        await this.refereshNetworkValuesCache()
      } catch (e) {
        console.error(e)
      }
    }
    if (this.networkValuesCache) {
      return this.networkValuesCache.networkValues
    } else {
      throw Error(`Could not refereshInboundDetailCache `)
    }
  }
}
