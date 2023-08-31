import { PoolDetail } from '@xchainjs/xchain-midgard'
import { CryptoAmount, assetFromString, baseAmount } from '@xchainjs/xchain-util'

import { MidgardCache } from './midgard-cache'
import { SaversPosition, getSaver } from './types'

const defaultCache = new MidgardCache()

/**
 * THORChain Class for getting  data from Midgard API (THORChain L2 Api).
 */
export class MidgardQuery {
  readonly midgardCache: MidgardCache

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param midgardCache - an instance of the midgardCache (could be pointing to stagenet,testnet,mainnet)
   * @returns ThorchainAMM
   */
  constructor(midgardCache = defaultCache) {
    this.midgardCache = midgardCache
  }

  private async getPool(asset: string): Promise<PoolDetail> {
    const pools = await this.midgardCache.getPools()
    const pool = pools.find((pool) => pool.asset === asset)
    if (!pool) {
      throw new Error(`Can't find pool for asset: ${asset}`)
    }
    return pool
  }

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
}
