import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { LoanOpenParams, LoanOpenQuote } from '../src/types'
import { AssetBTC, AssetETH } from '../src/utils'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

// const ETHChain = 'ETH'

// Addresses
// const affiliateAddress = 'x'
// const btcAddress = 'bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v'
const bnbAddress = 'bnb1mtvk4jm2a9m7lfdnvfc2vz9r9qgavs4xfc6dtx'
// const runeAddress = 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu'
const ethAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
//const avaxAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
// const stagenetCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
// const thorchainQuery = new ThorchainQuery(stagenetCache)

function print(quote: LoanOpenQuote) {
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
    memo: quote.memo,
    expectedAmountOut: quote.expectedAmountOut,
    expectedCollateralizationRation: quote.expectedCollateralizationRation,
    expectedCollateralUp: quote.expectedCollateralUp,
    expectedDebtUp: quote.expectedDebtUp,
    errors: quote.errors,
  }
  console.log(expanded)
}

const AssetBUSD = assetFromStringEx('BNB.BUSD-BD1')
// const BTCB = assetFromStringEx('BNB.BTCB-1DE')
//const USDCETH = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-query Loan Integration Tests', () => {
  it(`Should fetch a loan quote for BTC`, async () => {
    const loanQuoteParams: LoanOpenParams = {
      asset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount('0.2')), AssetBTC),
      targetAsset: AssetETH,
      destination: ethAddress,
    }
    const loanQuote = await thorchainQuery.getLoanQuoteOpen(loanQuoteParams)
    print(loanQuote)
  })

  it(`Should fetch a loan quote for ETH`, async () => {
    const loanQuoteParams: LoanOpenParams = {
      asset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetETH),
      targetAsset: AssetBUSD,
      destination: bnbAddress,
    }
    const loanQuote = await thorchainQuery.getLoanQuoteOpen(loanQuoteParams)

    print(loanQuote)
  })
})
