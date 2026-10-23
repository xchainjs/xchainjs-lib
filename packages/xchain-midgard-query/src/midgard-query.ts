import { PoolDetail } from '@xchainjs/xchain-midgard'
import { assetToString, isSecuredAsset, isSynthAsset, isTradeAsset } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { ActionHistory, CompatibleAsset, GetActionsParams } from './types'
import { isAssetRuneNative } from './utils/const'

const DEFAULT_THORCHAIN_DECIMALS = 8

const defaultCache = new MidgardCache()

export class MidgardQuery {
  readonly midgardCache: MidgardCache
  readonly overrideDecimals: Record<string, number>

  constructor(midgardCache = defaultCache, overrideDecimals: Record<string, number> = {}) {
    this.midgardCache = midgardCache
    this.overrideDecimals = overrideDecimals
  }

  private async getPool(asset: string): Promise<PoolDetail> {
    const pools = await this.midgardCache.getPools()
    const pool = pools.find((pool) => pool.asset === asset)
    if (!pool) {
      throw new Error(`Can't find pool for asset: ${asset}`)
    }
    return pool
  }

  // fallback decimals when Midgard is unavailable
  private getFallbackDecimals(asset: CompatibleAsset): number {
    const assetString = assetToString(asset)

    // Data sourced from https://gateway.liquify.com/chain/thorchain_api/thorchain/pools
    const fallbackDecimalMap: Record<string, number> = {
      'BTC.BTC': 8,
      'BCH.BCH': 8,
      'LTC.LTC': 8,
      'DOGE.DOGE': 8,
      'ZEC.ZEC': 8,

      'ETH.ETH': 18,
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,
      'ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,
      'ETH.DAI-0x6B175474E89094C44Da98b954EedeAC495271d0F': 18,
      'ETH.WBTC-0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 8,
      'ETH.GUSD-0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd': 2,

      'BSC.BNB': 18,
      'BSC.BUSD-0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': 18,
      // Binance-peg USDT and USDC are 18 decimals. THORNode omits decimals on these pools.
      'BSC.USDT-0x55d398326f99059fF775485246999027B3197955': 18,
      'BSC.USDC-0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': 18,

      'GAIA.ATOM': 6,

      'AVAX.AVAX': 18,
      'AVAX.USDC-0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E': 6,
      'AVAX.USDT-0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7': 6,

      'BASE.USDC-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6,

      'TRON.TRX': 6,
      'TRON.USDT-TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t': 6,

      'XRP.XRP': 6,

      'SOL.SOL': 9,
    }

    const known = Object.keys(fallbackDecimalMap).find(
      (candidate) => candidate.toUpperCase() === assetString.toUpperCase(),
    )
    if (known !== undefined) return fallbackDecimalMap[known]

    const chainDefaults: Record<string, number> = {
      BTC: 8,
      BCH: 8,
      LTC: 8,
      DOGE: 8,
      ZEC: 8,
      ETH: 18,
      BSC: 18,
      BNB: 8,
      GAIA: 6,
      AVAX: 18,
      BASE: 18,
      TRON: 6,
      XRP: 6,
      SOL: 9,
      THOR: DEFAULT_THORCHAIN_DECIMALS,
    }

    const chainDefault = chainDefaults[asset.chain]
    if (chainDefault !== undefined) {
      return chainDefault
    }

    console.warn(`No fallback decimal configured for ${assetString}, using 8 decimals`)
    return 8
  }

  // https://gitlab.com/thorchain/midgard#refresh-native-decimals
  public async getDecimalForAsset(asset: CompatibleAsset): Promise<number> {
    if (this.overrideDecimals[assetToString(asset)]) {
      return this.overrideDecimals[assetToString(asset)]
    }

    if (isAssetRuneNative(asset) || isSynthAsset(asset) || isTradeAsset(asset) || isSecuredAsset(asset))
      return DEFAULT_THORCHAIN_DECIMALS

    try {
      const pool = await this.getPool(assetToString(asset))
      const decimals = Number(pool.nativeDecimal)
      if (decimals >= 0) return decimals
      // Midgard returns -1 for chains where decimals are not yet configured
      console.warn(`Midgard returned -1 decimals for ${assetToString(asset)}, using fallback`)
      return this.getFallbackDecimals(asset)
    } catch (error) {
      // Fallback: if Midgard is down, use standard decimal values for common assets
      console.warn(`Midgard unavailable for decimal lookup, using fallback for ${assetToString(asset)}:`, error)
      return this.getFallbackDecimals(asset)
    }
  }

  /**
   * Paginated by 50. address, asset, type, txType, and affiliate are comma-separated; asset also accepts synth, nosynth, norune.
   * timestamp/height are older-than; fromTimestamp/fromHeight are newer-than. limit defaults to 50, offset to 0.
   */
  public async getActions({
    address,
    txid,
    asset,
    type,
    txType,
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
      txType,
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
