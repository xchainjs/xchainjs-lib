require('dotenv').config()
import { Network } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  Chain,
  assetAmount,
  assetFromString,
  assetToBase,
} from '@xchainjs/xchain-util'
import { fail } from 'assert'
import BigNumber from 'bignumber.js'

import { Wallet } from '../src/Wallet'
import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainAMM } from '../src/thorchain-amm'
import { SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

const testnetMidgard = new Midgard(Network.Testnet)
const mainnetMidgard = new Midgard(Network.Mainnet)
const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)
const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const testnetWallet = new Wallet(Network.Testnet, process.env.TESTNETPHRASE || 'you forgot to set the phrase')
const mainnetWallet = new Wallet(Network.Mainnet, process.env.MAINNETPHRASE || 'you forgot to set the phrase')

const sBTC = assetFromString('BTC/BTC')
console.log('sBTC?.chain=' + sBTC?.chain)
if (!sBTC) throw Error('Synthetic asset is incorrect')

const sETH = assetFromString('ETH/ETH')
if (!sETH) throw Error('Synthentic asset is incorrect')

const sBNB = assetFromString('BNB/BNB')
if (!sBNB) throw Error('Synthetic asset is inccorect')

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

// const ETH_DECIMAL = 18
const USDT_DECIMAL = 6

const USDT: Asset = {
  chain: Chain.Ethereum,
  symbol: 'USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306',
  ticker: 'USDT',
  synth: false,
}
const XRUNE: Asset = {
  chain: Chain.Ethereum,
  symbol: 'XRUNE-0X8626DB1A4F9F3E1002EEB9A4F3C6D391436FFC23',
  ticker: 'XRUNE',
  synth: false,
}

function print(estimate: SwapEstimate) {
  const expanded = {
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTime: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}

describe('xchain-swap doSwap Integration Tests', () => {
  // From BTC to RUNE with no Affiliate address - passes
  it(`Should swap BTC to RUNE, with no affiliate address `, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.0001)), AssetBTC),
      destinationAsset: AssetRuneNative,
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['THOR'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From BTC to Rune but fail on destination address - passes
  it(`Should fail to swap BTC to RUNE, if dest address is not for the correct chain  `, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.0001)), AssetBTC),
      destinationAsset: AssetRuneNative,
    }
    try {
      const output = await testnetThorchainAmm.doSwap(
        testnetWallet,
        estimateSwapParams,
        await testnetWallet.clients['BNB'].getAddress(), // put the wrong chain address here to trigger error
      )
      console.log(output.hash)
      fail()
    } catch (error: any) {
      expect(error.message).toEqual(`tbnb1kmu0n6s44cz5jxdvkvsvrzgr57ndg6atw5zrys is not a valid address`)
    }
  })
  // Sawp From Rune to ETH - passes
  it(`Should swap from RUNE to ETH`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative),
      destinationAsset: AssetETH,
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['ETH'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  // Swap From BNB to ETH - ?
  it(`Should perform a double swap from BNB to ETH`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.0001)), AssetBNB),
      destinationAsset: AssetETH,
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['ETH'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From asset BUSD to synth sBTC -- passes
  it(`Should perform a swap from BUSD to synthBTC`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(4)), BUSD),
      destinationAsset: sBTC,
      slipLimit: new BigNumber(0.03),
    }
    try {
      const outPutCanSwap = await mainetThorchainAmm.estimateSwap(estimateSwapParams)
      print(outPutCanSwap)
      if (outPutCanSwap.canSwap) {
        const output = await mainetThorchainAmm.doSwap(
          mainnetWallet,
          estimateSwapParams,
          mainnetWallet.clients[Chain.THORChain].getAddress(),
        )
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
        expect(output).toBeTruthy()
      }
    } catch (error: any) {
      console.log(error.message)
    }
  })

  // From synth sBTC to Asset BUSD -- Passes
  it(`Should perform a swap from sBTC to BUSD`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.00009)), sBTC),
      destinationAsset: BUSD,
      slipLimit: new BigNumber(0.09),
    }
    try {
      const output = await mainetThorchainAmm.doSwap(
        mainnetWallet,
        estimateSwapParams,
        mainnetWallet.clients['BNB'].getAddress(),
      )
      console.log(`tx hash: ${output.hash}, \n Tx url: ${output.url} \n WaitTime:${output.waitTimeSeconds}`)
      expect(output).toBeTruthy()
    } catch (error: any) {
      console.log(error.message)
    }
  })

  // From synth sBTC to sETH - passes
  it(`Should perform a swap from synthBTC to synthETH`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.0009)), sBTC),
      destinationAsset: sETH,
      slipLimit: new BigNumber(0.5),
    }
    try {
      const outPutCanSwap = await mainetThorchainAmm.estimateSwap(estimateSwapParams)
      console.log(JSON.stringify(outPutCanSwap))
      if (outPutCanSwap.canSwap) {
        const output = await mainetThorchainAmm.doSwap(
          mainnetWallet,
          estimateSwapParams,
          mainnetWallet.clients['THOR'].getAddress(),
        )
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
        expect(output).toBeTruthy()
      }
    } catch (error: any) {
      console.log(error.message)
    }
  })

  // From synth sETH to sBTC - passes
  it(`Should perform a swap from synthBTC to synthETH`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.0009)), sBTC),
      destinationAsset: sETH,
      slipLimit: new BigNumber(0.5),
    }
    try {
      const outPutCanSwap = await mainetThorchainAmm.estimateSwap(estimateSwapParams)
      console.log(JSON.stringify(outPutCanSwap))
      if (outPutCanSwap.canSwap) {
        const output = await mainetThorchainAmm.doSwap(
          mainnetWallet,
          estimateSwapParams,
          mainnetWallet.clients['THOR'].getAddress(),
        )
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
        expect(output).toBeTruthy()
      }
    } catch (error: any) {
      console.log(error.message)
    }
  })



  // From ETH to Asset -- passes
  it(`Should perform a double swap from ETH to BNB`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.1)), AssetETH),
      destinationAsset: AssetBNB,
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['BNB'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From Rune to ERC -- Passes
  it(`Should perform a single swap from Rune to ERC`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(10)), AssetRuneNative),
      destinationAsset: USDT,
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['ETH'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From ERC to Rune - passes
  it(`Should perform a single swap from ERC to Rune`, async () => {
    try {
      const estimateSwapParams = {
        input: new CryptoAmount(assetToBase(assetAmount(0.005, USDT_DECIMAL)), USDT),
        destinationAsset: AssetRuneNative,
        slipLimit: new BigNumber(0.5),
      }
      const approved = await testnetWallet.isTCRouterApprovedToSpend(
        estimateSwapParams.input.asset,
        estimateSwapParams.input.baseAmount,
      )
      if (!approved) {
        const result = await testnetWallet.approveTCRouterToSpend(estimateSwapParams.input.asset)
        expect(result.hash).toBeTruthy()
        console.log(JSON.stringify(result, null, 2))
      } else {
        const output = await testnetThorchainAmm.doSwap(
          testnetWallet,
          estimateSwapParams,
          testnetWallet.clients['THOR'].getAddress(),
        )
        console.log(output)
        expect(output.hash).toBeTruthy()
      }
    } catch (error) {
      console.error(error)
    }
  })
  // From ERC to ERC -- passes
  it(`Should perform a double swap from ERC to ERC`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.005, USDT_DECIMAL)), USDT),
      destinationAsset: XRUNE,
      slipLimit: new BigNumber(0.5),
    }
    const approved = await testnetWallet.isTCRouterApprovedToSpend(
      estimateSwapParams.input.asset,
      estimateSwapParams.input.baseAmount,
    )
    if (!approved) {
      const result = await testnetWallet.approveTCRouterToSpend(estimateSwapParams.input.asset)
      console.log(JSON.stringify(result, null, 2))
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['ETH'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
})
