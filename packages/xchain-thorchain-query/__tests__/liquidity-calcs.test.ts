import { Pool } from '@xchainjs/xchain-thornode'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { LiquidityPool } from '../src/liquidity-pool'
import { ThorchainQuery } from '../src/thorchain-query'
import { Block, LiquidityToAdd, PoolShareDetail, PostionDepositValue, UnitData } from '../src/types'
import { AssetRuneNative } from '../src/utils'
import {
  getLiquidityProtectionData,
  getLiquidityUnits,
  getPoolOwnership,
  getPoolShare,
  getSlipOnLiquidity,
} from '../src/utils/liquidity'

const thorchainQuery = new ThorchainQuery()

const BUSD = assetFromStringEx('BNB.BUSD-BD1')
const USDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetETH = assetFromStringEx('ETH.ETH')

const BusdThornodePoolDetails1: Pool = {
  LP_units: '52543071634074',
  asset: 'BNB.BUSD-BD1',
  balance_asset: '377399468483592',
  balance_rune: '250518706651581',
  pending_inbound_asset: '280314005423',
  pending_inbound_rune: '533139903979',
  pool_units: '56086787104869',
  savers_depth: '0',
  savers_units: '0',
  status: 'Available',
  synth_mint_paused: false,
  synth_supply: '47690245926711',
  synth_supply_remaining: '329709222556881',
  synth_units: '3543715470795',
  derived_depth_bps: '',
  loan_collateral: '',
  loan_cr: '',
  loan_collateral_remaining: '',
  asset_tor_price: '0',
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
    const BusdPool1 = new LiquidityPool(BusdThornodePoolDetails1)
    const liquidityBUSd: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount(`2.05262786`, 6)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount('1.02658114')), AssetRuneNative),
    }
    const getLUnits = getLiquidityUnits(liquidityBUSd, BusdPool1)
    const correctLiquidityUnits = new BigNumber('25054365')
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
      assetShare: new CryptoAmount(assetToBase(assetAmount(`2.05028139`)), BUSD),
      runeShare: new CryptoAmount(assetToBase(assetAmount('1.02857666')), AssetRuneNative),
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
  it(`Should calculate slip on liquidity for single sided USDC add`, async () => {
    const usdcPool = await thorchainQuery.thorchainCache.getPoolForAsset(USDC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('10000', 6)), USDC),
      rune: new CryptoAmount(assetToBase(assetAmount('0')), AssetRuneNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, usdcPool)
    const correctSlip = '0.307' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate slip on liquidity for single sided ETH add`, async () => {
    const ethPool = await thorchainQuery.thorchainCache.getPoolForAsset(AssetETH)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('100', 18)), AssetETH),
      rune: new CryptoAmount(assetToBase(assetAmount('0')), AssetRuneNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, ethPool)
    const correctSlip = '1.56' // percent slippage
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
    const BusdPool = new LiquidityPool(BusdThornodePoolDetails1)
    const liquidityToAdd: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('50')), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount('50')), AssetRuneNative),
    }
    const onwershipPercent = getPoolOwnership(liquidityToAdd, BusdPool)
    const correctOwership = 0.00000997909552651165 // percent ownership
    expect(onwershipPercent).toEqual(correctOwership)
  })
})
