import { AssetBNB } from '@xchainjs/xchain-binance'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import {
  AddliquidityPosition,
  CryptoAmount,
  LiquidityPosition,
  ThorchainQuery,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import { AssetBTC, AssetETH, AssetRuneNative, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'
import { ThorchainAMM } from '../src/thorchain-amm'

const thorchainQueryMainnet = new ThorchainQuery()
const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', thorchainQueryMainnet)
const mainetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)

// mainnet asset
const BUSD = assetFromStringEx('BNB.BUSD-BD1')

function printliquidityPosition(liquidityPosition: LiquidityPosition) {
  const expanded = {
    assetPool: liquidityPosition.position.asset,
    assetAmount: liquidityPosition.position.asset_deposit_value,
    runeAmount: liquidityPosition.position.rune_deposit_value,
    impermanentLossProtection: {
      ILProtection: liquidityPosition.impermanentLossProtection.ILProtection.formatedAssetString(),
      totalDays: liquidityPosition.impermanentLossProtection.totalDays,
    },
  }
  console.log(expanded)
}

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-amm liquidity action end to end Tests', () => {
  // Check liquidity position
  it(`Should check liquidity position`, async () => {
    const busdAddress = mainnetWallet.clients[AssetRuneNative.chain].getAddress()
    const lpPositon = await thorchainQueryMainnet.checkLiquidityPosition(BUSD, busdAddress)
    printliquidityPosition(lpPositon)
  })
  // Add liquidity positions
  it(`Should add BUSD liquidity asymmetrically to BUSD pool `, async () => {
    const hash = await mainetThorchainAmm.addLiquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(2)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add ETH liquidity asymmetrically to ETH pool `, async () => {
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(1.5, ETH_DECIMAL)), AssetETH),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await mainetThorchainAmm.addLiquidityPosition(mainnetWallet, addLPparams)

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add BTC liquidity asymmetrically to BTC pool `, async () => {
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.009)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await mainetThorchainAmm.addLiquidityPosition(mainnetWallet, addLPparams)

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add RUNE liquidity asymmetrically to BUSD pool `, async () => {
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(1.19997)), AssetRuneNative),
    }
    const hash = await mainetThorchainAmm.addLiquidityPosition(mainnetWallet, addLPparams)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add BUSD & RUNE liquidity symmetrically to BUSD pool`, async () => {
    const poolRatio = await thorchainQueryMainnet.getPoolRatios(BUSD)
    // get ratios for pool and retrieve rune amount
    const busdtAmount = poolRatio.assetToRune.times(3)
    const runeAmount = poolRatio.runeToAsset.times(busdtAmount)
    const hash = await mainetThorchainAmm.addLiquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(busdtAmount)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(runeAmount)), AssetRuneNative),
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  // Remove Liquidity Positions
  it(`Should remove BUSD only liquidity asymmetrically from the BUSD pool `, async () => {
    const percentage = 100 // gets converted to basis points later
    const removeLp: WithdrawLiquidityPosition = {
      percentage: percentage,
      asset: BUSD,
      assetAddress: mainnetWallet.clients[AssetBNB.chain].getAddress(),
    }
    const hash = await mainetThorchainAmm.withdrawLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove Rune liquidity asymetrically from the BUSD pool`, async () => {
    const percentage = 100 // gets converted to basis points later
    const removeLp: WithdrawLiquidityPosition = {
      percentage: percentage,
      asset: BUSD,
      runeAddress: mainnetWallet.clients[AssetRuneNative.chain].getAddress(),
    }
    const hash = await mainetThorchainAmm.withdrawLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove BUSDT & RUNE symmetrically from symmetrical lp`, async () => {
    const percentage = 100 // gets converted to basis points later
    const removeLp: WithdrawLiquidityPosition = {
      percentage: percentage,
      asset: BUSD,
      assetAddress: mainnetWallet.clients[BUSD.chain].getAddress(),
      runeAddress: mainnetWallet.clients[AssetRuneNative.chain].getAddress(),
    }
    const hash = await mainetThorchainAmm.withdrawLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove ETH liquidity asymetrically from the ETH pool`, async () => {
    const percentage = 100 // gets converted to basis points later
    const removeLp: WithdrawLiquidityPosition = {
      percentage: percentage,
      asset: AssetETH,
      assetAddress: mainnetWallet.clients[AssetETH.chain].getAddress(),
    }
    const hash = await mainetThorchainAmm.withdrawLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should remove BTC liquidity asymetrically from the BTC pool`, async () => {
    const percentage = 100 // gets converted to basis points later
    const removeLp: WithdrawLiquidityPosition = {
      percentage: percentage,
      asset: AssetBTC,
      assetAddress: mainnetWallet.clients[AssetBTC.chain].getAddress(),
    }
    const hash = await mainetThorchainAmm.withdrawLiquidityPosition(mainnetWallet, removeLp)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
})
