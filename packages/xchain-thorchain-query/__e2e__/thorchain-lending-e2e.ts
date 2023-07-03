import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { LoanCloseParams, LoanCloseQuote, LoanOpenParams, LoanOpenQuote } from '../src/types'
import { AssetBTC, AssetETH } from '../src/utils'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

// addresses
const btcAddress = 'bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v'
const ethAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'

function printOpen(quote: LoanOpenQuote) {
  const expanded = {
    inboundAddress: quote.inboundAddress,
    expectedWaitTime: {
      outboundDelayBlocks: quote.expectedWaitTime.outboundDelayBlocks,
      outbondDelaySeconds: quote.expectedWaitTime.outbondDelaySeconds,
    },
    fees: {
      asset: quote.fees.asset,
      liquidity: quote.fees.liquidity,
      outbound: quote.fees.outbound,
      total_bps: quote.fees.total_bps,
    },
    slippageBps: quote.slippageBps,
    router: quote.router,
    expiry: quote.expiry,
    warning: quote.warning,
    notes: quote.notes,
    dustThreshold: quote.dustThreshold,
    recommendedMinAmountIn: quote.recommendedMinAmountIn,
    memo: quote.memo,
    expectedAmountOut: quote.expectedAmountOut,
    expectedCollateralizationRatio: quote.expectedCollateralizationRatio,
    expectedCollateralUp: quote.expectedCollateralUp,
    expectedDebtUp: quote.expectedDebtUp,
    errors: quote.errors,
  }
  console.log(expanded)
}

function printClose(quote: LoanCloseQuote) {
  const expanded = {
    inboundAddress: quote.inboundAddress,
    expectedWaitTime: {
      outboundDelayBlocks: quote.expectedWaitTime.outboundDelayBlocks,
      outbondDelaySeconds: quote.expectedWaitTime.outbondDelaySeconds,
    },
    fees: {
      asset: quote.fees.asset,
      liquidity: quote.fees.liquidity,
      outbound: quote.fees.outbound,
      total_bps: quote.fees.total_bps,
    },
    slippageBps: quote.slippageBps,
    router: quote.router,
    expiry: quote.expiry,
    warning: quote.warning,
    notes: quote.notes,
    dustThreshold: quote.dustThreshold,
    recommendedMinAmountIn: quote.recommendedMinAmountIn,
    memo: quote.memo,
    expectedAmountOut: quote.expectedAmountOut,
    expectedCollateralDown: quote.expectedCollateralDown,
    expectedDebtDown: quote.expectedDebtDown,
    errors: quote.errors,
  }
  console.log(expanded)
}

// Testing lending queries
describe('Thorchain-query Loan Integration Tests', () => {
  it(`Should fetch a loan quote for BTC`, async () => {
    const loanQuoteParams: LoanOpenParams = {
      asset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.2')), AssetBTC),
      targetAsset: AssetETH,
      destination: ethAddress,
    }
    const loanQuote = await thorchainQuery.getLoanQuoteOpen(loanQuoteParams)
    printOpen(loanQuote)
  })

  it(`Should fetch a loan quote for ETH`, async () => {
    const loanQuoteParams: LoanOpenParams = {
      asset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('1')), AssetETH),
      targetAsset: AssetBTC,
      destination: btcAddress,
    }
    const loanQuote = await thorchainQuery.getLoanQuoteOpen(loanQuoteParams)

    printOpen(loanQuote)
  })
  it(`Should fail a loan quote for ETH`, async () => {
    const loanQuoteParams: LoanOpenParams = {
      asset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('0.03')), AssetETH),
      targetAsset: AssetBTC,
      destination: btcAddress,
    }
    const loanQuote = await thorchainQuery.getLoanQuoteOpen(loanQuoteParams)
    expect(loanQuote.errors.length).toBeGreaterThanOrEqual(1)
    printOpen(loanQuote)
  })

  it(`Should fetch a loan withdrawal quote for BTC`, async () => {
    const loanCloseParams: LoanCloseParams = {
      asset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC),
      loanAsset: AssetBTC,
      loanOwner: btcAddress,
    }
    const loanQuoteWithdraw = await thorchainQuery.getLoanQuoteClose(loanCloseParams)

    printClose(loanQuoteWithdraw)
  })
})
