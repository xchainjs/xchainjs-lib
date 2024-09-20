import {
  Asset,
  CryptoAmount,
  SynthAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseToAsset,
} from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { PendingSwap, QuoteSwapParams, SuccessSwap, TxDetails } from '../src/types'

//import { AssetRuneNative } from '../src/utils'
const thorchainCache = new ThorchainCache()
const thorchainQuery = new ThorchainQuery(thorchainCache)

// const assetUOS = assetFromStringEx('ETH.UOS-0XD13C7342E1EF687C5AD21B27C2B65D772CAB5C8C')
// const assetEthUSDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
// const assetAVAXUSDC = assetFromStringEx(`AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E`)
// const BUSD = assetFromStringEx('BNB.BUSD-BD1')
// const sATOM = assetFromStringEx('GAIA/ATOM')
// const sETH = assetFromStringEx('ETH/ETH')

const AssetsBTC = assetFromStringEx('BTC/BTC') as SynthAsset
const AssetBTC = assetFromStringEx('BTC.BTC') as Asset
const AssetETH = assetFromStringEx('ETH.ETH') as Asset
const AssetsETH = assetFromStringEx('ETH/ETH') as SynthAsset

const ethAddress = '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990'

function printTx(txDetails: TxDetails, amount: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      amount: amount.formatedAssetString(),
      totalFees: {
        asset: txDetails.txEstimate.totalFees.asset.ticker,
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipPercentage: txDetails.txEstimate.slipBasisPoints.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      netOutputDecimals: txDetails.txEstimate.netOutput.baseAmount.decimal,
      inboundConfirmationSeconds: txDetails.txEstimate.inboundConfirmationSeconds?.toFixed(),
      outboundDelaySeconds: txDetails.txEstimate.outboundDelaySeconds.toFixed(),
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
      destinationAsset: AssetETH,
      destinationAddress: ethAddress,
      affiliateAddress: `thor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
      affiliateBps: 50,
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
  })

  it('Should fetch sBTC to sETH swap', async () => {
    const swapParams: QuoteSwapParams = {
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetsBTC),
      fromAsset: AssetsBTC,
      destinationAsset: AssetsETH,
      destinationAddress: 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu',
    }
    const estimate = await thorchainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
  })
  it('Should validate CryptoAmount', async () => {
    expect(
      await thorchainQuery.validateAmount(new CryptoAmount(assetToBase(assetAmount(1, 8)), AssetBTC)),
    ).toBeUndefined()
    expect(
      await thorchainQuery.validateAmount(new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH)),
    ).toBeUndefined()
    expect(
      (await thorchainQuery.validateAmount(new CryptoAmount(assetToBase(assetAmount(1, 7)), AssetsETH)))?.message,
    ).toBe('Invalid number of decimals: ETH/ETH must have 8 decimals')
    expect(
      (await thorchainQuery.validateAmount(new CryptoAmount(assetToBase(assetAmount(1, 17)), AssetETH)))?.message,
    ).toBe('Invalid number of decimals: ETH.ETH must have 18 decimals')
  })

  it('Should get swaps history', async () => {
    const swapResume = await thorchainQuery.getSwapHistory({ addresses: ['address'] })
    expect(swapResume.count === swapResume.swaps.length)
    const pendingSwap = swapResume.swaps[0] as PendingSwap
    expect({
      date: pendingSwap.date,
      status: pendingSwap.status,
      fromAsset: assetToString(pendingSwap.fromAsset),
      toAsset: assetToString(pendingSwap.toAsset),
      in: {
        hash: pendingSwap.inboundTx.hash,
        address: pendingSwap.inboundTx.address,
        asset: assetToString(pendingSwap.inboundTx.amount.asset),
        amount: baseToAsset(pendingSwap.inboundTx.amount.baseAmount).amount().toString(),
      },
    }).toEqual({
      date: new Date('2024-09-20T10:57:22.493Z'),
      status: 'pending',
      fromAsset: 'ETH~USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
      toAsset: 'ETH~ETH',
      in: {
        hash: '4A60B30CBC1EDF2C9A761285EF301C84A6CC8015197E81F12B05B05AE5470AE8',
        address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
        asset: 'ETH~USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
        amount: '4175.96871027',
      },
    })
    const successSwap = swapResume.swaps[1] as SuccessSwap
    expect({
      date: successSwap.date,
      status: successSwap.status,
      fromAsset: assetToString(successSwap.fromAsset),
      toAsset: assetToString(successSwap.toAsset),
      in: {
        hash: successSwap.inboundTx.hash,
        address: successSwap.inboundTx.address,
        asset: assetToString(successSwap.inboundTx.amount.asset),
        amount: baseToAsset(successSwap.inboundTx.amount.baseAmount).amount().toString(),
      },
      out: {
        hash: successSwap.outboundTx.hash,
        address: successSwap.outboundTx.address,
        asset: assetToString(successSwap.outboundTx.amount.asset),
        amount: baseToAsset(successSwap.outboundTx?.amount.baseAmount).amount().toString(),
      },
    }).toEqual({
      date: new Date('2024-03-17T14:29:09.029Z'),
      status: 'success',
      fromAsset: 'DOGE/DOGE',
      toAsset: 'ETH/USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
      in: {
        hash: 'EA7F60B6EB355A40FA7DAA030A0F09F27B7C3AE18E8AE8AB55A7C87DA80F0446',
        address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
        asset: 'DOGE/DOGE',
        amount: '8992.93646959',
      },
      out: {
        hash: '',
        address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
        asset: 'ETH/USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
        amount: '1355.86901',
      },
    })
  })
})
