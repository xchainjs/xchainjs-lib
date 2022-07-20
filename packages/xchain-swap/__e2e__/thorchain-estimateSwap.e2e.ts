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
import BigNumber from 'bignumber.js'

import { ThorchainAMM } from '../src/ThorchainAMM'
import { CryptoAmount } from '../src/crypto-amount'
import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)

function print(estimate: SwapEstimate, input: CryptoAmount) {
  const expanded = {
    input: input.formatedAssetString(),
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')

// Test User Functions - single and double swap using mock pool data
describe('xchain-swap estimate Integration Tests', () => {
  // Test estimate swaps with mock pool data
  it('should estimate a swap of 1 BTC to RUNE', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC),
      destinationAsset: BUSD,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }

    const estimate = await thorchainAmm.estimateSwap(swapParams)
    const estimateInBusd = await thorchainAmm.getFeesIn(estimate.totalFees, BUSD)
    estimate.totalFees = estimateInBusd
    print(estimate, swapParams.input)
    const exchangeRate = await thorchainAmm.convert(new CryptoAmount(assetToBase(assetAmount('1')), AssetBNB), BUSD)
    console.log(`1 ${swapParams.input.asset.ticker} = ${exchangeRate.formatedAssetString()}`)
    expect(estimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it('should estimate a swap of 1 BTC to sBTC', async () => {
    const BTC = assetFromString('BTC.BTC')
    const sBTC = assetFromString('BTC/BTC')

    if (!sBTC || !BTC) throw Error('err')

    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: sBTC,
      // affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.03), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)
    expect(estimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it('should estimate a swap of 1 sBTC to sETH', async () => {
    const sBTC = assetFromString('BTC/BTC')
    const sETH = assetFromString('ETH/ETH')
    if (!sBTC || !sETH) throw Error('err')

    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1)), sBTC),
      destinationAsset: sETH,
      affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.02), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate single swap of 1000 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1000)), AssetRuneNative),
      destinationAsset: AssetBTC,
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)
    expect(estimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
    expect(estimate.waitTimeSeconds === 600)
  })
  it(`Should fail estimate single swap of 0.01 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.01)), AssetRuneNative),
      destinationAsset: AssetBTC,
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate.canSwap).toBe(false)
    expect(estimate).toBeTruthy()
    expect(estimate.waitTimeSeconds === 600)
  })
  it(`Should fail estimate single swap of 0.000001 BTC to RUNE `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.000001)), AssetBTC),
      destinationAsset: AssetRuneNative,
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate.canSwap).toBe(false)
    expect(estimate).toBeTruthy()
    expect(estimate.waitTimeSeconds === 600)
  })
  // Test Conditions - Test to make sure the swap has no input errors
  it('Should fail estimate swap from BTC to BTC if source asset is the same as destination asset', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: AssetBTC,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate, swapParams.input)
      fail()
    } catch (error: any) {
      expect(error.message).toEqual(`sourceAsset and destinationAsset cannot be the same`)
    }
  })
  it('Should fail estimate swap from BTC to ETH if input amount is 0', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0)), AssetBTC),
      destinationAsset: AssetETH,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate, swapParams.input)
      fail()
    } catch (error: any) {
      expect(error.message).toEqual(`inputAmount must be greater than 0`)
    }
  })
  it('Should fail estimate swap from BTC to ETH if affiliate fee is outside bounds 0 and 1000', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: AssetETH,
      affiliateFeePercent: 0 || 1001,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate, swapParams.input)
      fail()
    } catch (error: any) {
      expect(error.message).toEqual(`affiliateFee must be between 0 and 1000`)
    }
  })

  it('Should fail estimate swap because slip tolerance is too high ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(50)), AssetBTC),
      destinationAsset: AssetETH,
      affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.02), //optional
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      expect(estimate.errors).toEqual(
        `expected slip: ${estimate.slipPercentage.toFixed()} is greater than your slip limit:${swapParams.slipLimit?.toFixed()} `,
      )
    } catch (error) {}
  })

  it('Should fail estimate swap if source pool has not enough liquidity ', async () => {
    const assetHOT: Asset = {
      chain: Chain.Ethereum,
      symbol: 'HOT-0X6C6EE5E31D828DE241282B9606C8E98EA48526E2',
      ticker: 'HOT',
      synth: false,
    }
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(20)), AssetETH),
      destinationAsset: assetHOT,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      expect(estimate.errors).toEqual([`destinationAsset HOT does not have a valid liquidity pool`])
    } catch (error) {
      throw error
    }
  })

  it('Should calculate total swap fees in rune and throw and error if its greater than input amount', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.001)), AssetBTC),
      destinationAsset: AssetETH,
      affiliateFeePercent: 0.1,
    }
    try {
      const feesToHigh = await thorchainAmm.estimateSwap(swapParams)
      print(feesToHigh, swapParams.input)
      expect(feesToHigh.errors).toEqual([
        `Input amount ${swapParams.input.formatedAssetString()} is less that total swap fees`,
      ])
    } catch (error: any) {}
  })
  it(`Should estimate calc wait time of a very large swap of 100,000 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(100000)), AssetRuneNative),
      destinationAsset: AssetBTC,
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    expect(estimate.waitTimeSeconds > 600)
  })

  it(`Should return the correct network value`, async () => {
    const constant = 'TXOUTDELAYRATE'
    const values = await midgard.getNetworkValueByNames([constant])
    console.log(values)
    expect(Number.parseInt(values[constant])).toEqual(10000000000)
  })

  // it('Should fail estimate swap because destination chain is halted ', async () => {
  //   const swapParams: EstimateSwapParams = {
  //     input: new CryptoAmount(assetToBase(assetAmount(2)), AssetETH),
  //     destinationAsset: AssetLTC,
  //   }
  //   try {
  //     const estimate = await thorchainAmm.estimateSwap(swapParams)
  //     print(estimate, swapParams.input)
  //     fail()
  //   } catch (error: any) {
  //     expect(error.message).toEqual(`destination pool is halted`)
  //   }
  // })

  // it('Should fail estimate swap because source chain is halted ', async () => {
  //   const swapParams: EstimateSwapParams = {
  //     input: new CryptoAmount(assetToBase(assetAmount(2)), AssetLTC),
  //     destinationAsset: AssetETH,
  //   }
  //   try {
  //     const estimate = await thorchainAmm.estimateSwap(swapParams)
  //     print(estimate, swapParams.input)
  //     fail()
  //   } catch (error: any) {
  //     expect(error.message).toEqual(`source pool is halted`)
  //   }
  // })
})
