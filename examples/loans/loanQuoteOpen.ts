import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { LoanOpenParams, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import {
  Asset,
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  register9Rheader,
} from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

/**
 * Retrieves a loan quote
 * Returns loan quote response
 */
const getLoanQuoteOpen = async (tcAmm: ThorchainAMM) => {
  try {
    const assetAmnt = new CryptoAmount(
      assetToBase(assetAmount(process.argv[3], Number(process.argv[4]))),
      assetFromStringEx(process.argv[5]) as Asset | TokenAsset,
    )
    const loanQuoteParams: LoanOpenParams = {
      asset: assetAmnt.asset,
      amount: assetAmnt,
      targetAsset: assetFromStringEx(process.argv[6]) as Asset | TokenAsset,
      destination: process.argv[7],
    }

    const loanQuote = await tcAmm.getLoanQuoteOpen(loanQuoteParams)
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
  await getLoanQuoteOpen(thorchainAmm)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
