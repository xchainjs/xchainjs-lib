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

const mainnetMidgard = new Midgard(Network.Mainnet)
const testnetMidgard = new Midgard(Network.Testnet)
const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)
const testnetWallet = new Wallet(Network.Testnet, process.env.TESTNETPHRASE || 'you forgot to set the phrase')
const mainnetWallet = new Wallet(Network.Mainnet, process.env.MAINNETPHRASE || 'you forgot to set the phrase')

const sBTC = assetFromString('BTC/BTC')
console.log('sBTC?.chain=' + sBTC?.chain)
if (!sBTC) throw Error('xxxx')
const sETH: Asset = {
  chain: Chain.Ethereum,
  symbol: 'ETH',
  ticker: 'ETH',
  synth: true,
}
sETH
const sBNB: Asset = {
  chain: Chain.Binance,
  symbol: 'BNB',
  ticker: 'BNB',
  synth: true,
}
sBNB
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
const BUSD: Asset = {
  chain: Chain.Binance,
  symbol: 'BNB.BUSD-BD1',
  ticker: 'BUSD',
  synth: false,
}
BUSD
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
  it(`Should swap BTC to RUNE, with no affiliate address  `, async () => {
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

  // From asset to synth sBTC
  it(`Should perform a swap from BTC to synthETH`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.001)), AssetBTC),
      destinationAsset: sETH,
      slipLimit: new BigNumber(0.03),
    }
    try {
      const outPutCanSwap = await testnetThorchainAmm.estimateSwap(estimateSwapParams)
      print(outPutCanSwap)
      if (outPutCanSwap.canSwap) {
        const output = await testnetThorchainAmm.doSwap(
          testnetWallet,
          estimateSwapParams,
          testnetWallet.clients[Chain.THORChain].getAddress(),
        )
        console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
        expect(output).toBeTruthy()
      }
    } catch (error: any) {
      console.log(error.message)
    }
  })

  // From synth sBTC to Asset
  it(`Should perform a swap from sETH to BNB`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.05)), sETH),
      destinationAsset: AssetBNB,
      slipLimit: new BigNumber(0.09),
    }
    try {
      const output = await testnetThorchainAmm.doSwap(
        testnetWallet,
        estimateSwapParams,
        testnetWallet.clients['BNB'].getAddress(),
      )
      console.log(`tx hash: ${output.hash}, \n Tx url: ${output.url} \n WaitTime:${output.waitTimeSeconds}`)
      expect(output).toBeTruthy()
    } catch (error: any) {
      console.log(error.message)
    }
  })

  // From synth sBTC to synth sBNB
  it(`Should perform a swap from synthBTC to synthBNB`, async () => {
    const estimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.0002)), sBTC),
      destinationAsset: sBNB,
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
      //why is the hash missing?
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
