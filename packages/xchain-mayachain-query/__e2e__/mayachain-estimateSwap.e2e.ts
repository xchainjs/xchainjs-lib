import {
  CryptoAmount,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'

import { MayachainQuery } from '../src/mayachain-query'
import { QuoteSwap, QuoteSwapParams } from '../src/types'
import { CacaoAsset, EthAsset } from '../src/utils'

const mayachainQuery = new MayachainQuery()

const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetArb = assetFromStringEx('ARB.ETH')

const ethAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
const mayaAddress = 'maya1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcg0dkv'

function printQuoteSwap(quoteSwap: QuoteSwap) {
  console.log({
    toAddress: quoteSwap.toAddress,
    memo: quoteSwap.memo,
    expectedAmount: {
      asset: assetToString(quoteSwap.expectedAmount.asset),
      amount: quoteSwap.expectedAmount.baseAmount.amount().toString(),
      decimals: quoteSwap.expectedAmount.baseAmount.decimal,
    },
    dustThreshold: {
      asset: assetToString(quoteSwap.dustThreshold.asset),
      amount: quoteSwap.dustThreshold.baseAmount.amount().toString(),
      decimals: quoteSwap.dustThreshold.baseAmount.decimal,
    },
    totalFees: {
      asset: assetToString(quoteSwap.fees.asset),
      affiliateFee: {
        asset: assetToString(quoteSwap.fees.affiliateFee.asset),
        amount: quoteSwap.fees.affiliateFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.affiliateFee.baseAmount.decimal,
      },
      outboundFee: {
        asset: assetToString(quoteSwap.fees.outboundFee.asset),
        amount: quoteSwap.fees.outboundFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.outboundFee.baseAmount.decimal,
      },
    },
    inboundConfirmationSeconds: quoteSwap.inboundConfirmationSeconds,
    inboundConfirmationBlocks: quoteSwap.inboundConfirmationBlocks,
    outboundDelaySeconds: quoteSwap.outboundDelaySeconds,
    outboundDelayBlocks: quoteSwap.outboundDelayBlocks,
    totalSwapSeconds: quoteSwap.totalSwapSeconds,
    slipBasisPoints: quoteSwap.slipBasisPoints,
    canSwap: quoteSwap.canSwap,
    errors: quoteSwap.errors,
    warning: quoteSwap.warning,
  })
}

// Test User Functions - single and double swap using mock pool data
describe('Estimate swap e2e tests', () => {
  // Test estimate swaps with mock pool data
  it('should estimate a swap of 10 BTC to RUNE', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(100000), AssetBTC),
      destinationAsset: EthAsset,
    }
    const estimate = await mayachainQuery.quoteSwap(swapParams)
    printQuoteSwap(estimate)
  })

  it('should estimate a swap of 1 ARB.ETH to Cacao', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: AssetArb,
      amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetArb),
      destinationAsset: CacaoAsset,
      destinationAddress: mayaAddress,
    }
    const estimate = await mayachainQuery.quoteSwap(swapParams)
    printQuoteSwap(estimate)
  })
  it('should estimate a swap of 10 Cacao to Arb.eth', async () => {
    const swapParams: QuoteSwapParams = {
      fromAsset: CacaoAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(10, 10)), CacaoAsset),
      destinationAsset: AssetArb,
      destinationAddress: ethAddress,
    }
    const estimate = await mayachainQuery.quoteSwap(swapParams)
    printQuoteSwap(estimate)
  })
})
