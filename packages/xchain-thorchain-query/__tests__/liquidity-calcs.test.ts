import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetRuneNative,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { LiquidityPool } from '../src/liquidity-pool'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { Block, LiquidityToAdd, PoolShareDetail, PostionDepositValue, UnitData } from '../src/types'
import {
  getLiquidityProtectionData,
  getLiquidityUnits,
  getPoolOwnership,
  getPoolShare,
  getSlipOnLiquidity,
} from '../src/utils/liquidity'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

const BUSD = assetFromStringEx('BNB.BUSD-BD1')

const BusdPoolDetails1 = {
  annualPercentageRate: '-0.08690907236215786',
  asset: 'BNB.BUSD-BD1',
  assetDepth: '782699801097358',
  assetPrice: '0.6213456696171857',
  assetPriceUSD: '1',
  liquidityUnits: '117576764000000',
  poolAPY: '0',
  runeDepth: '486327132022076',
  status: 'available',
  synthSupply: '204728293012779',
  synthUnits: '15611003797131',
  units: '119365324519968',
  volume24h: '472358072383752',
}
// const BusdPoolDetails = {
//   annualPercentageRate: '-0.08690907236215786',
//   asset: 'BNB.BUSD-BD1',
//   assetDepth: '100000000',
//   assetPrice: '0.6213456696171857',
//   assetPriceUSD: '1',
//   liquidityUnits: '100000000',
//   poolAPY: '0',
//   runeDepth: '100000000',
//   status: 'available',
//   synthSupply: '204728293012779',
//   synthUnits: '15611003797131',
//   units: '119365324519968',
//   volume24h: '472358072383752',
// }
const emptyBusdPoolDetails = {
  annualPercentageRate: '0',
  asset: 'BNB.BUSD-BD1',
  assetDepth: '0',
  assetPrice: '0',
  assetPriceUSD: '0',
  liquidityUnits: '10',
  poolAPY: '0',
  runeDepth: '0',
  status: 'available',
  synthSupply: '0',
  synthUnits: '0',
  units: '100000000',
  volume24h: '0',
}
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
    const BusdPool1 = new LiquidityPool(BusdPoolDetails1, 8)
    const liquidityBUSd: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount(`2.05262786`, 6)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount('1.02658114')), AssetRuneNative),
    }
    const getLUnits = getLiquidityUnits(liquidityBUSd, BusdPool1)
    const correctLiquidityUnits = new BigNumber('27826794')
    expect(baseAmount(getLUnits).amount()).toEqual(baseAmount(correctLiquidityUnits).amount())
  })
  // Not sure what Lp units actually represents
  it(`Should calculate pool share`, async () => {
    const busdPool = await thorchainQuery.thorchainCache.getPoolForAsset(BUSD)
    const unitData: UnitData = {
      liquidityUnits: new BigNumber('27826793'),
      totalUnits: new BigNumber('128097884443169'),
    }
    const getLPoolShare = getPoolShare(unitData, busdPool)
    const correctShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`2.05262786`)), BUSD),
      runeShare: new CryptoAmount(assetToBase(assetAmount('1.02658114')), AssetRuneNative),
    }
    expect(getLPoolShare.assetShare.assetAmount.amount()).toEqual(correctShare.assetShare.assetAmount.amount())
    expect(getLPoolShare.runeShare.assetAmount.amount()).toEqual(correctShare.runeShare.assetAmount.amount())
  })
  it(`Should calculate slip on liquidity for single sided BTC add`, async () => {
    const btcPool = await thorchainQuery.thorchainCache.getPoolForAsset(AssetBTC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('100')), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount('0')), AssetRuneNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, btcPool)
    const correctSlip = '12.3' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate slip on liquidity for single sided RUNE add`, async () => {
    const btcPool = await thorchainQuery.thorchainCache.getPoolForAsset(AssetBTC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('0')), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount('9177')), AssetRuneNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, btcPool)
    const correctSlip = '0.104' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate the correct ILP data symmetrical`, async () => {
    // Starting position
    const depositValue: PostionDepositValue = {
      asset: new CryptoAmount(assetToBase(assetAmount(`1`)), AssetBTC).baseAmount,
      rune: new CryptoAmount(assetToBase(assetAmount('4000')), AssetRuneNative).baseAmount,
    }
    // Current pool position
    const poolShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`0.888889`)), AssetBTC),
      runeShare: new CryptoAmount(assetToBase(assetAmount('4444.444')), AssetRuneNative),
    }
    // Current block data
    const block: Block = {
      current: 25744,
      lastAdded: 25600,
      fullProtection: 144,
    }
    const checkILP = getLiquidityProtectionData(depositValue, poolShare, block)
    expect(checkILP.ILProtection.assetAmount.amount().toNumber()).toEqual(111.110875)
    expect(checkILP.totalDays).toEqual('100.00')
  })
  it(`Should calculate the correct ILP data Asymetrical `, async () => {
    // Starting position
    const depositValue: PostionDepositValue = {
      asset: new CryptoAmount(assetToBase(assetAmount(`1`)), AssetBTC).baseAmount,
      rune: new CryptoAmount(assetToBase(assetAmount('0')), AssetRuneNative).baseAmount,
    }
    // Current pool position
    const poolShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`0.499999`)), AssetBTC),
      runeShare: new CryptoAmount(assetToBase(assetAmount('6000.88')), AssetRuneNative),
    }
    // Current block data
    const block: Block = {
      current: 25744,
      lastAdded: 25600,
      fullProtection: 144,
    }
    const checkILP = getLiquidityProtectionData(depositValue, poolShare, block)
    expect(checkILP.ILProtection.assetAmount.amount().toNumber()).toEqual(0.02400357)
    expect(checkILP.totalDays).toEqual('100.00')
  })
  it(`Should calculate correct pool ownership`, async () => {
    const BusdPool = new LiquidityPool(emptyBusdPoolDetails, 8)
    const liquidityToAdd: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('50')), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount('50')), AssetRuneNative),
    }
    const onwershipPercent = getPoolOwnership(liquidityToAdd, BusdPool)
    const correctOwership = 0.5000000002 // percent ownership
    expect(onwershipPercent).toEqual(correctOwership)
  })
  // it(`Should calculate correct liquidity units for adding to empty pool`, async () => {
  //   const BusdPool1 = new LiquidityPool(emptyBusdPoolDetails, 8)
  //   const liquidityBUSd: LiquidityToAdd = {
  //     asset: assetToBase(assetAmount('10')),
  //     rune: assetToBase(assetAmount('10')),
  //   }
  //   const getLUnits = getLiquidityUnits(liquidityBUSd, BusdPool1)
  //   const correctLiquidityUnits = new BigNumber('27826793')
  //   expect(baseAmount(getLUnits).amount()).toEqual(baseAmount(correctLiquidityUnits).amount())
  // })
  // it(`Should calculate pool share2`, async () => {
  //   const BusdPool1 = new LiquidityPool(emptyBusdPoolDetails, 8)
  //   const unitData: UnitData = {
  //     liquidityUnits: baseAmount('100000000'),
  //     totalUnits: baseAmount('1000000000'),
  //   }
  //   const poolShare = getPoolShare(unitData, BusdPool1)
  //   const correctShare: PoolShareDetail = {
  //     assetShare: new CryptoAmount(assetToBase(assetAmount(`100000000`)), BUSD),
  //     runeShare: new CryptoAmount(assetToBase(assetAmount('100000000')), AssetRuneNative),
  //   }
  //   expect(poolShare.assetShare.assetAmount.amount()).toEqual(correctShare.assetShare.assetAmount.amount())
  //   expect(poolShare.runeShare.assetAmount.amount()).toEqual(correctShare.runeShare.assetAmount.amount())
  // })
})
