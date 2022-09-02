import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../src/liquidity-pool'
// import { UnitData } from '../src/types'
// import { getPoolShare } from '../src/utils'

const btcPoolDetails = {
  annualPercentageRate: '0.294476309321674',
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

const btcPool = new LiquidityPool(btcPoolDetails, 8)

// const btcInput = assetToBase(assetAmount(1))

// const liquidity: LiquidityData = {
//   asset: new BigNumber(1),
//   rune: new BigNumber(10114.2150116231048),
// }
// const unitData: UnitData = {
//   liquidityUnits: new BigNumber(0.00005058),
//   totalUnits: new BigNumber(499780934986115), // liq units * 100
// }

describe(`Liquidity calc tests`, () => {
  // it(`Should calculate correct liquidity units`, async () => {
  //   const getLUnits = getLiquidityUnits(liquidity, btcPool)
  //   const correctLiquidityUnits = new BigNumber('5057.559132979577')
  //   expect(getLUnits.toFixed()).toEqual(correctLiquidityUnits.toFixed())
  // })

  it(`Should return inversed asset price`, async () => {
    const BN_1 = new BigNumber(1)
    const runeToAssetRatio = btcPool.runeBalance.div(btcPool.assetBalance)
    const output = BN_1.dividedBy(runeToAssetRatio.amount())
    expect(btcPool.assetToRuneRatio.toPrecision(2)).toEqual(output.toPrecision(2))
  })

  // it(`Should calculate correct pool share`, async () => {
  //   const getLPoolShare = getPoolShare(unitData, btcPool)
  //   console.log(getLPoolShare.asset, getLPoolShare.rune)
  // })
})
