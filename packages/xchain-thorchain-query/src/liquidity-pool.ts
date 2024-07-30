import { Pool } from '@xchainjs/xchain-thornode/lib'
import { Asset, BaseAmount, TokenAsset, assetFromString, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

/**
 * Represents a Liquidity Pool in Thorchain
 */
export class LiquidityPool {
  readonly thornodeDetails: Pool // Details of the liquidity pool from ThorNode
  readonly assetBalance: BaseAmount // Balance of the asset in the pool
  readonly runeBalance: BaseAmount // Balance of Rune in the pool

  readonly asset: Asset | TokenAsset // Asset of the pool
  readonly assetString: string // String representation of the asset
  readonly runeToAssetRatio: BigNumber // Ratio of Rune to the asset in the pool
  readonly assetToRuneRatio: BigNumber // Ratio of the asset to Rune in the pool

  constructor(thornodeDetails: Pool) {
    this.thornodeDetails = thornodeDetails
    const asset = assetFromString(this.thornodeDetails.asset) as Asset | TokenAsset
    if (!asset) throw new Error(`could not parse ${this.thornodeDetails.asset}`)

    this.asset = asset
    // this.decimals = decimals
    this.assetString = this.thornodeDetails.asset
    this.assetBalance = baseAmount(this.thornodeDetails.balance_asset)
    this.runeBalance = baseAmount(this.thornodeDetails.balance_rune)
    // Calculate the ratio of Rune to the asset and the ratio of the asset to Rune
    this.runeToAssetRatio = this.runeBalance.amount().div(this.assetBalance.amount())
    this.assetToRuneRatio = this.assetBalance.amount().div(this.runeBalance.amount())
  }

  /**
   * Checks if the liquidity pool is available
   * @returns {boolean} True if the liquidity pool is available, otherwise false
   */
  isAvailable(): boolean {
    return this.thornodeDetails.status.toLowerCase() === 'available'
  }
}
