import { Network } from '@xchainjs/xchain-client'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SwapEstimate,
  ThorchainCache,
  ThorchainQuery,
  TxDetails,
} from '@xchainjs/xchain-thorchain-query'
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

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'

const midgardts = new Midgard(Network.Mainnet)
const thorchainCache = new ThorchainCache(midgardts)
const thorchainQuery = new ThorchainQuery(thorchainCache)
//const thorchainAmm = new ThorchainAMM(thorchainQuery)

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
function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: print(txDetails.txEstimate, input),
  }
  console.log(expanded)
}

describe('ThorchainAmm Client Test', () => {

  beforeEach(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockThornodeApi.restore()
  })

  // ThorchainAMM unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB)

    const outBoundValue = await thorchainQuery.outboundDelay(outboundAmount)
    const expectedOutput = 1500
    expect(outBoundValue).toEqual(expectedOutput)
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainQuery.convert(input, outboundAsset)
    const EthAmount = assetToBase(assetAmount('15'))
    expect(outboundETHAmount.baseAmount.amount().toFixed()).toEqual(EthAmount.amount().toFixed())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainQuery.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(10))
    expect(outboundRuneAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainQuery.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(10))
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })
  it('Should fail estimate swap because destination chain is halted ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(2)), AssetETH),
      destinationAsset: AssetLTC,
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
})
