import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockMayanodeApi from '../__mocks__/mayanode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { MayachainCache } from '../src/mayachain-cache'
import { MayachainQuery } from '../src/mayachain-query'
import { QuoteSwapParams, TxDetails } from '../src/types'

//import { AssetRuneNative } from '../src/utils'
const mayachainCache = new MayachainCache()
const mayachainQuery = new MayachainQuery(mayachainCache)

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

describe('Mayachain-query tests', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockMayanodeApi.init()
  })
  afterAll(() => {
    mockMidgardApi.restore()
    mockMayanodeApi.restore()
  })

  it('Should fetch BTC to ETH swap', async () => {
    const swapParams: QuoteSwapParams = {
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC),
      fromAsset: AssetBTC,
      destinationAsset: AssetETH,
      destinationAddress: ethAddress,
      affiliateAddress: `thor13q9z22fvjkk8r8sxf7hmp2t56jyvn9s7sxx8lx`,
      affiliateBps: 50,
      fromAddress: btcAddress,
    }
    const estimate = await mayachainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
  })

  it('Should fetch sBTC to sETH swap', async () => {
    const swapParams: QuoteSwapParams = {
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetsBTC),
      fromAsset: AssetsBTC,
      destinationAsset: AssetsETH,
      destinationAddress: 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu',
      fromAddress: 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu',
    }
    const estimate = await mayachainQuery.quoteSwap(swapParams)
    printTx(estimate, swapParams.amount)
  })
})
