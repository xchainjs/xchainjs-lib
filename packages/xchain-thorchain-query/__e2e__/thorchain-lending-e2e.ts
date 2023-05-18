import { Network } from '@xchainjs/xchain-client'

import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { LoanOpenParams } from '../src/types'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
const thorchainQuery = new ThorchainQuery(thorchainCache)

// const ETHChain = 'ETH'

// Addresses
// const affiliateAddress = 'x'
// const btcAddress = 'bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v'
// const bnbAddress = 'bnb1mtvk4jm2a9m7lfdnvfc2vz9r9qgavs4xfc6dtx'
// const runeAddress = 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu'
const ethAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
//const avaxAddress = '0xf155e9cdD77A5d77073aB43d17F661507C08E23d'
// const stagenetCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
// const thorchainQuery = new ThorchainQuery(stagenetCache)

// function print(estimate: SwapEstimate, amount: CryptoAmount) {
//   const expanded = {
//     amount: amount.formatedAssetString(),
//     totalFees: {
//       outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
//       affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
//     },
//     slipBasisPoints: estimate.slipBasisPoints.toFixed(),
//     netOutput: estimate.netOutput.formatedAssetString(),
//     outboundDelaySeconds: estimate.outboundDelaySeconds,
//     inboundConfirmationSeconds: estimate.inboundConfirmationSeconds,
//     canSwap: estimate.canSwap,
//     errors: estimate.errors,
//   }
//   return expanded
// }
// function printTx(txDetails: TxDetails, amount: CryptoAmount) {
//   const expanded = {
//     memo: txDetails.memo,
//     expiry: txDetails.expiry,
//     toAddress: txDetails.toAddress,
//     txEstimate: print(txDetails.txEstimate, amount),
//   }
//   console.log(expanded)
// }
// const BUSD = assetFromStringEx('BNB.BUSD-BD1')
// const BTCB = assetFromStringEx('BNB.BTCB-1DE')
//const USDCETH = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-query Loan Integration Tests', () => {
  it(`Should fetch a loan quote for BTC`, async () => {
    const loanQuoteParams: LoanOpenParams = {
      asset: 'BTC.BTC',
      amount: 10000000,
      targetAsset: 'ETH.ETH',
      destination: ethAddress,
    }
    const loanQuote = await thorchainQuery.getLoanQuoteOpen(loanQuoteParams)

    console.log(loanQuote)
  })
})
