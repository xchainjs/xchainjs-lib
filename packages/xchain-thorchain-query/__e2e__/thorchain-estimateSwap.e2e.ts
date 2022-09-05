import { Network } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetAVAX,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  Chain,
  assetAmount,
  assetFromString,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { EstimateSwapParams, SwapEstimate, TxDetails } from '../src/types'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

const stagenetCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
const stagenethorchainQuery = new ThorchainQuery(stagenetCache)

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
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')
const BTCB = assetFromString('BNB.BTCB-1DE')
if (!BTCB) throw Error('bad asset')

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-query estimate Integration Tests', () => {
  // Test estimate swaps with mock pool data
  it('should estimate a swap of 0.5 BTC to BUSD', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC),
      destinationAsset: BUSD,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    const estimateInBusd = await thorchainQuery.getFeesIn(estimate.txEstimate.totalFees, BUSD)
    estimate.txEstimate.totalFees = estimateInBusd
    print(estimate.txEstimate, swapParams.input)
    const exchangeRate = await thorchainQuery.convert(new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC), BUSD)
    const minFee = new CryptoAmount(baseAmount(10000000), BUSD)
    console.log(`1 ${swapParams.input.asset.ticker} = ${exchangeRate.formatedAssetString()}`)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.totalFees.outboundFee.baseAmount.amount().toNumber()).toBeGreaterThanOrEqual(
      minFee.baseAmount.amount().toNumber(),
    )
  })
  it('should estimate a swap of 0.5 BTCB to BUSD', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('0.5')), BTCB),
      destinationAsset: BUSD,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }

    const estimate = await thorchainQuery.estimateSwap(swapParams)
    const estimateInBusd = await thorchainQuery.getFeesIn(estimate.txEstimate.totalFees, BUSD)
    estimate.txEstimate.totalFees = estimateInBusd
    print(estimate.txEstimate, swapParams.input)
    const exchangeRate = await thorchainQuery.convert(new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC), BUSD)
    const minFee = new CryptoAmount(baseAmount(10000000), BUSD)
    console.log(`1 ${swapParams.input.asset.ticker} = ${exchangeRate.formatedAssetString()}`)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.totalFees.outboundFee.baseAmount.amount().toNumber()).toBeGreaterThanOrEqual(
      minFee.baseAmount.amount().toNumber(),
    )
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
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    print(estimate.txEstimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
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
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate single swap of 1000 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1000, 8)), AssetRuneNative),
      destinationAsset: AssetBTC,
    }
    const address = 'bnb150vpa06jrgucqz9ycgun73t0n0rrxq4m69fc22'
    const estimate = await thorchainQuery.estimateSwap(swapParams, address)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.waitTimeSeconds === 600)
  })
  it(`Should fail estimate single swap of 0.01 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.01)), AssetRuneNative),
      destinationAsset: AssetBTC,
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    expect(estimate.txEstimate.canSwap).toBe(false)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.waitTimeSeconds === 600)
  })
  it(`Should fail estimate single swap of 0.000001 BTC to RUNE `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.000001)), AssetBTC),
      destinationAsset: AssetRuneNative,
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    expect(estimate.txEstimate.canSwap).toBe(false)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.waitTimeSeconds === 600)
  })
  // Test Conditions - Test to make sure the swap has no input errors
  it('Should fail estimate swap from BTC to BTC if source asset is the same as destination asset', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: AssetBTC,
    }
    try {
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      print(estimate.txEstimate, swapParams.input)
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
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      print(estimate.txEstimate, swapParams.input)
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
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      print(estimate.txEstimate, swapParams.input)
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
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      expect(estimate.txEstimate.errors).toEqual(
        `expected slip: ${estimate.txEstimate.slipPercentage.toFixed()} is greater than your slip limit:${swapParams.slipLimit?.toFixed()} `,
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
      const estimate = await thorchainQuery.estimateSwap(swapParams)
      expect(estimate.txEstimate.errors).toEqual([`destinationAsset HOT does not have a valid liquidity pool`])
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
      const feesToHigh = await thorchainQuery.estimateSwap(swapParams)
      print(feesToHigh.txEstimate, swapParams.input)
      expect(feesToHigh.txEstimate.errors).toEqual([
        `Input amount ${swapParams.input.formatedAssetString()} is less that total swap fees`,
      ])
    } catch (error: any) {}
  })
  it(`Should estimate calc wait time of a very large swap of 100,000 RUNE To BTC `, async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(100000)), AssetRuneNative),
      destinationAsset: AssetBTC,
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.waitTimeSeconds > 600)
  })

  it(`Should return the correct network value`, async () => {
    const constant = 'TXOUTDELAYRATE'
    const values = (await thorchainCache.getNetworkValues())[constant]
    expect(values).toEqual(10000000000)
  })
  it('should estimate a swap of 5 RUNE to AVAX', async () => {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('5')), AssetRuneNative),
      destinationAsset: AssetAVAX,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.20'), //optional
    }

    const estimate = await stagenethorchainQuery.estimateSwap(swapParams)
    print(estimate.txEstimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })

  it(`Should estimate a swap from AVAX to RUNE`, async () => {
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('0.5', 18)), AssetAVAX),
      destinationAsset: AssetRuneNative,
      slipLimit: new BigNumber('0.2'),
    }
    const estimate = await stagenethorchainQuery.estimateSwap(swapParams)
    print(estimate.txEstimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate a swap from ETH to RUNE`, async () => {
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('0.5', 18)), AssetETH),
      destinationAsset: AssetRuneNative,
      slipLimit: new BigNumber('0.2'),
    }
    const estimate = await stagenethorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate a swap from ETH to BTC`, async () => {
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('50', 18)), AssetETH),
      destinationAsset: AssetBTC,
      slipLimit: new BigNumber('0.2'),
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    printTx(estimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate a swap from BTC to ETH`, async () => {
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('5', 8)), AssetBTC),
      destinationAsset: AssetETH,
      slipLimit: new BigNumber('0.2'),
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    print(estimate.txEstimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })

  it(`Should estimate a swap from BTC to ETH`, async () => {
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount('5', 8)), AssetBTC),
      destinationAsset: AssetETH,
      slipLimit: new BigNumber('0.2'),
    }
    const estimate = await thorchainQuery.estimateSwap(swapParams)
    print(estimate.txEstimate, swapParams.input)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
})
