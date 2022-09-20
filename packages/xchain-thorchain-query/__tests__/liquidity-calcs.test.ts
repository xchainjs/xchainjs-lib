import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { LiquidityPool } from '../src/liquidity-pool'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { LiquidityToAdd, UnitData } from '../src/types'
import { getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from '../src/utils/liquidity'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

// const liquidity: LiquidityToAdd = {
//   asset: new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC).baseAmount,
//   rune: new CryptoAmount(assetToBase(assetAmount('9177')), AssetRuneNative).baseAmount,
// }

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

const BusdPoolDetails = {
  annualPercentageRate: '0.09731470549045307',
  asset: 'BNB.BUSD-BD1',
  assetDepth: '944906899325454',
  assetPrice: '0.50000000',
  assetPriceUSD: '0.999999955869585',
  liquidityUnits: '0',
  poolAPY: '0',
  runeDepth: '472576456280254',
  status: 'available',
  synthSupply: '11035203002',
  synthUnits: '1634889648287',
  units: '263973251769640',
  volume24h: '8122016881297',
}
const BusdPool = new LiquidityPool(BusdPoolDetails, 8)

describe(`Liquidity calc tests`, () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
    mockThornodeApi.restore()
  })

  it(`Should calculate correct liquidity units for above entry`, async () => {
    const liquidityBUSd: LiquidityToAdd = {
      asset: assetToBase(assetAmount('0')),
      rune: assetToBase(assetAmount('2.26748000')),
    }
    const getLUnits = getLiquidityUnits(liquidityBUSd, BusdPool)
    const correctLiquidityUnits = new BigNumber('28343597')
    expect(baseAmount(getLUnits).amount()).toEqual(baseAmount(correctLiquidityUnits).amount())
  })
  // Not sure what Lp units actually represents
  it(`Should calculate pool share`, async () => {
    const busdPool = await thorchainQuery.thorchainCache.getPoolForAsset(BUSD)
    const unitData: UnitData = {
      liquidityUnits: baseAmount('28343597'),
      totalUnits: baseAmount('128097884443169'),
    }
    const getLPoolShare = getPoolShare(unitData, busdPool)
    console.log(
      new CryptoAmount(baseAmount(getLPoolShare.assetShare), BUSD).assetAmount.amount().toNumber(),
      baseToAsset(baseAmount(getLPoolShare.runeShare)).amount().toNumber(),
    )
  })
  it(`Should calculate slip on liquidity for single sided BTC add`, async () => {
    const btcPool = await thorchainQuery.thorchainCache.getPoolForAsset(AssetBTC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('100')), AssetBTC).baseAmount,
      rune: new CryptoAmount(assetToBase(assetAmount('0')), AssetRuneNative).baseAmount,
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, btcPool)
    const correctSlip = '12.3' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate slip on liquidity for single sided RUNE add`, async () => {
    const btcPool = await thorchainQuery.thorchainCache.getPoolForAsset(AssetBTC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('0')), AssetBTC).baseAmount,
      rune: new CryptoAmount(assetToBase(assetAmount('9177')), AssetRuneNative).baseAmount,
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, btcPool)
    const correctSlip = '0.104' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
})
