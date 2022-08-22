import { Network } from '@xchainjs/xchain-client'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import {
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
} from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainAMM } from '../src/thorchain-amm'
import { ThorchainCache } from '../src/thorchain-cache'
import { AddliquidityPosition, EstimateADDLP, RemoveLiquidityPosition } from '../src/types'
import { Midgard } from '../src/utils/midgard'
import { Wallet } from '../src/wallet'
require('dotenv').config()

const testnetCache = new ThorchainCache(new Midgard(Network.Testnet))

const midgard = new Midgard(Network.Mainnet)
const mainnetCache = new ThorchainCache(midgard)
const thorchainAmm = new ThorchainAMM(mainnetCache)
const testnetThorchainAmm = new ThorchainAMM(testnetCache)
const testnetWallet = new Wallet(process.env.TESTNETPHRASE || 'you forgot to set the phrase', testnetCache)
//const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', mainnetCache)

// mainnet asset
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')
// Testnet asset

const BUSDT = assetFromString('BNB.BUSD-74E')
if (!BUSDT) throw Error('bad asset')

function print(estimate: EstimateADDLP) {
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
      totalFees: estimate.transactionFee.totalFees.assetAmount.amount().toFixed(),
    },
    estimatedWait: estimate.estimatedWait.toFixed(),
  }
  console.log(expanded)
}

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-amm liquidity action end to end Tests', () => {
  // Estimate Liquidity Positions
  it(`Should estimate BUSD liquidity postion for given amount`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(8.9)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(2)), AssetRuneNative),
      action: LPAction,
    }
    const estimateADDLP = await testnetThorchainAmm.estimatAddLP(addlp)
    print(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate ETH liquidity postion for given amount`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), AssetETH),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    }
    const estimateADDLP = await testnetThorchainAmm.estimatAddLP(addlp)
    print(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate BTC liquidity postion for given amount`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.001)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    }
    const estimateADDLP = await testnetThorchainAmm.estimatAddLP(addlp)
    print(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate liquidity postion for LTC & RUNE LP`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(65)), AssetLTC),
      rune: new CryptoAmount(assetToBase(assetAmount(1552)), AssetRuneNative),
      action: LPAction,
    }
    const estimateADDLP = await thorchainAmm.estimatAddLP(addlp)
    print(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })

  it(`Should estimate liquidity postion for BTC & RUNE LP`, async () => {
    const LPAction = '+' // add to lP position
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.615314)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(5480)), AssetRuneNative),
      action: LPAction,
    }
    const estimateADDLP = await thorchainAmm.estimatAddLP(addlp)
    print(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  // Add liquidity positions
  it(`Should add BUSD liquidity asymmetrically to BUSD pool `, async () => {
    const LPAction = '+' // add to lP position
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add ETH liquidity asymmetrically to ETH pool `, async () => {
    const LPAction = '+' // add to lP position
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(1.5, ETH_DECIMAL)), AssetETH),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    }
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, addLPparams)

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add BTC liquidity asymmetrically to BTC pool `, async () => {
    const LPAction = '+' // add to lP position
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.009)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    }
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, addLPparams)

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add RUNE liquidity asymmetrically to BUSD pool `, async () => {
    const LPAction = '+' // add to lP position
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(1.19997)), AssetRuneNative),
      action: LPAction,
    }
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, addLPparams)
    console.log(hash)
    expect(hash).toBeTruthy()
  })

  it(`Should add BUSD & RUNE liquidity symmetrically to BUSD pool`, async () => {
    const LPAction = '+' // add to lP position
    const poolRatio = await testnetThorchainAmm.getPoolRatios(BUSDT)
    // get ratios for pool and retrieve rune amount
    const busdtAmount = poolRatio.assetToRune.times(1.2)
    const runeAmount = poolRatio.runeToAsset.times(busdtAmount)
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(busdtAmount)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(runeAmount)), AssetRuneNative),
      action: LPAction,
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  // Remove Liquidity Positions
  it(`Should remove BUSD only liquidity asymmetrically from the BUSD pool `, async () => {
    const LPAction = '-' // remove from lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0.00001)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove Rune liquidity asymetrically from the BUSD pool`, async () => {
    const LPAction = '-' // remove from lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove BUSDT & RUNE symmetrically from symmetrical lp`, async () => {
    const LPAction = '-' // add to lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove ETH liquidity asymetrically from the ETH pool`, async () => {
    const LPAction = '-' // remove from lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0, ETH_DECIMAL)), AssetETH),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove BTC liquidity asymetrically from the BTC pool`, async () => {
    const LPAction = '-' // remove from lP position
    const percentage = 100 // gets converted to basis points later
    const removeLp: RemoveLiquidityPosition = {
      action: LPAction,
      percentage: percentage,
      asset: new CryptoAmount(assetToBase(assetAmount(0)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should check liquidity position for an address`, async () => {
    const address = 'Redacted'
    const checkLP = await thorchainAmm.checkLiquidityPosition(address)
    console.log(checkLP)
    expect(checkLP).toBeTruthy()
  })
})
