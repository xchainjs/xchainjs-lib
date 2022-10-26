import {
  AssetAtom,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromStringEx,
  assetToBase,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainQuery } from '../src/thorchain-query'
import { EstimateSwapParams, TxDetails } from '../src/types'

const thorchainQuery = new ThorchainQuery()

const assetUOS = assetFromStringEx('ETH.UOS-0XD13C7342E1EF687C5AD21B27C2B65D772CAB5C8C')
const assetEthUSDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
const assetAVAXUSDC = assetFromStringEx(`AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E`)
const BUSD = assetFromStringEx('BNB.BUSD-BD1')

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
      input: new CryptoAmount(assetToBase(assetAmount(2, 18)), AssetETH),
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
      input: new CryptoAmount(assetToBase(assetAmount(1000, 6)), assetEthUSDC),
      destinationAsset: AssetRuneNative,
      destinationAddress: 'xxx',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(8)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('499.66215078').amount().toFixed(),
    )
  })
  it('Should estimate swap from RUNE to USDC ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(50)), AssetRuneNative),
      destinationAsset: assetEthUSDC,
      destinationAddress: 'runeaddress',
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(6)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('99.834529').amount().toFixed(),
    )
  })
  it('Should estimate swap from BUSD to RUNE ', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1000)), BUSD),
      destinationAsset: AssetRuneNative,
      destinationAddress: 'xxx',
      slipLimit: new BigNumber('0.03'),
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toEqual(true)
    expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
      assetAmount('499.9878375').amount().toFixed(),
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
      assetAmount('1.28826837').amount().toFixed(),
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
      assetAmount('3802.1547').amount().toFixed(),
    )
  })
  it('Should construct the correct memo BUSD->USDC', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(100)), BUSD),
      destinationAsset: assetEthUSDC,
      destinationAddress: 'xxx',
      affiliateAddress: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
      affiliateFeeBasisPoints: 50,
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    const correctMemo = `=:ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48:xxx:9936610999:tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx:24998256`
    expect(estimate.memo).toEqual(correctMemo)
  })
  it('Should construct the correct memo ETH->USDC', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
      destinationAsset: assetEthUSDC,
      destinationAddress: 'xxx',
      affiliateAddress: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
      affiliateFeeBasisPoints: 50,
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    const correctMemo = `=:ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48:xxx:172827326999:tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx:435355040`
    expect(estimate.memo).toEqual(correctMemo)
  })
  it(`Should check assets match asset pools`, async () => {
    const assetPoolEthUsdc = await thorchainQuery.thorchainCache.getPoolForAsset(assetEthUSDC)
    const assetPoolAvaxUsdc = await thorchainQuery.thorchainCache.getPoolForAsset(assetAVAXUSDC)
    const assetPoolGai = await thorchainQuery.thorchainCache.getPoolForAsset(AssetAtom)
    expect(assetPoolEthUsdc.asset).toEqual(assetEthUSDC)
    expect(assetPoolAvaxUsdc.asset).toEqual(assetAVAXUSDC)
    expect(assetPoolGai.asset).toEqual(AssetAtom)
  })
  it('Should construct the correct memo for non-rune swap', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: BUSD,
      destinationAddress: '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
      affiliateAddress: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
      affiliateFeeBasisPoints: 50,
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    const correctMemo = `=:BNB.BUSD-BD1:0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990`
    expect(estimate.memo).toEqual(correctMemo)
  })
})
