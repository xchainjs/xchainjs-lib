import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import {
  AddliquidityPosition,
  EstimateAddLP,
  EstimateWithdrawLP,
  LiquidityPosition,
  RemoveLiquidityPosition,
} from '../src/types'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

require('dotenv').config()

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

// const stagenetCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
// const stagenethorchainQuery = new ThorchainQuery(stagenetCache)

// const testnetCache = new ThorchainCache(new Midgard(Network.Testnet), new Thornode(Network.Testnet))
// const testnethorchainQuery = new ThorchainQuery(testnetCache)

// mainnet asset
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')
// Testnet asset

// const BUSDT = assetFromString('BNB.BUSD-74E')
// if (!BUSDT) throw Error('bad asset')

function printAdd(estimate: EstimateAddLP) {
  const expanded = {
    slip: estimate.slipPercent.toNumber(),
    poolShare: {
      asset: estimate.poolShare.assetShare.formatedAssetString(),
      rune: estimate.poolShare.runeShare.formatedAssetString(),
    },
    lpUnitsL: estimate.lpUnits.amount().toNumber(),
    runeToAssetRatio: estimate.runeToAssetRatio.toNumber(),
    transactionFees: {
      runeFee: estimate.transactionFee.runeFee.formatedAssetString(),
      assetFee: estimate.transactionFee.assetFee.formatedAssetString(),
      totalFees: estimate.transactionFee.totalFees.formatedAssetString(),
    },
    estimatedWait: estimate.estimatedWaitSeconds.toFixed(),
  }
  console.log(expanded)
}
function printWithdraw(withdraw: EstimateWithdrawLP) {
  const expanded = {
    slip: `${withdraw.slipPercent} %`,
    asset: withdraw.assetAmount.assetAmount.amount().toNumber(),
    rune: withdraw.runeAmount.assetAmount.amount().toNumber(),
    txFee: {
      runeFee: withdraw.transactionFee.runeFee.assetAmount.amount().toFixed(),
      assetFee: withdraw.transactionFee.assetFee.assetAmount.amount().toFixed(),
      totalFees: withdraw.transactionFee.totalFees.assetAmount.amount().toFixed(),
    },
    impermanentLossProtection: withdraw.impermanentLossProtection,
    estimatedWait: withdraw.estimatedWaitSeconds.toFixed(),
  }
  console.log(expanded)
}

function printliquidityPosition(liquidityPosition: LiquidityPosition) {
  const expanded = {
    assetPool: liquidityPosition.position.asset,
    assetAmount: liquidityPosition.position.asset_deposit_value,
    runeAmount: liquidityPosition.position.rune_deposit_value,
    impermanentLossProtection: {
      ILProtection: new CryptoAmount(
        baseAmount(liquidityPosition.impermanentLossProtection.ILProtection.amount()),
        AssetRuneNative,
      ).assetAmount
        .amount()
        .toNumber(),
      totalDays: liquidityPosition.impermanentLossProtection.totalDays,
    },
  }
  console.log(expanded)
}

// Test User Functions - LP positions estimations
describe('Thorchain-amm liquidity action end to end Tests', () => {
  // Estimate Liquidity Positions
  it(`Should estimate ADD BUSD liquidity postion for given amount`, async () => {
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(100)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(50)), AssetRuneNative),
    }
    const estimateADDLP = await thorchainQuery.estimateAddLP(addlp)
    printAdd(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate ADD ETH liquidity postion for given amount`, async () => {
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), AssetETH),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const estimateADDLP = await thorchainQuery.estimateAddLP(addlp)
    printAdd(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate ADD BTC liquidity postion for given amount`, async () => {
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.001)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const estimateADDLP = await thorchainQuery.estimateAddLP(addlp)
    printAdd(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate ADD BTC liquidity postion for given amount asymmetrical`, async () => {
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const estimateADDLP = await thorchainQuery.estimateAddLP(addlp)
    printAdd(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })
  it(`Should estimate ADD liquidity postion for LTC & RUNE LP`, async () => {
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(65)), AssetLTC),
      rune: new CryptoAmount(assetToBase(assetAmount(1552)), AssetRuneNative),
    }
    const estimateADDLP = await thorchainQuery.estimateAddLP(addlp)
    printAdd(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })

  it(`Should estimate ADD liquidity postion for BTC & RUNE LP`, async () => {
    const addlp: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.615314)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(5480)), AssetRuneNative),
    }
    const estimateADDLP = await thorchainQuery.estimateAddLP(addlp)
    printAdd(estimateADDLP)
    expect(estimateADDLP).toBeTruthy()
  })

  // Estimate withrdaw lp positions
  it(`Should estimate withdraw BNB from address's position`, async () => {
    const percentage = 100 // gets converted to basis points later
    const assetAddress = 'bc1qzw3xhtwctpezz8m4se7hsw4y68tg42p99gtrae'
    const removeLp: RemoveLiquidityPosition = {
      asset: AssetBTC,
      percentage: percentage,
      assetAddress: assetAddress,
    }
    const estimatRemoveLP = await thorchainQuery.estimateWithdrawLP(removeLp)
    printWithdraw(estimatRemoveLP)
    expect(estimatRemoveLP).toBeTruthy()
  })

  it(`Should check liquidity position for an address`, async () => {
    const address = 'bc1qzw3xhtwctpezz8m4se7hsw4y68tg42p99gtrae'
    const checkLP = await thorchainQuery.checkLiquidityPosition(AssetBTC, address)
    printliquidityPosition(checkLP)
    expect(checkLP).toBeTruthy()
  })
})
