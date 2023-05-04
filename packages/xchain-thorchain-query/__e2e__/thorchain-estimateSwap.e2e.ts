import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetFromStringEx, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { QuoteSwapParams, SwapEstimate, TxDetails } from '../src/types'
import { AssetRuneNative } from '../src/utils'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

const AssetAVAX = assetFromStringEx('AVAX.AVAX')
const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetETH = assetFromStringEx('ETH.ETH')

// const ETHChain = 'ETH'

// Addresses
const affiliateAddress = 'x'
const btcAddress = 'bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v'
const bnbAddress = 'bnb1mtvk4jm2a9m7lfdnvfc2vz9r9qgavs4xfc6dtx'
const runeAddress = 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu'
const ethAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
const avaxAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
// const stagenetCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
// const thorchainQuery = new ThorchainQuery(stagenetCache)

function print(estimate: SwapEstimate, amount: CryptoAmount) {
  const expanded = {
    amount: amount.formatedAssetString(),
    totalFees: {
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipBasisPoints: estimate.slipBasisPoints.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  return expanded
}
function printTx(txDetails: TxDetails, amount: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: print(txDetails.txEstimate, amount),
  }
  console.log(expanded)
}
const BUSD = assetFromStringEx('BNB.BUSD-BD1')
const BTCB = assetFromStringEx('BNB.BTCB-1DE')
//const USDCETH = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-query estimate Integration Tests', () => {
  // Test estimate swaps with mock pool data
  it('should estimate a swap of 10 BTC to RUNE with 0.3 affiliate fee', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetBTC),
      destinationAsset: AssetRuneNative,
      destinationAddress: 'xxx',
      toleranceBps: 300,
      affiliateAddress: affiliateAddress,
      affiliateBps: 300, //optional
      fromAddress: btcAddress,
    }

    const estimate = await thorchainQuery.quoteSwap(swapParams)
    const estimateInBusd = await thorchainQuery.getFeesIn(estimate.txEstimate.totalFees, BUSD)
    estimate.txEstimate.totalFees = estimateInBusd
    printTx(estimate, swapParams.amount)
  })
  it('should estimate a swap of 0.5 BTC to BUSD', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC),
      // toleranceBps: 200,
      destinationAsset: BUSD,
      destinationAddress: bnbAddress,
      fromAddress: btcAddress,
    }

    const estimate = await thorchainQuery.quoteSwap(swapParams)
    const estimateInBusd = await thorchainQuery.getFeesIn(estimate.txEstimate.totalFees, BUSD)
    estimate.txEstimate.totalFees = estimateInBusd
    printTx(estimate, swapParams.amount)
    const exchangeRate = await thorchainQuery.convert(new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC), BUSD)
    const minFee = new CryptoAmount(baseAmount(10000000), BUSD)
    console.log(`1 ${swapParams.amount.asset.ticker} = ${exchangeRate.formatedAssetString()}`)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.totalFees.outboundFee.baseAmount.amount().toNumber()).toBeGreaterThanOrEqual(
      minFee.baseAmount.amount().toNumber(),
    )
  })
  it('should quote only swap of 0.5 BTCB to BUSD', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: BTCB,
      amount: new CryptoAmount(assetToBase(assetAmount('0.5')), BTCB),
      destinationAsset: BUSD,
      // destinationAddress: bnbAddress,
      // toleranceBps: 400,
    }

    const estimate = await thorchainQuery.quoteSwap(swapParams)
    const estimateInBusd = await thorchainQuery.getFeesIn(estimate.txEstimate.totalFees, BUSD)
    estimate.txEstimate.totalFees = estimateInBusd
    printTx(estimate, swapParams.amount)
    const exchangeRate = await thorchainQuery.convert(new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC), BUSD)
    const minFee = new CryptoAmount(baseAmount(10000000), BUSD)
    console.log(`1 ${swapParams.amount.asset.ticker} = ${exchangeRate.formatedAssetString()}`)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
    expect(estimate.txEstimate.totalFees.outboundFee.baseAmount.amount().toNumber()).toBeGreaterThanOrEqual(
      minFee.baseAmount.amount().toNumber(),
    )
  })
  it('should estimate a swap of 1 BTC to sBTC', async () => {
    const BTC = assetFromStringEx('BTC.BTC')
    const sBTC = assetFromStringEx('BTC/BTC')

    if (!sBTC || !BTC) throw Error('err')

    const swapParams: QuoteSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: sBTC,
      destinationAddress: runeAddress,
      //affiliate: affiliateAddress, //
      //affiliateBps: 30, //optional
      toleranceBps: 300, //optional
      fromAddress: btcAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate).toBeTruthy()
  })
  it('should estimate a swap of 1 sBTC to sETH', async () => {
    const sBTC = assetFromStringEx('BTC/BTC')
    const sETH = assetFromStringEx('ETH/ETH')
    if (!sBTC || !sETH) throw Error('err')

    const swapParams: QuoteSwapParams = {
      fromAsset: sBTC,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), sBTC),
      destinationAsset: sETH,
      destinationAddress: runeAddress,
      affiliateAddress: affiliateAddress,
      affiliateBps: 30, //optional
      //toleranceBps: 20, //optional\
      fromAddress: runeAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate).toBeTruthy()
  })
  it('should estimate a swap of 1 sETH to sBTC', async () => {
    const sBTC = assetFromStringEx('BTC/BTC')
    const sETH = assetFromStringEx('ETH/ETH')
    if (!sBTC || !sETH) throw Error('err')

    const swapParams: QuoteSwapParams = {
      fromAsset: sETH,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), sETH),
      destinationAsset: sBTC,
      destinationAddress: 'xxx',
      // affiliate: affiliateAddress,
      // affiliateBps: 30, //optional
      toleranceBps: 20, //optional
      fromAddress: runeAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate).toBeTruthy()
  })
  it('should estimate a swap of 1 sBNBETH to sETH', async () => {
    const sBNBETH = assetFromStringEx('BNB/ETH-1C9')
    const sETH = assetFromStringEx('ETH/ETH')
    if (!sBNBETH || !sETH) throw Error('err')

    const swapParams: QuoteSwapParams = {
      fromAsset: sETH,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), sETH),
      destinationAsset: sBNBETH,
      destinationAddress: 'xxx',
      // affiliate: affiliateAddress,
      // affiliateBps: 30, //optional
      toleranceBps: 20, //optional
      fromAddress: runeAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate single swap of 1000 RUNE To BTC `, async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetRuneNative,
      amount: new CryptoAmount(assetToBase(assetAmount(1000, 8)), AssetRuneNative),
      destinationAsset: AssetBTC,
      destinationAddress: btcAddress,
      //toleranceBps: 200, //optional
      fromAddress: runeAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate single swap of 1000 busd To BTC `, async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: BUSD,
      amount: new CryptoAmount(assetToBase(assetAmount(1000, 8)), BUSD),
      destinationAsset: AssetBTC,
      destinationAddress: btcAddress,
      fromAddress: bnbAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate.txEstimate.canSwap).toBe(true)
    expect(estimate).toBeTruthy()
  })
  it(`Should fail estimate single swap of 0.01 RUNE To BTC `, async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetRuneNative,
      amount: new CryptoAmount(assetToBase(assetAmount(0.01)), AssetRuneNative),
      destinationAsset: AssetBTC,
      destinationAddress: btcAddress,
      fromAddress: runeAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate.txEstimate.canSwap).toBe(false)
    expect(estimate).toBeTruthy()
  })
  // it(`Should fail estimate single swap of 0.000001 BTC to RUNE `, async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: AssetBTC,
  //     amount: new CryptoAmount(assetToBase(assetAmount(0.000001)), AssetBTC),
  //     destinationAsset: AssetRuneNative,
  //     destinationAddress: runeAddress,
  //     fromAddress: btcAddress,
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toBe(false)
  //   expect(estimate).toBeTruthy()
  // })
  // Test Conditions - Test to make sure the swap has no amount errors
  it('Should fail estimate swap from BTC to BTC if source asset is the same as destination asset', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      destinationAsset: AssetBTC,
      destinationAddress: btcAddress,
      fromAddress: btcAddress,
    }

    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    print(estimate.txEstimate, swapParams.amount)
    expect(estimate.txEstimate.errors.length).toEqual(1)
  })
  it('Should fail estimate swap from BTC to ETH if amount amount is 0', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount(0)), AssetBTC),
      destinationAsset: AssetETH,
      destinationAddress: ethAddress,
      fromAddress: btcAddress,
    }

    const estimate = await thorchainQuery.quoteSwap(swapParams)
    print(estimate.txEstimate, swapParams.amount)

    expect(estimate.txEstimate.errors.length).toEqual(1)
  })

  it(`Should estimate a swap from AVAX to RUNE`, async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetAVAX,
      amount: new CryptoAmount(assetToBase(assetAmount('1', 18)), AssetAVAX),
      destinationAsset: AssetRuneNative,
      destinationAddress: runeAddress,
      fromAddress: avaxAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate).toBeTruthy()
  })
  it(`Should estimate a swap from RUNE to Avax`, async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetRuneNative,
      amount: new CryptoAmount(assetToBase(assetAmount('1000')), AssetRuneNative),
      destinationAsset: AssetAVAX,
      destinationAddress: avaxAddress,
      fromAddress: runeAddress,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
    expect(estimate).toBeTruthy()
  })
})
