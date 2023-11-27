import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { MayachainQuery, QuoteSwap } from '@xchainjs/xchain-mayachain-query'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { MayachainAMM, Wallet } from '../src'

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

describe('MayachainAmm e2e tests', () => {
  let mayachainAmm: MayachainAMM

  beforeAll(() => {
    const mayaChainQuery = new MayachainQuery()
    const wallet = new Wallet(process.env.MAINNET_PHRASE || '', Network.Mainnet)
    mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
  })
  it(`Should estimate swap from BTC to ETH `, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
    })

    printQuoteSwap(quoteSwap)
  })
})
