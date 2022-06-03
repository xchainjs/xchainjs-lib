import { assetAmount, assetToBase, baseToAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../src/LiquidityPool'
import { LiquidityData, UnitData } from '../src/types'
import { getLiquidityUnits, getPoolShare } from '../src/utils'

const btcPoolDetails = {
  asset: 'BTC.BTC',
  assetDepth: assetToBase(assetAmount(100)).amount().toFixed(),
  assetPrice: '11121.24920535084',
  assetPriceUSD: '30458.124870650492',
  liquidityUnits: '536087715332333',
  poolAPY: '0.1001447237777584',
  runeDepth: assetToBase(assetAmount(2500000)).amount().toFixed(),
  status: 'available',
  synthSupply: '3304301605',
  synthUnits: '10309541238596',
  units: '546397256570929',
  volume24h: '16202006480711',
}

const btcPool = new LiquidityPool(btcPoolDetails)

const liquidityUnits: LiquidityData = {
  asset: assetToBase(assetAmount(1)),
  rune: assetToBase(assetAmount(25000)),
}
const unitData: UnitData = {
  liquidityUnits: assetToBase(assetAmount(12500.5)),
  totalUnits: assetToBase(assetAmount(1250050)), // liq units * 100
}

describe(`Liquidity calc tests`, () => {
  it(`Should calculate correct liquidity units`, async () => {
    const getLUnits = getLiquidityUnits(liquidityUnits, btcPool)
    const correctLiquidityUnits = new BigNumber(12500.5)
    expect(baseToAsset(getLUnits).amount()).toEqual(correctLiquidityUnits)
  })

  it(`Should calculate correct pool share`, async () => {
    const getLPoolShare = getPoolShare(unitData, btcPool)
    expect(baseToAsset(getLPoolShare.asset).amount()).toEqual(baseToAsset(liquidityUnits.asset).amount())
    expect(baseToAsset(getLPoolShare.rune).amount()).toEqual(baseToAsset(liquidityUnits.rune).amount())
  })
})
