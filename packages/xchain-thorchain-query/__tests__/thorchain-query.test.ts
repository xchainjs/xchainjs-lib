import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainQuery } from '../src/thorchain-query'
import { QuoteSwapParams, TxDetails } from '../src/types'

import { ThorchainCache } from '../src/thorchain-cache'

//import { AssetRuneNative } from '../src/utils'
const thorchainCache = new ThorchainCache()
const thorchainQuery = new ThorchainQuery(thorchainCache)

// const assetUOS = assetFromStringEx('ETH.UOS-0XD13C7342E1EF687C5AD21B27C2B65D772CAB5C8C')
// const assetEthUSDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
// const assetAVAXUSDC = assetFromStringEx(`AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E`)
// const BUSD = assetFromStringEx('BNB.BUSD-BD1')
// const sATOM = assetFromStringEx('GAIA/ATOM')
// const sETH = assetFromStringEx('ETH/ETH')

const AssetsBTC = assetFromStringEx('BTC/BTC')
const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetETH = assetFromStringEx('ETH.ETH')
const AssetsETH = assetFromStringEx('ETH/ETH')

const ethAddress = '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990'
const btcAddress = 'bc1quk3t999thy4qcck2p208k84s2gtrxel82k5mr3'


function printTx(txDetails: TxDetails, amount: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      amount: amount.formatedAssetString(),
      totalFees: {
        asset: txDetails.txEstimate.totalFees.asset.ticker,
        swapFee: txDetails.txEstimate.totalFees.swapFee.formatedAssetString(),
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipPercentage: txDetails.txEstimate.slipBasisPoints.toFixed(),
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
    mockMidgardApi.restore()
    mockThornodeApi.restore()
  })

    it('Should fetch BTC to ETH swap', async () => {
    const swapParams: QuoteSwapParams = {
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      fromAsset: AssetBTC,
      toAsset: AssetETH,
      destinationAddress: ethAddress,
      affiliate: `thor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
      affiliateBps: 50,
      fromAddress:btcAddress,
    }
    try {
      const estimate = await thorchainQuery.quoteSwap(swapParams)
      printTx(estimate, swapParams.amount)
    }catch (error) {
      console.error(error)
    }
  })

  it('Should fetch sBTC to sETH swap', async () => {
    const swapParams: QuoteSwapParams = {
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetsBTC),
      fromAsset: AssetsBTC,
      toAsset: AssetsETH,
      destinationAddress: 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu',
      fromAddress:'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu',
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
  })


  // it('Should fail estimate swap because destination chain is halted ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: AssetETH,
  //     toAsset: AssetLTC,
  //     amount: new CryptoAmount(assetToBase(assetAmount(2, 18)), AssetETH),
  //     destinationAddress: 'xxx',
  //     fromAddress:'0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263'
  //   }
  //   try {
  //     const estimate = await thorchainQuery.quoteSwap(swapParams)
  //     printTx(estimate, swapParams.amount)
  //     expect(estimate.txEstimate.canSwap).toEqual(false)
  //     expect(estimate.txEstimate.errors).toEqual(`destination chain is halted`)
  //   } catch (error) {
  //     // console.error(error)
  //   }
  // })

  // it('Should fail estimate swap because source chain is halted ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: AssetLTC,
  //     toAsset: AssetETH,
  //     amount: new CryptoAmount(assetToBase(assetAmount(2)), AssetLTC),
  //     destinationAddress: 'xxx',
  //     fromAddress:'ltc1q3zdywxva2xs6z92f2pzt87jz7zeqy2cnele3wf'
  //   }
  //   try {
  //     const estimate = await thorchainQuery.quoteSwap(swapParams)
  //     printTx(estimate, swapParams.amount)
  //     expect(estimate.txEstimate.canSwap).toEqual(false)
  //     expect(estimate.txEstimate.errors).toEqual(`source chain is halted`)
  //   } catch (error) {
  //     // console.log(error.message)
  //   }
  // })
  // it('Should estimate swap from USDC to RUNE ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(1000, 6)), assetEthUSDC),
  //     toAsset: AssetRuneNative,
  //     fromAsset: assetEthUSDC,
  //     destinationAddress: 'xxx',
  //     fromAddress:'0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263'
  //   }

  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(8)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('500.27102979').amount().toFixed(),
  //   )
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(8)
  // })
  // it('Should estimate swap from RUNE to USDC ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: AssetRuneNative,
  //     amount: new CryptoAmount(assetToBase(assetAmount(50)), AssetRuneNative),
  //     toAsset: assetEthUSDC,
  //     destinationAddress: 'xxx',
  //     fromAddress:'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u'
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(6)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('97.050999').amount().toFixed(),
  //   )
  // })
  // it('Should estimate swap from BUSD to RUNE ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(1000)), BUSD),
  //     fromAsset: BUSD,
  //     toAsset: AssetRuneNative,
  //     destinationAddress: 'xxx',
  //     toleranceBps: 30,
  //     fromAddress:'bnb150vpa06jrgucqz9ycgun73t0n0rrxq4m69fc22'
  //   }

  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('500.00433727').amount().toFixed(),
  //   )
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(8)
  // })
  // it('Should estimate swap from Rune to BUSD ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative),
  //     fromAsset: AssetRuneNative,
  //     toAsset: BUSD,
  //     fromAddress:'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
  //     destinationAddress: 'xxx',
  //     toleranceBps: 30,
  //   }

  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('198.89949416').amount().toFixed(),
  //   )
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(8)
  // })
  // it('Should estimate swap from UOS to ETH ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: assetUOS,
  //     toAsset: AssetETH,
  //     amount: new CryptoAmount(assetToBase(assetAmount(5000, 4)), assetUOS),
  //     destinationAddress: 'xxx',
  //     fromAddress:'cosmos1q0qhvp36s7ts9l3vnf58eahpxatmdskud2za2q'
  //   }

  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(18)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('1.2873528').amount().toFixed(),
  //   )
  // })
  // it('Should estimate swap from ETH to UOS ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
  //     fromAsset: AssetETH,
  //     toAsset: assetUOS,
  //     fromAddress:'0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263',
  //     destinationAddress: 'xxx',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(4)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('3796.0174').amount().toFixed(),
  //   )
  // })
  // it('Should estimate swap from ETH to GAIA/ATOM ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
  //     fromAsset: AssetETH,
  //     toAsset: sATOM,
  //     fromAddress:'0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263',
  //     destinationAddress: 'xxx',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(6)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('112.242592').amount().toFixed(),
  //   )
  // })
  // it('Should estimate swap from GAIA/ATOM to ETH', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: sATOM,
  //     toAsset: AssetETH,
  //     amount: new CryptoAmount(assetToBase(assetAmount('112.242592', 8)), sATOM),
  //     destinationAddress: 'xxx',
  //     fromAddress:'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(true)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(18)
  //   expect(estimate.txEstimate.netOutput.assetAmount.amount().toFixed()).toEqual(
  //     assetAmount('0.99439055', 18).amount().toFixed(),
  //   )
  // })
  // it('Should check catch synth paused on sETH', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount('.8', 8)), AssetBTC),
  //     fromAsset: AssetBTC,
  //     toAsset: sETH,
  //     destinationAddress: 'xxx',
  //     fromAddress: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(false)
  // })
  // it('Should construct the correct memo BUSD->USDC', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(100)), BUSD),
  //     fromAsset: BUSD,
  //     toAsset: assetEthUSDC,
  //     destinationAddress: 'xxx',
  //     affiliate: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
  //     affiliateBps: 50,
  //     fromAddress: 'bnb150vpa06jrgucqz9ycgun73t0n0rrxq4m69fc22',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   const correctMemo = `=:ETH.USDC-6EB48:xxx:9371692555:tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx:50`
  //   expect(estimate.memo).toEqual(correctMemo)
  //   expect(estimate.txEstimate.netOutput.assetAmount.decimal).toEqual(6)
  // })
  // it('Should construct the correct memo ETH->USDC', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
  //     fromAsset: AssetETH,
  //     toAsset: assetEthUSDC,
  //     fromAddress:'0x0acfdB440280e12868131069180050Fe2d6EC945',
  //     destinationAddress: 'xxx',
  //     affiliate: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
  //     affiliateBps: 50,
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   const correctMemo = `=:ETH.USDC-6EB48:xxx:167372504555:tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx:50`
  //   expect(estimate.memo).toEqual(correctMemo)
  // })
  // it(`Should check assets match asset pools`, async () => {
  //   const assetPoolEthUsdc = await thorchainQuery.thorchainCache.getPoolForAsset(assetEthUSDC)
  //   const assetPoolAvaxUsdc = await thorchainQuery.thorchainCache.getPoolForAsset(assetAVAXUSDC)
  //   const assetPoolGaia = await thorchainQuery.thorchainCache.getPoolForAsset(AssetATOM)
  //   expect(assetPoolEthUsdc.asset).toEqual(assetEthUSDC)
  //   expect(assetPoolAvaxUsdc.asset).toEqual(assetAVAXUSDC)
  //   expect(assetPoolGaia.asset).toEqual(AssetATOM)
  // })
  // it('Should construct the correct memo for BTC->BUSD swap', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
  //     fromAsset: AssetBTC,
  //     toAsset: BUSD,
  //     destinationAddress: '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
  //     affiliate: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
  //     affiliateBps: 50,
  //     fromAddress:'bc1quk3t999thy4qcck2p208k84s2gtrxel82k5mr3',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   const correctMemo = `=:BNB.BUSD-BD1:0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990:2087822578555`
  //   expect(estimate.memo).toEqual(correctMemo)
  // })
  // it('Should construct the correct memo for sATOM->BTC swap', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAddress: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23u',
  //     amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
  //     fromAsset: AssetBTC,
  //     toAsset: BUSD,
  //     destinationAddress: '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
  //     affiliate: `tthor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
  //     affiliateBps: 50,
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   const correctMemo = `=:BNB.BUSD-BD1:0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990:2087822578555`
  //   expect(estimate.memo).toEqual(correctMemo)
  // })
})
