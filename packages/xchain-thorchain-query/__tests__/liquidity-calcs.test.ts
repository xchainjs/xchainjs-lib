import { Network } from '@xchainjs/xchain-client'
import { AssetBTC, AssetRuneNative, assetAmount, assetFromString, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { LiquidityPool } from '../src/liquidity-pool'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { Block, LiquidityToAdd, PoolShareDetail, PostionDepositValue, UnitData } from '../src/types'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from '../src/utils/liquidity'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

const BUSD = assetFromString('BNB.BUSD-BD1')

const BusdPoolDetails = {
  annualPercentageRate: '-0.08690907236215786',
  asset: 'BNB.BUSD-BD1',
  assetDepth: '782699801097358',
  assetPrice: '0.6213456696171857',
  assetPriceUSD: '1',
  liquidityUnits: '103754320722837',
  poolAPY: '0',
  runeDepth: '486327132022076',
  status: 'available',
  synthSupply: '204728293012779',
  synthUnits: '15611003797131',
  units: '119365324519968',
  volume24h: '472358072383752',
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
    const correctLiquidityUnits = new BigNumber('27826793')
    expect(baseAmount(getLUnits).amount()).toEqual(baseAmount(correctLiquidityUnits).amount())
  })
  // Not sure what Lp units actually represents
  it(`Should calculate pool share`, async () => {
    const busdPool = await thorchainQuery.thorchainCache.getPoolForAsset(BUSD)
    const unitData: UnitData = {
      liquidityUnits: baseAmount('27826793'),
      totalUnits: baseAmount('128097884443169'),
    }
    const getLPoolShare = getPoolShare(unitData, busdPool)
    const correctShare: PoolShareDetail = {
      assetShare: new BigNumber('205262786'),
      runeShare: new BigNumber('102658114'),
    }
    expect(baseAmount(getLPoolShare.assetShare).amount()).toEqual(baseAmount(correctShare.assetShare).amount())
    expect(baseAmount(getLPoolShare.runeShare).amount()).toEqual(baseAmount(correctShare.runeShare).amount())
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
  it(`Should calculate the correct ILP data `, async () => {
    // Starting position
    const depositValue: PostionDepositValue = {
      asset: new CryptoAmount(assetToBase(assetAmount(`1`)), AssetBTC).baseAmount,
      rune: new CryptoAmount(assetToBase(assetAmount('4000')), AssetRuneNative).baseAmount,
    }
    // Current pool position
    const poolShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`0.8889`)), AssetBTC).baseAmount.amount(),
      runeShare: new CryptoAmount(assetToBase(assetAmount('4444')), AssetRuneNative).baseAmount.amount(),
    }
    // Current block data
    const block: Block = {
      current: 25744,
      lastAdded: 25600,
      fullProtection: 144,
    }
    const checkILP = getLiquidityProtectionData(depositValue, poolShare, block)
    expect(checkILP).toEqual(111.43750703)
  })
})
