import { Pool } from '@xchainjs/xchain-thornode/lib'
import { Asset, BaseAmount, assetFromString, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

/**
 * Represent a Liquidity Pool in Thorchain
 */
export class LiquidityPool {
  readonly thornodeDetails: Pool
  readonly assetBalance: BaseAmount
  readonly runeBalance: BaseAmount

  readonly asset: Asset
  readonly assetString: string
  readonly runeToAssetRatio: BigNumber
  readonly assetToRuneRatio: BigNumber

  constructor(thornodeDetails: Pool) {
    this.thornodeDetails = thornodeDetails
    const asset = assetFromString(this.thornodeDetails.asset)
    if (!asset) throw new Error(`could not parse ${this.thornodeDetails.asset}`)

    this.asset = asset
    // this.decimals = decimals
    this.assetString = this.thornodeDetails.asset
    this.assetBalance = baseAmount(this.thornodeDetails.balance_asset)
    this.runeBalance = baseAmount(this.thornodeDetails.balance_rune)

    this.runeToAssetRatio = this.runeBalance.amount().div(this.assetBalance.amount())
    this.assetToRuneRatio = this.assetBalance.amount().div(this.runeBalance.amount())
  }
  isAvailable(): boolean {
    return this.thornodeDetails.status.toLowerCase() === 'available'
  }
}
