import { Network } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
  baseAmount,
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

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainQuery.thorchainCache.convert(input, outboundAsset)
    const EthAmount = new CryptoAmount(baseAmount('625601439'), AssetETH)
    expect(outboundETHAmount.baseAmount.amount().toFixed()).toEqual(EthAmount.baseAmount.amount().toFixed())
  })
  it(`Should convert USDC to Rune `, async () => {
    console.log(`USDC to rune`)
    const input = new CryptoAmount(assetToBase(assetAmount('5')), assetUSDC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundETHAmount = await thorchainQuery.thorchainCache.convert(input, outboundAsset)
    const runeAmount = new CryptoAmount(baseAmount('250298878'), AssetRuneNative)
    expect(outboundETHAmount.baseAmount.amount().toFixed()).toEqual(runeAmount.baseAmount.amount().toFixed())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainQuery.thorchainCache.convert(input, outboundAsset)
    const expectedAmount = new CryptoAmount(baseAmount('1089663786286'), AssetRuneNative)
    expect(outboundRuneAmount.baseAmount.amount()).toEqual(expectedAmount.baseAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainQuery.thorchainCache.convert(input, outboundAsset)
    const expectedAmount = new CryptoAmount(baseAmount('917714'), AssetBTC)
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.baseAmount.amount())
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
    try {
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      printTx(estimate, swapParams.input)
      expect(estimate.txEstimate.canSwap).toEqual(false)
      expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
        assetAmount('494.594687').amount().toFixed(),
      )
    } catch (error) {
      console.log(error.message)
    }
  })
  it('Should estimate swap from BUSD to RUNE ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1000)), BUSD),
      destinationAsset: AssetRuneNative,
      destinationAddress: 'xxx',
    }
    try {
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      printTx(estimate, swapParams.input)
      expect(estimate.txEstimate.canSwap).toEqual(true)
      expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
        assetAmount('494.59412912').amount().toFixed(),
      )
    } catch (error) {
      console.log(error.message)
    }
  })
})
