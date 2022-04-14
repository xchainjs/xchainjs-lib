import { bn, formatBN } from '@xchainjs/xchain-util'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { PoolData } from './swap'
import { UnitData, LiquidityData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './liquidity'

const assetPoolBefore: PoolData = {
  assetBalance: assetToBase(assetAmount(110)),
  runeBalance: assetToBase(assetAmount(100))
}
const liquidityData: LiquidityData = { asset: assetToBase(assetAmount(11)), rune: assetToBase(assetAmount(10)) }
const assetPoolAfter: PoolData = {
  assetBalance: assetToBase(assetAmount(121)),
  runeBalance: assetToBase(assetAmount(110))
}
const unitData: UnitData = { liquidityUnits: assetToBase(assetAmount(10.5)), totalUnits: assetToBase(assetAmount(115.5)) }
const poolShare: LiquidityData = { asset: assetToBase(assetAmount(11)), rune: assetToBase(assetAmount(10)) }

const assetPool2Before: PoolData = {
  assetBalance: assetToBase(assetAmount(110)),
  runeBalance: assetToBase(assetAmount(100))
}
const liquidityData2: LiquidityData = { asset: assetToBase(assetAmount(0)), rune: assetToBase(assetAmount(10)) }
const assetPool2After: PoolData = {
  assetBalance: assetToBase(assetAmount(110)),
  runeBalance: assetToBase(assetAmount(110))
}
const unitData2: UnitData = { liquidityUnits: assetToBase(assetAmount(5)), totalUnits: assetToBase(assetAmount(110)) }
const poolShare2: LiquidityData = { asset: assetToBase(assetAmount(5)), rune: assetToBase(assetAmount(5)) }

const liquidityData3: LiquidityData = { asset: assetToBase(assetAmount(20)), rune: assetToBase(assetAmount(0)) }

describe('Liquidity calc', () => {
  describe('Symmetric Liquidity Event', () => {
    it('Correctly gets Liquidity Units', () => {
      const units = getLiquidityUnits(liquidityData, assetPoolBefore)
      expect(units.amount()).toEqual(unitData.liquidityUnits.amount())
    })
    it('Correctly gets Pool Share', () => {
      const poolShare_ = getPoolShare(unitData, assetPoolAfter)
      expect(poolShare_.asset.amount()).toEqual(poolShare.asset.amount())
      expect(poolShare_.rune.amount()).toEqual(poolShare.rune.amount())
    })
  })
  describe('Asymmetric Liquidity Event', () => {
    it('Correctly gets Liquidity Units', () => {
      const units = getSlipOnLiquidity(liquidityData2, assetPool2Before)
      expect(units).toEqual(unitData2.liquidityUnits.amount())
    })

    it('Correctly gets Slip On Liquidity', () => {
      const slip = getSlipOnLiquidity(liquidityData, assetPool2Before)
      expect(formatBN(slip, 8)).toEqual(formatBN(bn('0.09090909'), 8))
    })

    it('Correctly gets Slip On Liquidity2', () => {
      const slip = getSlipOnLiquidity(liquidityData3, assetPool2Before)
      expect(formatBN(slip, 8)).toEqual(formatBN(bn('0.18181818'), 8))
    })
    it('Correctly gets Pool Share', () => {
      const poolShare_ = getPoolShare(unitData2, assetPool2After)
      expect(poolShare_.asset.amount()).toEqual(poolShare2.asset.amount())
      expect(poolShare_.rune.amount()).toEqual(poolShare2.rune.amount())
    })
  })
})
