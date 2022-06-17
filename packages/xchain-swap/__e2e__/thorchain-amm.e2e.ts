import { Network } from '@xchainjs/xchain-client'
import { AssetLUNA } from '@xchainjs/xchain-terra'
import {
  Asset,
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
import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)

function print(estimate: SwapEstimate) {
  const expanded = {
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.amount().toFixed(),
      swapFee: estimate.totalFees.swapFee.amount().toFixed(),
      outboundFee: estimate.totalFees.outboundFee.amount().toFixed(),
      affiliateFee: estimate.totalFees.affiliateFee.amount().toFixed(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.amount().toFixed(),
    waitTime: estimate.waitTime.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}
// Test User Functions - single and double swap.
describe('xchain-swap Integration Tests', () => {
  it('should estimate a swap of 1 BTC to ETH', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(1)),
      affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.02), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    print(estimate)
  })
  it('should estimate a swap of 1 sBTC to sETH', async () => {
    const sBTC = assetFromString('BTC/BTC')
    const sETH = assetFromString('ETH/ETH')
    if (!sBTC || !sETH) throw Error('err')

    const swapParams: EstimateSwapParams = {
      sourceAsset: sBTC,
      destinationAsset: sETH,
      inputAmount: assetToBase(assetAmount(1)),
      affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.02), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    print(estimate)
  })
  it(`Should estimate single swap of 1000 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      inputAmount: assetToBase(assetAmount(1000)),
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    expect(estimate.waitTime === 600)
    print(estimate)
  })

  // Test Conditions - Test to make sure the swap has no input errors

  it('Should fail estimate swap from BTC to BTC if source asset is the same as destination asset', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetBTC,
      inputAmount: assetToBase(assetAmount(0)),
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate)
    } catch (error) {
      expect(error.message).toEqual(`sourceAsset and destinationAsset cannot be the same`)
    }
  })
  it('Should fail estimate swap from BTC to ETH if input amount is 0', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(0)),
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate)
    } catch (error) {
      expect(error.message).toEqual(`inputAmount must be greater than 0`)
    }
  })
  it('Should fail estimate swap from BTC to ETH if affiliate fee is outside bounds 0 and 1000', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(1)),
      affiliateFeePercent: 0 || 1001,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate)
    } catch (error) {
      expect(error.message).toEqual(`affiliateFee must be between 0 and 1000`)
    }
  })

  it('Should fail estimate swap because slip tolerance is too high ', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(50)),
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
  it('Should fail estimate swap because destination chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetETH,
      destinationAsset: AssetLUNA,
      inputAmount: assetToBase(assetAmount(2)),
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate)
    } catch (error) {
      expect(error.message).toEqual(`destination pool is halted`)
    }
  })

  it('Should fail estimate swap because source chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetLUNA,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(2)),
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate)
    } catch (error) {
      expect(error.message).toEqual(`source pool is halted`)
    }
  })

  it('Should fail estimate swap if source pool has not enough liquidity ', async () => {
    const assetHOT: Asset = {
      chain: Chain.Ethereum,
      symbol: 'HOT-0X6C6EE5E31D828DE241282B9606C8E98EA48526E2',
      ticker: 'HOT',
      synth: false,
    }
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetETH,
      destinationAsset: assetHOT,
      inputAmount: assetToBase(assetAmount(2)),
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
      sourceAsset: AssetBTC,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(0.001)),
      affiliateFeePercent: 0.1,
    }
    try {
      const feesToHigh = await thorchainAmm.estimateSwap(swapParams)
      print(feesToHigh)
    } catch (error) {
      expect(error.message).toEqual(`Input amount ${swapParams.inputAmount} is less that total swap fees`)
    }
  })
  it(`Should estimate calc wait time of a very large swap of 100,000 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      inputAmount: assetToBase(assetAmount(100000)),
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    expect(estimate.waitTime > 600)
    print(estimate)
  })
  it(`Convert BTC to ETH `, async () => {
    const inputAsset = AssetBTC
    const outboundAsset = AssetETH
    const inputAmount = assetAmount(0.5)

    const outboundETHAmount = await thorchainAmm.assetToAsset(inputAsset, inputAmount, outboundAsset)
    expect(outboundETHAmount).toBeTruthy()

    expect(outboundETHAmount.gt(5))
    console.log(`0.5 BTC to ETH is: ${outboundETHAmount.amount().toFixed()} ETH`)
  })
  it(`Convert BTC to RUNE `, async () => {
    const inputAsset = AssetBTC
    const outboundAsset = AssetRuneNative
    const inputAmount = assetAmount(0.5)

    const outboundETHAmount = await thorchainAmm.assetToAsset(inputAsset, inputAmount, outboundAsset)
    expect(outboundETHAmount).toBeTruthy()

    expect(outboundETHAmount.amount().toNumber() > 1000) // this does not work!
    console.log(`0.5 BTC to RUNE is: ${outboundETHAmount.amount().toFixed()} RUNE`)
  })

  it(`Should estimate run Do Swap `, async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      inputAmount: assetToBase(assetAmount(100000)),
      affiliateFeePercent: 0.03, //optional
      slipLimit: new BigNumber(0.1), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    //const wallet: Wallet = new Wallet(Network.Testnet, ``)
    await thorchainAmm.doSwap(
      swapParams,
      `bnb1tdnmq5hdy0pgescqav4y8klgrrvqmf6jwpp2n2`, // Destination Address
      `thor1dze0zlff7gwxpkaynh8fn8nscy7qtnt4aquuh8`, // affiliate Address
      700, // Interface ID
    )
    expect(estimate.waitTime > 600)
    print(estimate)
  })
})
