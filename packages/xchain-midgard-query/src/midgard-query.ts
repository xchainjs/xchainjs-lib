import { PoolDetail } from '@xchainjs/xchain-midgard'
import {
  Asset,
  CryptoAmount,
  TokenAsset,
  assetFromString,
  assetToString,
  baseAmount,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { ActionHistory, CompatibleAsset, GetActionsParams, SaversPosition, getSaver } from './types'
import { isAssetRuneNative } from './utils/const'

/**
 * Default number of decimals used for THORChain assets.
 */
const DEFAULT_THORCHAIN_DECIMALS = 8

/**
 * Default cache instance for Midgard queries.
 */
const defaultCache = new MidgardCache()

/**
 * Class for retrieving and processing data from the Midgard API using MidgardCache to optimize request numbers (THORChain L2 API).
 */
export class MidgardQuery {
  readonly midgardCache: MidgardCache
  readonly overrideDecimals: Record<string, number>

  /**
   * Constructor to create a MidgardQuery.
   *
   * @param midgardCache - An instance of the MidgardCache (could be pointing to stagenet, testnet, mainnet).
   * @returns MidgardQuery
   */
  constructor(midgardCache = defaultCache, overrideDecimals: Record<string, number> = {}) {
    this.midgardCache = midgardCache
    this.overrideDecimals = overrideDecimals
  }

  /**
   * Get pool by asset.
   *
   * @param {string} asset - For example: BTC.BTC.
   * @returns {PoolDetail} - Details of the selected pool.
   * @throws {Error} - Can't find pool for asset.
   */
  private async getPool(asset: string): Promise<PoolDetail> {
    const pools = await this.midgardCache.getPools()
    const pool = pools.find((pool) => pool.asset === asset)
    if (!pool) {
      throw new Error(`Can't find pool for asset: ${asset}`)
    }
    return pool
  }

  /**
   * Provides fallback decimal values for common assets when Midgard is unavailable.
   * @param {CompatibleAsset} asset - The asset to get fallback decimals for.
   * @returns {number} - Standard decimal places for the asset.
   */
  private getFallbackDecimals(asset: CompatibleAsset): number {
    const assetString = assetToString(asset)

    // Map of assets to their actual decimal places from THORChain pools
    // Data sourced from https://thornode-v2.ninerealms.com/thorchain/pools
    const fallbackDecimalMap: Record<string, number> = {
      // Bitcoin and forks
      'BTC.BTC': 8,
      'BCH.BCH': 8,
      'LTC.LTC': 8,
      'DOGE.DOGE': 8,

      // Ethereum and tokens
      'ETH.ETH': 18,
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
      'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,
      'ETH.DAI-0x6B175474E89094C44Da98b954EedeAC495271d0F': 18,
      'ETH.WBTC-0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 8,
      'ETH.GUSD-0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd': 2,

      // Binance Smart Chain
      'BSC.BNB': 18,
      'BSC.BUSD-0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': 18,
      'BSC.USDT-0x55d398326f99059fF775485246999027B3197955': 6,
      'BSC.USDC-0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': 6,

      // Cosmos ecosystem
      'GAIA.ATOM': 6,

      // Avalanche
      'AVAX.AVAX': 18,
      'AVAX.USDC-0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E': 6,
      'AVAX.USDT-0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7': 6,

      // Base
      'BASE.USDC-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6,

      // Tron
      'TRON.TRX': 6,
      'TRON.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,

      // XRP
      'XRP.XRP': 6,
    }

    // Return specific fallback or use chain-based defaults
    if (fallbackDecimalMap[assetString]) {
      return fallbackDecimalMap[assetString]
    }

    // Chain-based fallback decimals based on typical chain standards
    const chainDefaults: Record<string, number> = {
      BTC: 8,
      BCH: 8,
      LTC: 8,
      DOGE: 8,
      ETH: 18,
      BSC: 18,
      BNB: 8,
      GAIA: 6,
      AVAX: 18,
      BASE: 18,
      TRON: 6,
      XRP: 6,
      THOR: DEFAULT_THORCHAIN_DECIMALS,
    }

    const chainDefault = chainDefaults[asset.chain]
    if (chainDefault !== undefined) {
      return chainDefault
    }

    // Ultimate fallback - use 8 decimals (most common for crypto)
    console.warn(`No fallback decimal configured for ${assetString}, using 8 decimals`)
    return 8
  }

  /**
   * Get saver positions by an array of saver descriptions.
   *
   * @param {getSaver[]} params - Array of search conditions.
   * @returns {SaversPosition[]} - Information on the positions found.
   */
  public async getSaverPositions(params: getSaver[]): Promise<SaversPosition[]> {
    const addresses: Set<string> = new Set<string>()
    params.forEach((param) => addresses.add(param.address))
    const addressesString: string = Array.from(addresses).join(',')
    const saversDetail = await this.midgardCache.getSavers(addressesString)
    const errors: string[] = []

    const saversPositions: SaversPosition[] = []
    const allPositionsPromises = saversDetail.pools.map(async (saver) => {
      const asset = assetFromString(saver.pool) as Asset | TokenAsset

      if (asset) {
        const poolDetail = await this.getPool(saver.pool)
        const depositAmount = new CryptoAmount(baseAmount(saver.assetAdded).minus(saver.assetWithdrawn), asset)
        const ownerUnits = Number(saver?.saverUnits)
        const saverUnits = Number(poolDetail.saversUnits)
        const assetDepth = Number(poolDetail.saversDepth)
        const redeemableValue = (ownerUnits / saverUnits) * assetDepth
        const redeemableAssetAmount = new CryptoAmount(baseAmount(redeemableValue), asset)
        const saverGrowth = redeemableAssetAmount.minus(depositAmount).div(depositAmount).times(100)
        const saversAge = (Date.now() / 1000 - Number(saver.dateLastAdded)) / (365 * 86400)

        saversPositions.push({
          depositValue: depositAmount,
          redeemableValue: redeemableAssetAmount,
          lastAddHeight: -1,
          percentageGrowth: saverGrowth.assetAmount.amount().toNumber(),
          ageInYears: saversAge,
          ageInDays: saversAge * 365,
          asset,
          errors,
        })
      }
    })
    await Promise.all(allPositionsPromises)
    return saversPositions
  }

  /**
   * Returns the number of decimals for a given asset.
   *
   * @param {Asset} asset - The asset for getting decimals.
   * @returns {number} - Number of decimals from Midgard. Reference: https://gitlab.com/thorchain/midgard#refresh-native-decimals
   */
  public async getDecimalForAsset(asset: CompatibleAsset): Promise<number> {
    if (this.overrideDecimals[assetToString(asset)]) {
      return this.overrideDecimals[assetToString(asset)]
    }

    if (isAssetRuneNative(asset) || isSynthAsset(asset) || isTradeAsset(asset) || isSecuredAsset(asset))
      return DEFAULT_THORCHAIN_DECIMALS

    try {
      const pool = await this.getPool(assetToString(asset))
      return Number(pool.nativeDecimal)
    } catch (error) {
      // Fallback: if Midgard is down, use standard decimal values for common assets
      console.warn(`Midgard unavailable for decimal lookup, using fallback for ${assetToString(asset)}:`, error)
      return this.getFallbackDecimals(asset)
    }
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
    return this.midgardCache.midgard.getActions({
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
}
