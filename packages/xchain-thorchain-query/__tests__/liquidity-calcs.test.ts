import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from '../src/liquidity-pool'
import { LiquidityData, UnitData } from '../src/types'
import { getLiquidityUnits, getPoolShare } from '../src/utils'

const btcPoolDetails = {
  LP_units: '476999260431737',
  asset: 'BTC.BTC',
  balance_asset: '84613721283',
  balance_rune: '855784996349617',
  pending_inbound_asset: '381258362',
  pending_inbound_rune: '216150796102',
  pool_units: '499780934986115',
  status: 'Available',
  synth_supply: '7713948757',
  synth_units: '22781674554378',
}

const btcPool = new LiquidityPool(btcPoolDetails)

// const btcInput = assetToBase(assetAmount(1))

const liquidity: LiquidityData = {
  asset: new BigNumber(1),
  rune: new BigNumber(10114.2150116231048),
}
const unitData: UnitData = {
  liquidityUnits: new BigNumber(0.00005058),
  totalUnits: new BigNumber(499780934986115), // liq units * 100
}

describe(`Liquidity calc tests`, () => {
  it(`Should calculate correct liquidity units`, async () => {
    const getLUnits = getLiquidityUnits(liquidity, btcPool)
    const correctLiquidityUnits = new BigNumber(5057.559132979577)
    expect(getLUnits.toPrecision(2)).toEqual(correctLiquidityUnits.toPrecision(2))
  })

  it(`Should return inversed asset price`, async () => {
    const BN_1 = new BigNumber(1)
    const runeToAssetRatio = btcPool.runeBalance.div(btcPool.assetBalance)
    const output = BN_1.dividedBy(runeToAssetRatio.amount())
    expect(btcPool.assetToRuneRatio.toPrecision(2)).toEqual(output.toPrecision(2))
  })

  it(`Should calculate correct pool share`, async () => {
    const getLPoolShare = getPoolShare(unitData, btcPool)
    console.log(getLPoolShare.asset, getLPoolShare.rune)
  })
})
