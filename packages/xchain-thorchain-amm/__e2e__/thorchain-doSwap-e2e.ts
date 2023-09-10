import { AVAXChain, AssetAVAX } from '@xchainjs/xchain-avax'
import { AssetBNB } from '@xchainjs/xchain-binance'
import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetATOM } from '@xchainjs/xchain-cosmos'
import { AssetETH, ETHChain } from '@xchainjs/xchain-ethereum'
import { AssetLTC } from '@xchainjs/xchain-litecoin'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { AssetRuneNative, THORChain } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, ThorchainCache, ThorchainQuery, Thornode, TxDetails } from '@xchainjs/xchain-thorchain-query'
import { Asset, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'
import { fail } from 'assert'
import BigNumber from 'bignumber.js'

import { ThorchainAMM } from '../src/thorchain-amm'
import { EvmHelper } from '../src/utils/evm-helper'
import { Wallet } from '../src/wallet'

require('dotenv').config()

const thorchainCacheMainnet = new ThorchainCache(new Thornode(Network.Mainnet))
const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)

const thorchainCacheStagenet = new ThorchainCache(new Thornode(Network.Stagenet))
const thorchainQueryStagenet = new ThorchainQuery(thorchainCacheStagenet)

const midgardCacheMainnet = new MidgardCache(new Midgard(Network.Mainnet))
const midgardQueryMainnet = new MidgardQuery(midgardCacheMainnet)

const midgardCacheStagenet = new MidgardCache(new Midgard(Network.Stagenet))
const midgardQueryStagenet = new MidgardQuery(midgardCacheStagenet)

const mainnetWallet = new Wallet(
  process.env.MAINNETPHRASE || 'you forgot to set the phrase',
  thorchainQueryMainnet,
  midgardQueryMainnet,
)
const stagenetWallet = new Wallet(
  process.env.MAINNETPHRASE || 'you forgot to set the phrase',
  thorchainQueryStagenet,
  midgardQueryStagenet,
)

const mainnetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)
const stagenetThorchainAmm = new ThorchainAMM(thorchainQueryStagenet)

const sBTC = assetFromStringEx('BTC/BTC')
const sETH = assetFromStringEx('ETH/ETH')
// const sBNB = assetFromStringEx('BNB/BNB')
const sATOM = assetFromStringEx('GAIA/ATOM')
const BUSD = assetFromStringEx('BNB.BUSD-BD1')

// const ETH_DECIMAL = 18
const USDT_DECIMAL = 6

const USDT: Asset = {
  chain: ETHChain,
  symbol: 'USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306',
  ticker: 'USDT',
  synth: false,
}
const XRUNE: Asset = {
  chain: ETHChain,
  symbol: 'XRUNE-0X8626DB1A4F9F3E1002EEB9A4F3C6D391436FFC23',
  ticker: 'XRUNE',
  synth: false,
}

function print(estimate: TxDetails) {
  const expanded = {
    totalFees: {
      outboundFee: estimate.txEstimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.txEstimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipBasisPoints: estimate.txEstimate.slipBasisPoints.toFixed(),
    netOutput: estimate.txEstimate.netOutput.formatedAssetString(),
    waitTime: estimate.txEstimate.outboundDelaySeconds.toFixed(),
    canSwap: estimate.txEstimate.canSwap,
    errors: estimate.txEstimate.errors,
  }
  console.log(expanded)
}

describe('xchain-swap doSwap Integration Tests', () => {
  // From BTC to RUNE with no Affiliate address - passes
  it(`Should swap BTC to RUNE, with no affiliate address `, async () => {
    const estimateSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.0005')), AssetBTC),
      destinationAsset: AssetRuneNative,
      destinationAddress: mainnetWallet.clients['THOR'].getAddress(),
      // affiliateFeePercent: 0.1,
      wallet: mainnetWallet,
      walletIndex: 0,
    }

    const outPutCanSwap = await mainnetThorchainAmm.estimateSwap(estimateSwapParams)
    print(outPutCanSwap)
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    //console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From BTC to Rune but fail on destination address - passes
  it(`Should fail to swap BTC to RUNE, if dest address is not for the correct chain  `, async () => {
    const estimateSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.0001')), AssetBTC),
      destinationAsset: AssetRuneNative,
      destinationAddress: mainnetWallet.clients['BNB'].getAddress(), // Wrong chain to trigger error
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    try {
      const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
      console.log(output.hash)
      fail()
    } catch (error: any) {
      expect(error.message).toEqual(
        `destinationAddress bnb150vpa06jrgucqz9ycgun73t0n0rrxq4m69fc22 is not a valid address`,
      )
    }
  })
  // Sawp From Rune to ETH - passes
  it(`Should swap from RUNE to ETH`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetRuneNative,
      amount: new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative),
      destinationAsset: AssetETH,
      destinationAddress: mainnetWallet.clients['ETH'].getAddress(),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  // Swap From BNB to ETH - ?
  it(`Should perform a double swap from BNB to ETH`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetBNB,
      amount: new CryptoAmount(assetToBase(assetAmount('0.002')), AssetBNB),
      destinationAsset: AssetETH,
      destinationAddress: mainnetWallet.clients['ETH'].getAddress(),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From asset BUSD to synth sBTC -- passes
  it(`Should perform a swap from BUSD to synthBTC`, async () => {
    const estimateSwapParams = {
      fromAsset: BUSD,
      amount: new CryptoAmount(assetToBase(assetAmount('4')), BUSD),
      destinationAsset: sBTC,
      destinationAddress: mainnetWallet.clients[THORChain].getAddress(),
      slipLimit: new BigNumber(0.03),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    try {
      const outPutCanSwap = await thorchainQueryMainnet.quoteSwap(estimateSwapParams)
      print(outPutCanSwap)
      if (outPutCanSwap.txEstimate.canSwap) {
        const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}`)
        expect(output).toBeTruthy()
      }
    } catch (error) {
      console.error(error)
    }
  })

  // From synth sBTC to Asset BUSD -- Passes
  it(`Should perform a swap from sBTC to BUSD`, async () => {
    const estimateSwapParams = {
      fromAsset: sBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.00009')), sBTC),
      destinationAsset: BUSD,
      destinationAddress: mainnetWallet.clients['BNB'].getAddress(),
      slipLimit: new BigNumber(0.09),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    try {
      const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
      console.log(`tx hash: ${output.hash}, \n Tx url: ${output.url}`)
      expect(output).toBeTruthy()
    } catch (error) {
      console.error(error)
    }
  })

  // From synth sBTC to sETH - passes
  it(`Should perform a swap from synthBTC to synthETH`, async () => {
    const estimateSwapParams = {
      fromAsset: sBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.0009')), sBTC),
      destinationAsset: sETH,
      destinationAddress: mainnetWallet.clients['THOR'].getAddress(),
      slipLimit: new BigNumber(0.5),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    try {
      const outPutCanSwap = await thorchainQueryMainnet.quoteSwap(estimateSwapParams)
      console.log(JSON.stringify(outPutCanSwap))
      if (outPutCanSwap.txEstimate.canSwap) {
        const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}`)
        expect(output).toBeTruthy()
      }
    } catch (error) {
      console.error(error)
    }
  })

  // From synth sETH to sBTC - passes
  it(`Should perform a swap from synthBTC to synthETH`, async () => {
    const estimateSwapParams = {
      fromAsset: sBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.0009')), sBTC),
      destinationAsset: sETH,
      destinationAddress: mainnetWallet.clients['THOR'].getAddress(),
      slipLimit: new BigNumber(0.5),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    try {
      const outPutCanSwap = await thorchainQueryMainnet.quoteSwap(estimateSwapParams)
      console.log(JSON.stringify(outPutCanSwap))
      if (outPutCanSwap.txEstimate.canSwap) {
        const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}`)
        expect(output).toBeTruthy()
      }
    } catch (error) {
      console.error(error)
    }
  })

  // From ETH to Asset -- passes
  it(`Should perform a double swap from ETH to BNB`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('0.1', 18)), AssetETH),
      destinationAsset: AssetBNB,
      destinationAddress: mainnetWallet.clients['BNB'].getAddress(),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From Rune to ERC -- Passes
  it(`Should perform a single swap from Rune to ERC`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetRuneNative,
      amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetRuneNative),
      destinationAsset: USDT,
      destinationAddress: mainnetWallet.clients['ETH'].getAddress(),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From ERC to Rune - passes
  it(`Should perform a single swap from ERC to Rune`, async () => {
    try {
      const estimateSwapParams = {
        fromAsset: USDT,
        amount: new CryptoAmount(assetToBase(assetAmount('0.005', USDT_DECIMAL)), USDT),
        destinationAsset: AssetRuneNative,
        destinationAddress: mainnetWallet.clients['THOR'].getAddress(),
        slipLimit: new BigNumber('0.5'),
        wallet: mainnetWallet,
        walletIndex: 0,
      }
      const ethHelper = new EvmHelper(mainnetWallet.clients.ETH, thorchainQueryMainnet.thorchainCache)
      const approved = await ethHelper.isTCRouterApprovedToSpend(
        estimateSwapParams.amount.asset,
        estimateSwapParams.amount.baseAmount,
      )
      if (!approved) {
        const result = await ethHelper.approveTCRouterToSpend(estimateSwapParams.amount.asset)
        expect(result.hash).toBeTruthy()
        console.log(JSON.stringify(result, null, 2))
      } else {
        const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
        console.log(output)
        expect(output.hash).toBeTruthy()
      }
    } catch (error) {
      console.error(error)
    }
  })

  // From ERC to Rune - passes
  it(`Should check validity of swap from ERC to Rune`, async () => {
    try {
      const estimateSwapParams = {
        fromAsset: USDT,
        amount: new CryptoAmount(assetToBase(assetAmount('0.005', USDT_DECIMAL)), USDT),
        destinationAsset: AssetRuneNative,
        destinationAddress: mainnetWallet.clients['THOR'].getAddress(),
        slipLimit: new BigNumber('0.5'),
        wallet: mainnetWallet,
        walletIndex: 0,
      }
      const isValidSwap = await mainnetThorchainAmm.estimateSwap(estimateSwapParams)
      console.log(isValidSwap)
    } catch (error) {
      console.error(error)
    }
  })
  // From ERC to ERC -- passes
  it(`Should perform a double swap from ERC to ERC`, async () => {
    const estimateSwapParams = {
      fromAsset: USDT,
      amount: new CryptoAmount(assetToBase(assetAmount('0.005', USDT_DECIMAL)), USDT),
      destinationAddress: mainnetWallet.clients['ETH'].getAddress(),
      destinationAsset: XRUNE,
      slipLimit: new BigNumber('0.5'),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const ethHelper = new EvmHelper(mainnetWallet.clients.ETH, thorchainQueryMainnet.thorchainCache)
    const approved = await ethHelper.isTCRouterApprovedToSpend(
      estimateSwapParams.amount.asset,
      estimateSwapParams.amount.baseAmount,
    )
    if (!approved) {
      const result = await ethHelper.approveTCRouterToSpend(estimateSwapParams.amount.asset)
      console.log(JSON.stringify(result, null, 2))
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  it(`Should perform a swap from LTC to AVAX`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetLTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.01')), AssetLTC),
      destinationAddress: stagenetWallet.clients[AVAXChain].getAddress(),
      destinationAsset: AssetAVAX,
      slipLimit: new BigNumber('0.5'),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await stagenetThorchainAmm.doSwap(stagenetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  it(`Should perform a swap from LTC to RUNE`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.01')), AssetLTC),
      destinationAddress: mainnetWallet.clients['THOR'].getAddress(),
      destinationAsset: AssetRuneNative,
      slipLimit: new BigNumber('0.5'),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  it(`Should perform a swap from ATOM to synth ATOM`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetATOM,
      amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetATOM),
      destinationAddress: mainnetWallet.clients[THORChain].getAddress(),
      destinationAsset: sATOM,
      slipLimit: new BigNumber('0.05'),
      wallet: mainnetWallet,
      walletIndex: 0,
    }
    const output = await mainnetThorchainAmm.doSwap(mainnetWallet, estimateSwapParams)
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  it(`Should perform a swap from AVAX to RUNE`, async () => {
    const estimateSwapParams = {
      fromAsset: AssetAVAX,
      amount: new CryptoAmount(assetToBase(assetAmount('0.5', 18)), AssetAVAX),
      destinationAsset: AssetRuneNative,
      destinationAddress: stagenetWallet.clients[THORChain].getAddress(),
      slipLimit: new BigNumber('0.2'),
    }
    try {
      const outPutCanSwap = await thorchainQueryStagenet.quoteSwap(estimateSwapParams)
      print(outPutCanSwap)
      const feesinAvax = await thorchainQueryStagenet.getFeesIn(outPutCanSwap.txEstimate.totalFees, AssetAVAX)
      outPutCanSwap.txEstimate.totalFees = feesinAvax
      print(outPutCanSwap)

      // if (outPutCanSwap.canSwap) {
      //   const output = await stagenetThorchainAmm.doSwap(
      //     stagenetWallet,
      //     estimateSwapParams,
      //     stagenetWallet.clients[THORChain].getAddress(),
      //   )
      //   console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
      //   expect(output).toBeTruthy()
      // }
    } catch (error) {
      console.error(error)
    }
  })
})
