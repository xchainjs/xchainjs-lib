import { MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { Address, Asset, CachedValue, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { CryptoAmount } from './crypto-amount'
import { LiquidityPool } from './liquidity-pool'
import { InboundDetail } from './types'
import { THORChain, isAssetRuneNative } from './utils'
import { Thornode } from './utils/thornode'

const SAME_ASSET_EXCHANGE_RATE = new BigNumber(1)
const TEN_MINUTES = 10 * 60 * 1000

const defaultThornode = new Thornode()
const defaultMidgardQuery = new MidgardQuery()

/**
 * This class manages retrieving information from up to date Thorchain
 */
export class ThorchainCache {
  readonly thornode: Thornode
  readonly midgardQuery: MidgardQuery
  private readonly poolCache: CachedValue<Record<string, LiquidityPool> | undefined>
  private readonly inboundDetailCache: CachedValue<Record<string, InboundDetail>>
  private readonly networkValuesCache: CachedValue<Record<string, number>>

  /**
   * Constructor to create a ThorchainCache
   *
   * @param midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @param midgardQuery - an instance of the midgard query class (could be pointing to stagenet,testnet,mainnet)
   * @param expirePoolCacheMillis - how long should the pools be cached before expiry
   * @param expireAsgardCacheMillis - how long should the inboundAsgard Addresses be cached before expiry
   * @param expireInboundDetailsCacheMillis - how long should the InboundDetails be cached before expiry
   * @param expireNetworkValuesCacheMillis - how long should the Mimir/Constants be cached before expiry
   * @returns ThorchainCache
   */
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
   * if the cache is expired, the pools wioll be re-fetched from thornode
   *
   * @returns Promise<Record<string, LiquidityPool>>
   */
  async getPools(): Promise<Record<string, LiquidityPool>> {
    const pools = await this.poolCache.getValue()
    if (pools) {
      return pools
    } else {
      throw Error('Could not refresh pools')
    }
  }
  /**
   * Refreshes the Pool Cache
   */
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

  /**
   * Refreshes the InboundDetailCache Cache
   */
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

    return inboundDetails
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
    const outDecimals = await this.midgardQuery.getDecimalForAsset(outAsset)
    const inDecimals = input.baseAmount.decimal

    let baseAmountOut = input.baseAmount.times(exchangeRate).amount()
    const adjustDecimals = outDecimals - inDecimals

    baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
    const amt = baseAmount(baseAmountOut, outDecimals)
    const result = new CryptoAmount(amt, outAsset)

    return result
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
    if (this.inboundDetailCache) {
      return await this.inboundDetailCache.getValue()
    } else {
      throw Error(`Could not refresh inbound details `)
    }
  }
  /**
   *
   * @returns - network values
   */
  async getNetworkValues(): Promise<Record<string, number>> {
    if (this.networkValuesCache) {
      return await this.networkValuesCache.getValue()
    } else {
      throw Error(`Could not refresh network values `)
    }
  }
}
