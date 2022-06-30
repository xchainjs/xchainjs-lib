import { Network } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  Chain,
  assetAmount,
  assetFromString,
  assetToBase,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { LiquidityPool } from '../src/LiquidityPool'
import { ThorchainAMM } from '../src/ThorchainAMM'
import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

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

const bnbPoolDetails = {
  asset: 'BNB.BNB',
  assetDepth: assetToBase(assetAmount(100)).amount().toFixed(),
  assetPrice: '11121.24920535084',
  assetPriceUSD: '30458.124870650492',
  liquidityUnits: '536087715332333',
  poolAPY: '0.1001447237777584',
  runeDepth: assetToBase(assetAmount(2500000)).amount().toFixed(),
  status: 'available',
  synthSupply: '3304301605',
  synthUnits: '10309541238596',
  units: '546397256570929',
  volume24h: '16202006480711',
}

const bnbPool = new LiquidityPool(bnbPoolDetails)
// Test User Functions - single and double swap using mock pool data
describe('xchain-swap Integration Tests', () => {
  beforeEach(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })
  // Test estimate swaps with mock pool data
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
  })

  it(`Should return the correct network value`, async () => {
    const constant = 'TXOUTDELAYRATE'
    const value = await midgard.getNetworkValueByName(constant)
    console.log(value)
    expect(value).toEqual(10000000000)
  })

  // Test functions with mock data
  it('Should fail estimate swap because destination chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      sourceAsset: AssetETH,
      destinationAsset: AssetLTC,
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
      sourceAsset: AssetLTC,
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

  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = assetToBase(assetAmount(1))
    const outBoundValue = await thorchainAmm.outboundDelay(bnbPool, AssetBNB, outboundAmount)
    console.log(outBoundValue)
    expect(outBoundValue).toEqual(1500)
  })
  it(`Should convert BTC to ETH `, async () => {
    const inputAsset: Asset = AssetBTC
    const outboundAsset: Asset = AssetETH
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundETHAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    console.log(
      `${inputAmount.amount()} ${inputAsset.chain} to ${
        outboundAsset.chain
      } is: ${outboundETHAmount.amount().toFixed()} ${outboundAsset.chain}`,
    )
    expect(outboundETHAmount.amount()).toBeTruthy()
  })

  it(`Should convert BTC to RUNE `, async () => {
    const inputAsset = AssetBTC
    const outboundAsset = AssetRuneNative
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundRuneAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    expect(outboundRuneAmount.amount().toNumber() > 1000)
  })
})
