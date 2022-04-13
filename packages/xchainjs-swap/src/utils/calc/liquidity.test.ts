import { bn, formatBN } from '@xchainjs/xchain-util'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { PoolData } from './swap'
import { UnitData, StakeData, getStakeUnits, getPoolShare, getSlipOnStake } from './stake'

const assetPoolBefore: PoolData = {
  assetBalance: assetToBase(assetAmount(110)),
  runeBalance: assetToBase(assetAmount(100))
}
const stakeData: StakeData = { asset: assetToBase(assetAmount(11)), rune: assetToBase(assetAmount(10)) }
const assetPoolAfter: PoolData = {
  assetBalance: assetToBase(assetAmount(121)),
  runeBalance: assetToBase(assetAmount(110))
}
const unitData: UnitData = { stakeUnits: assetToBase(assetAmount(10.5)), totalUnits: assetToBase(assetAmount(115.5)) }
const poolShare: StakeData = { asset: assetToBase(assetAmount(11)), rune: assetToBase(assetAmount(10)) }

const assetPool2Before: PoolData = {
  assetBalance: assetToBase(assetAmount(110)),
  runeBalance: assetToBase(assetAmount(100))
}
const stakeData2: StakeData = { asset: assetToBase(assetAmount(0)), rune: assetToBase(assetAmount(10)) }
const assetPool2After: PoolData = {
  assetBalance: assetToBase(assetAmount(110)),
  runeBalance: assetToBase(assetAmount(110))
}
const unitData2: UnitData = { stakeUnits: assetToBase(assetAmount(5)), totalUnits: assetToBase(assetAmount(110)) }
const poolShare2: StakeData = { asset: assetToBase(assetAmount(5)), rune: assetToBase(assetAmount(5)) }

const stakeData3: StakeData = { asset: assetToBase(assetAmount(20)), rune: assetToBase(assetAmount(0)) }

describe('Stake calc', () => {
  describe('Symmetric Stake Event', () => {
    it('Correctly gets Stake Units', () => {
      const units = getStakeUnits(stakeData, assetPoolBefore)
      expect(units.amount()).toEqual(unitData.stakeUnits.amount())
    })
    it('Correctly gets Pool Share', () => {
      const poolShare_ = getPoolShare(unitData, assetPoolAfter)
      expect(poolShare_.asset.amount()).toEqual(poolShare.asset.amount())
      expect(poolShare_.rune.amount()).toEqual(poolShare.rune.amount())
    })
  })
  describe('Asymmetric Stake Event', () => {
    it('Correctly gets Stake Units', () => {
      const units = getStakeUnits(stakeData2, assetPool2Before)
      expect(units.amount()).toEqual(unitData2.stakeUnits.amount())
    })

    it('Correctly gets Slip On Stake', () => {
      const slip = getSlipOnStake(stakeData2, assetPool2Before)
      expect(formatBN(slip, 8)).toEqual(formatBN(bn('0.09090909'), 8))
    })

    it('Correctly gets Slip On Stake2', () => {
      const slip = getSlipOnStake(stakeData3, assetPool2Before)
      expect(formatBN(slip, 8)).toEqual(formatBN(bn('0.18181818'), 8))
    })
    it('Correctly gets Pool Share', () => {
      const poolShare_ = getPoolShare(unitData2, assetPool2After)
      expect(poolShare_.asset.amount()).toEqual(poolShare2.asset.amount())
      expect(poolShare_.rune.amount()).toEqual(poolShare2.rune.amount())
    })
  })
})
