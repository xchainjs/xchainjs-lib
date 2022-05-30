import { assetToBase, baseToAsset, assetAmount} from '@xchainjs/xchain-util'
import { getLiquidityUnits, getPoolShare
} from '../src/utils'
import { PoolData, LiquidityData, UnitData } from '../src/types'
import { BigNumber } from 'bignumber.js'


const btcPool: PoolData = {
  assetBalance: assetToBase(assetAmount(100)),
  runeBalance: assetToBase(assetAmount(2500000))
}

const liquidityUnits: LiquidityData = {
  asset: assetToBase(assetAmount(1)),
  rune: assetToBase(assetAmount(25000))
}
const unitData: UnitData = {
  liquidityUnits: assetToBase(assetAmount(12500.5)),
  totalUnits: assetToBase(assetAmount(12500500))  // liq units * 100
}


describe(`Liquidity calc tests`, () => {
  it(`Should calculate correct liquidity units` , async () => {
    const getLUnits = getLiquidityUnits(liquidityUnits, btcPool )
    const correctLiquidityUnits = new BigNumber(12500.5)
    expect(baseToAsset(getLUnits).amount()).toEqual(correctLiquidityUnits)
  })

  it(`Should calculate correct pool share`, async () => {
    const getLPoolShare = getPoolShare(unitData, btcPool)
    console.log(getLPoolShare.asset.amount())
    console.log(getLPoolShare.rune.amount())
    expect(getLPoolShare.asset.amount()).toEqual(baseToAsset(liquidityUnits.asset).amount()))
  })

})

