import { Network } from '@xchainjs/xchain-client'
import {
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
} from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { EstimateSwapParams, TxDetails } from '../src/types'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))

const thorchainQuery = new ThorchainQuery(thorchainCache)

const assetUOS = assetFromString('ETH.UOS-0XD13C7342E1EF687C5AD21B27C2B65D772CAB5C8C')
const assetUSDC = assetFromString('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
const BUSD = assetFromString('BNB.BUSD-BD1')

function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      input: input.formatedAssetString(),
      totalFees: {
        inboundFee: txDetails.txEstimate.totalFees.inboundFee.formatedAssetString(),
        swapFee: txDetails.txEstimate.totalFees.swapFee.formatedAssetString(),
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipPercentage: txDetails.txEstimate.slipPercentage.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      netOutputDecimals: txDetails.txEstimate.netOutput.baseAmount.decimal,
      waitTimeSeconds: txDetails.txEstimate.waitTimeSeconds.toFixed(),
      canSwap: txDetails.txEstimate.canSwap,
      errors: txDetails.txEstimate.errors,
    },
  }
  console.log(expanded)
}

describe('Thorchain-query tests', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterAll(() => {
    mockThornodeApi.restore()
    mockThornodeApi.restore()
  })
  //ThorchainQuery unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB)
    const outBoundDelay = await thorchainQuery.outboundDelay(outboundAmount)
    const expectedOutput = 6
    expect(outBoundDelay).toEqual(expectedOutput)
  })
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outBoundDelay = await thorchainQuery.outboundDelay(outboundAmount)
    const expectedOutput = 4320
    expect(outBoundDelay).toEqual(expectedOutput)
  })

  it('Should fail estimate swap because destination chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(2)), AssetETH),
      destinationAsset: AssetLTC,
      destinationAddress: 'xxx',
    }
    try {
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      printTx(estimate, swapParams.input)
      expect(estimate.txEstimate.canSwap).toEqual(false)
    } catch (error) {
      expect(error.message).toEqual(`destination chain is halted`)
    }
  })

  it('Should fail estimate swap because source chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(2)), AssetLTC),
      destinationAsset: AssetETH,
      destinationAddress: 'xxx',
    }
    try {
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      printTx(estimate, swapParams.input)
      expect(estimate.txEstimate.canSwap).toEqual(false)
    } catch (error) {
      console.log(error.message)
      expect(error.message).toEqual(`source chain is halted`)
    }
  })
  it('Should estimate swap from USDC to RUNE ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1000, 6)), assetUSDC),
      destinationAsset: AssetRuneNative,
      destinationAddress: 'xxx',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(8)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('494.14220228').amount().toFixed(),
    )
  })
  it('Should estimate swap from RUNE to USDC ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(50)), AssetRuneNative),
      destinationAsset: assetUSDC,
      destinationAddress: 'runeaddress',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(6)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('63.300701').amount().toFixed(),
    )
  })
  it('Should estimate swap from BUSD to RUNE ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1000)), BUSD),
      destinationAsset: AssetRuneNative,
      destinationAddress: 'xxx',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('499.9478375').amount().toFixed(),
    )
  })
  it('Should estimate swap from UOS to ETH ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(5000, 4)), assetUOS),
      destinationAsset: AssetETH,
      destinationAddress: 'xxx',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    // expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(18)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('1.27580793').amount().toFixed(),
    )
  })
  it('Should estimate swap from ETH to UOS ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
      destinationAsset: assetUOS,
      destinationAddress: 'xxx',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(4)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('3714.4761').amount().toFixed(),
    )
  })
})
