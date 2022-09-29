import { Network } from '@xchainjs/xchain-client'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import {
  AddliquidityPosition,
  CryptoAmount,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { AssetBTC, AssetETH, AssetRuneNative, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'
import { ThorchainAMM } from '../src/thorchain-amm'

// const thorchainCacheMainnet = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
// const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

const thorchainCacheTestnet = new ThorchainCache(new Midgard(Network.Testnet), new Thornode(Network.Testnet))
const thorchainQueryTestnet = new ThorchainQuery(thorchainCacheTestnet)

// const thorchainCacheStagenet = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
// const thorchainQueryStagenet = new ThorchainQuery(thorchainCacheStagenet)

const testnetWallet = new Wallet(process.env.TESTNETPHRASE || 'you forgot to set the phrase', thorchainQueryTestnet)
// const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', thorchainQueryMainnet)
// const stagenetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', thorchainQueryStagenet)

const testnetThorchainAmm = new ThorchainAMM(thorchainQueryTestnet)
// const mainetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)
// const stagenetThorchainAmm = new ThorchainAMM(thorchainQueryStagenet)

// mainnet asset
// const BUSD = assetFromStringEx('BNB.BUSD-BD1')

// Testnet asset

const BUSDT = assetFromStringEx('BNB.BUSD-74E')

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-amm liquidity action end to end Tests', () => {
  // Add liquidity positions
  it(`Should add BUSD liquidity asymmetrically to BUSD pool `, async () => {
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), BUSDT),
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
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, addLPparams)

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add BTC liquidity asymmetrically to BTC pool `, async () => {
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0.009)), AssetBTC),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, addLPparams)

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add RUNE liquidity asymmetrically to BUSD pool `, async () => {
    const addLPparams: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(1.19997)), AssetRuneNative),
    }
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, addLPparams)
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add BUSD & RUNE liquidity symmetrically to BUSD pool`, async () => {
    const poolRatio = await thorchainQueryTestnet.getPoolRatios(BUSDT)
    // get ratios for pool and retrieve rune amount
    const busdtAmount = poolRatio.assetToRune.times(1.2)
    const runeAmount = poolRatio.runeToAsset.times(busdtAmount)
    const hash = await testnetThorchainAmm.addLiquidityPosition(testnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(busdtAmount)), BUSDT),
      rune: new CryptoAmount(assetToBase(assetAmount(runeAmount)), AssetRuneNative),
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  //// Remove Liquidity Positions
  // it(`Should remove BUSD only liquidity asymmetrically from the BUSD pool `, async () => {
  //   const LPAction = '-' // remove from lP position
  //   const percentage = 100 // gets converted to basis points later
  //   const removeLp: RemoveLiquidityPosition = {
  //     action: LPAction,
  //     percentage: percentage,
  //     asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
  //     rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
  //   }
  //   const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
  //   console.log(hash)
  //   expect(hash).toBeTruthy()
  // })
  // it(`Should remove Rune liquidity asymetrically from the BUSD pool`, async () => {
  //   const LPAction = '-' // remove from lP position
  //   const percentage = 100 // gets converted to basis points later
  //   const removeLp: RemoveLiquidityPosition = {
  //     action: LPAction,
  //     percentage: percentage,
  //     asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
  //     rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
  //   }
  //   const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
  //   console.log(hash)
  //   expect(hash).toBeTruthy()
  // })
  // it(`Should remove BUSDT & RUNE symmetrically from symmetrical lp`, async () => {
  //   const LPAction = '-' // add to lP position
  //   const percentage = 100 // gets converted to basis points later
  //   const removeLp: RemoveLiquidityPosition = {
  //     action: LPAction,
  //     percentage: percentage,
  //     asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
  //     rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
  //   }
  //   const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
  //   console.log(hash)
  //   expect(hash).toBeTruthy()
  // })
  // it(`Should remove ETH liquidity asymetrically from the ETH pool`, async () => {
  //   const LPAction = '-' // remove from lP position
  //   const percentage = 100 // gets converted to basis points later
  //   const removeLp: RemoveLiquidityPosition = {
  //     action: LPAction,
  //     percentage: percentage,
  //     asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
  //     rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
  //   }
  //   const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
  //   console.log(hash)
  //   expect(hash).toBeTruthy()
  // })
  // it(`Should remove BTC liquidity asymetrically from the BTC pool`, async () => {
  //   const LPAction = '-' // remove from lP position
  //   const percentage = 100 // gets converted to basis points later
  //   const removeLp: RemoveLiquidityPosition = {
  //     action: LPAction,
  //     percentage: percentage,
  //     asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSDT),
  //     rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
  //   }
  //   const hash = await testnetThorchainAmm.removeLiquidityPosition(testnetWallet, removeLp)
  //   console.log(hash)
  //   expect(hash).toBeTruthy()
  // })
})
