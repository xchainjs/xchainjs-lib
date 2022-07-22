import { Network } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetToBase,
} from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainAMM } from '../src/thorchain-amm'
import { EstimateSwapParams, SwapEstimate } from '../src/types'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const midgardts = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgardts)

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

describe('ThorchainAmm Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
  })

  // ThorchainAMM unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB)

    const outBoundValue = await thorchainAmm.outboundDelay(outboundAmount)
    const expectedOutput = 1500
    expect(outBoundValue).toEqual(expectedOutput)
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainAmm.convert(input, outboundAsset)
    const EthAmount = assetToBase(assetAmount('15'))
    expect(outboundETHAmount.baseAmount.amount().toFixed()).toEqual(EthAmount.amount().toFixed())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainAmm.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(10))
    expect(outboundRuneAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainAmm.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(10))
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })
  it('Should fail estimate swap because destination chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(2)), AssetETH),
      destinationAsset: AssetLTC,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate, swapParams.input)
      expect(estimate.canSwap).toEqual(false)
    } catch (error) {
      expect(error.message).toEqual(`destination chain is halted`)
    }
  })

  it('Should fail estimate swap because source chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(2)), AssetLTC),
      destinationAsset: AssetETH,
    }
    try {
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      print(estimate, swapParams.input)
      expect(estimate.canSwap).toEqual(false)
    } catch (error) {
      console.log(error.message)
      expect(error.message).toEqual(`source chain is halted`)
    }
  })
})
