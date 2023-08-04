import { PoolDetail } from '@xchainjs/xchain-midgard'
import { Pool } from '@xchainjs/xchain-mayanode'
import { assetAmount, assetFromStringEx, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockMayanodeApi from '../__mocks__/mayanode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { LiquidityPool } from '../src/liquidity-pool'
import { MayachainQuery } from '../src/mayachain-query'
import { Block, LiquidityToAdd, PoolShareDetail, PostionDepositValue, UnitData } from '../src/types'
import { AssetCacaoNative } from '../src/utils'
import {
  getLiquidityProtectionData,
  getLiquidityUnits,
  getPoolOwnership,
  getPoolShare,
  getSlipOnLiquidity,
} from '../src/utils/liquidity'

const mayachainQuery = new MayachainQuery()

const BUSD = assetFromStringEx('BNB.BUSD-BD1')
const USDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetETH = assetFromStringEx('ETH.ETH')

const BusdMidgardPoolDetails1: PoolDetail = {
  annualPercentageRate: '-0.08690907236215786',
  asset: 'BNB.BUSD-BD1',
  assetDepth: '782699801097358',
  assetPrice: '0.6213456696171857',
  assetPriceUSD: '1',
  liquidityUnits: '117576764000000',
  nativeDecimal: '8',
  saversDepth: '0',
  saversUnits: '0',
  saversAPR: '0',
  poolAPY: '0',
  runeDepth: '486327132022076',
  status: 'available',
  synthSupply: '204728293012779',
  synthUnits: '15611003797131',
  units: '119365324519968',
  volume24h: '472358072383752',
  totalCollateral: '',
  totalDebtTor: '',
}
const BusdThornodePoolDetails1: Pool = {
  LP_units: '52543071634074',
  asset: 'BNB.BUSD-BD1',
  balance_asset: '377399468483592',
  balance_cacao: '250518706651581',
  pending_inbound_asset: '280314005423',
  pending_inbound_cacao: '533139903979',
  pool_units: '56086787104869',
  status: 'Available',
  synth_supply: '47690245926711',
  synth_units: '3543715470795',
}

const emptyBusdPoolDetails: PoolDetail = {
  annualPercentageRate: '0',
  asset: 'BNB.BUSD-BD1',
  assetDepth: '0',
  assetPrice: '0',
  assetPriceUSD: '0',
  liquidityUnits: '10',
  nativeDecimal: '8',
  saversDepth: '0',
  saversUnits: '0',
  saversAPR: '0',
  poolAPY: '0',
  runeDepth: '0',
  status: 'available',
  synthSupply: '0',
  synthUnits: '0',
  units: '100000000',
  volume24h: '0',
  totalCollateral: '',
  totalDebtTor: '',
}
describe(`Liquidity calc tests`, () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockMayanodeApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
    mockMayanodeApi.restore()
  })

  it(`Should calculate correct liquidity units for above entry`, async () => {
    const BusdPool1 = new LiquidityPool(BusdMidgardPoolDetails1, BusdThornodePoolDetails1)
    const liquidityBUSd: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount(`2.05262786`, 6)), BUSD),
      cacao: new CryptoAmount(assetToBase(assetAmount('1.02658114')), AssetCacaoNative),
    }
    const getLUnits = getLiquidityUnits(liquidityBUSd, BusdPool1)
    const correctLiquidityUnits = new BigNumber('27826794')
    expect(baseAmount(getLUnits).amount()).toEqual(baseAmount(correctLiquidityUnits).amount())
  })
  // Not sure what Lp units actually represents
  it(`Should calculate pool share`, async () => {
    const busdPool = await mayachainQuery.mayachainCache.getPoolForAsset(BUSD)
    const unitData: UnitData = {
      liquidityUnits: new BigNumber('27826793'),
      totalUnits: new BigNumber('128097884443169'),
    }
    const getLPoolShare = getPoolShare(unitData, busdPool)
    const correctShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`2.05262786`)), BUSD),
      cacaoShare: new CryptoAmount(assetToBase(assetAmount('1.02658114')), AssetCacaoNative),
    }
    expect(getLPoolShare.assetShare.assetAmount.amount()).toEqual(correctShare.assetShare.assetAmount.amount())
    expect(getLPoolShare.cacaoShare.assetAmount.amount()).toEqual(correctShare.cacaoShare.assetAmount.amount())
  })
  it(`Should calculate slip on liquidity for single sided BTC add`, async () => {
    const btcPool = await mayachainQuery.mayachainCache.getPoolForAsset(AssetBTC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('100')), AssetBTC),
      cacao: new CryptoAmount(assetToBase(assetAmount('0')), AssetCacaoNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, btcPool)
    const correctSlip = '12.3' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate slip on liquidity for single sided USDC add`, async () => {
    const usdcPool = await mayachainQuery.mayachainCache.getPoolForAsset(USDC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('10000', 6)), USDC),
      cacao: new CryptoAmount(assetToBase(assetAmount('0')), AssetCacaoNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, usdcPool)
    const correctSlip = '0.307' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate slip on liquidity for single sided ETH add`, async () => {
    const ethPool = await mayachainQuery.mayachainCache.getPoolForAsset(AssetETH)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('100', 18)), AssetETH),
      cacao: new CryptoAmount(assetToBase(assetAmount('0')), AssetCacaoNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, ethPool)
    const correctSlip = '1.56' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate slip on liquidity for single sided RUNE add`, async () => {
    const btcPool = await mayachainQuery.mayachainCache.getPoolForAsset(AssetBTC)
    const liquidityOneSided: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('0')), AssetBTC),
      cacao: new CryptoAmount(assetToBase(assetAmount('9177')), AssetCacaoNative),
    }
    const getSlip = getSlipOnLiquidity(liquidityOneSided, btcPool)
    const correctSlip = '0.104' // percent slippage
    expect(getSlip.times(100).toPrecision(3)).toEqual(correctSlip)
  })
  it(`Should calculate the correct ILP data symmetrical`, async () => {
    // Starting position
    const depositValue: PostionDepositValue = {
      asset: new CryptoAmount(assetToBase(assetAmount(`1`)), AssetBTC).baseAmount,
      cacao: new CryptoAmount(assetToBase(assetAmount('4000')), AssetCacaoNative).baseAmount,
    }
    // Current pool position
    const poolShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`0.888889`)), AssetBTC),
      cacaoShare: new CryptoAmount(assetToBase(assetAmount('4444.444')), AssetCacaoNative),
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
      cacao: new CryptoAmount(assetToBase(assetAmount('0')), AssetCacaoNative).baseAmount,
    }
    // Current pool position
    const poolShare: PoolShareDetail = {
      assetShare: new CryptoAmount(assetToBase(assetAmount(`0.499999`)), AssetBTC),
      cacaoShare: new CryptoAmount(assetToBase(assetAmount('6000.88')), AssetCacaoNative),
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
    const BusdPool = new LiquidityPool(emptyBusdPoolDetails, BusdThornodePoolDetails1)
    const liquidityToAdd: LiquidityToAdd = {
      asset: new CryptoAmount(assetToBase(assetAmount('50')), BUSD),
      cacao: new CryptoAmount(assetToBase(assetAmount('50')), AssetCacaoNative),
    }
    const onwershipPercent = getPoolOwnership(liquidityToAdd, BusdPool)
    const correctOwership = 0.5000000002 // percent ownership
    expect(onwershipPercent).toEqual(correctOwership)
  })
})
