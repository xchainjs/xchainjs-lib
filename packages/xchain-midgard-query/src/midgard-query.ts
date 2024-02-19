import { PoolDetail } from '@xchainjs/xchain-midgard'
import { Asset, CryptoAmount, assetFromString, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { SaversPosition, getSaver } from './types'
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

  /**
   * Constructor to create a MidgardQuery.
   *
   * @param midgardCache - An instance of the MidgardCache (could be pointing to stagenet, testnet, mainnet).
   * @returns MidgardQuery
   */
  constructor(midgardCache = defaultCache) {
    this.midgardCache = midgardCache
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
      const asset = assetFromString(saver.pool)

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
  public async getDecimalForAsset(asset: Asset): Promise<number> {
    if (isAssetRuneNative(asset) || asset.synth) return DEFAULT_THORCHAIN_DECIMALS

    const pool = await this.getPool(assetToString(asset))
    return Number(pool.nativeDecimal)
  }
}
