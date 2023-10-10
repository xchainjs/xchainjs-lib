import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import {
  CryptoAmount,
  LoanCloseParams,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

/**
 * Retrieves a loan quote
 * Returns loan quote response
 */
const getLoanQuoteClosed = async (tcAmm: ThorchainAMM) => {
  try {
    const assetAmnt = new CryptoAmount(
      assetToBase(assetAmount(process.argv[4], Number(process.argv[5]))),
      assetFromStringEx(process.argv[6]),
    )
    const loanQuoteParams: LoanCloseParams = {
      asset: assetFromStringEx(process.argv[3]), // Asset recieved from loan Open
      amount: assetAmnt, // asset amount used to provide collateral around the loan
      loanAsset: assetAmnt.asset, // asset
      loanOwner: process.argv[7], // asset address
    }

    const loanQuote = await tcAmm.getLoanQuoteClose(loanQuoteParams)
    console.log(loanQuote)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  const network = process.argv[2] as Network
  const midgardCache = new MidgardCache(new Midgard(network))
  const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  await getLoanQuoteClosed(thorchainAmm)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
