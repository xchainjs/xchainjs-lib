import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainAMM } from '../src/thorchain-amm'
import { ThorchainCache } from '../src/thorchain-cache'
import { AddliquidityPosition, EstimateLP, RemoveLiquidityPosition } from '../src/types'
import { Midgard } from '../src/utils/midgard'
import { Wallet } from '../src/wallet'
require('dotenv').config()

const midgard = new Midgard(Network.Mainnet)
const mainnetCache = new ThorchainCache(midgard)
const thorchainAmm = new ThorchainAMM(mainnetCache)
const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', mainnetCache)

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')

function print(estimate: EstimateLP) {
  const expanded = {
    slip: estimate.slip.toNumber(),
    poolShare: {
      asset: estimate.poolShare.assetShare.toNumber(),
      rune: estimate.poolShare.runeShare.toNumber(),
    },
    lpUnitsL: estimate.lpUnits.toNumber(),
    runeToAssetRatio: estimate.runeToAssetRatio.toNumber(),
    transactionFees: {
      runeFee: estimate.transactionFee.runeFee.assetAmount.amount().toFixed(),
      assetFee: estimate.transactionFee.assetFee.assetAmount.amount().toFixed(),
      totalFees: estimate.transactionFee.TotalFees.assetAmount.amount().toFixed(),
    },
    estimatedWait: estimate.estimatedWait.toFixed(),
  }
  console.log(expanded)
}

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-amm liquidity action end to end Tests', () => {
  it(`Should estimate liquidity postion for given BUSD`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    }
    const estimatedLP = await thorchainAmm.estimatAddLP(addlp)
    print(estimatedLP)
    expect(estimatedLP).toBeTruthy()
  })
  it(`Should estimate liquidity postion for LTC & RUNE LP`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(65)), AssetLTC),
      rune: new CryptoAmount(assetToBase(assetAmount(1552)), AssetRuneNative),
      action: LPAction,
    }
    const estimatedLP = await thorchainAmm.estimatAddLP(addlp)
    print(estimatedLP)
    expect(estimatedLP).toBeTruthy()
  })

  it(`Should estimate liquidity postion for BTC & RUNE LP`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.615314)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(5480)), AssetRuneNative),
      action: LPAction,
    }
    const estimatedLP = await thorchainAmm.estimatAddLP(addlp)
    print(estimatedLP)
    expect(estimatedLP).toBeTruthy()
  })

  it(`Should add BUSD liquidity asymmetrically to BUSD pool `, async () => {
    const LPAction = '+' // add to lP position
    const hash = await thorchainAmm.addLiquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add RUNE liquidity asymmetrically to BUSD pool `, async () => {
    const LPAction = '+' // add to lP position
    const hash = await thorchainAmm.addLiquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(1)), AssetRuneNative),
      action: LPAction,
    })
    console.log(hash)
    expect(hash).toBeTruthy()
  })

  it(`Should add BUSD & RUNE liquidity asymmetrically to BUSD pool BUSD only`, async () => {
    const LPAction = '+' // add to lP position
    const hash = await thorchainAmm.addLiquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0.3989486685228032)), AssetRuneNative),
      action: LPAction,
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove liquidty asymmetrically from the BUSD pool RUNE only`, async () => {
    const LPAction = '-' // add to lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await thorchainAmm.removeLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove liquidty symetrically from the BUSD pool`, async () => {
    const LPAction = '-' // add to lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await thorchainAmm.removeLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  // it(`Should remove asymmetrically to Rune from symmetrical lp`, async () => {
  //   const LPAction = '-' // add to lP position
  //   const percentage = 100 // gets converted to basis points later
  //   const removeLp: RemoveLiquidityPosition = {
  //     action: LPAction,
  //     percentage: percentage,
  //     asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
  //     rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
  //   }
  //   const hash = await thorchainAmm.removeLiquidityPosition(mainnetWallet, removeLp )
  //   console.log(hash)
  //   expect(hash).toBeTruthy()
  // })
  it(`Should check liquidity position for an address`, async () => {
    const address = ''
    const checkLP = await thorchainAmm.checkLiquidityPosition(address)
    console.log(checkLP)
    expect(checkLP).toBeTruthy()
  })
  // it(`Should return correct lp details`, async () => {
  //   const busd = new CryptoAmount(assetToBase(assetAmount(1)), BUSD)
  //   const address = 'bnb150vpa06jrgucqz9ycgun73t0n0rrxq4m69fc22'
  //   const poolShare = await thorchainAmm.checkLiquidityPosition(address)
  //   expect(baseAmount(poolShare.assetAdded).amount()).toEqual(busd.baseAmount.amount())
  // })
})
