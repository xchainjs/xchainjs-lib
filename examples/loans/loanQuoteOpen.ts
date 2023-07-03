import { Network } from '@xchainjs/xchain-client'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import {
  CryptoAmount,
  LoanOpenParams,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

/**
 * Retrieves a loan quote
 * Returns loan quote response
 */
const getLoanQuoteOpen = async (tcAmm: ThorchainAMM) => {
  try {
    const assetAmnt = new CryptoAmount(
      assetToBase(assetAmount(process.argv[3], Number(process.argv[4]))),
      assetFromStringEx(process.argv[5]),
    )
    const loanQuoteParams: LoanOpenParams = {
      asset: assetAmnt.asset,
      amount: assetAmnt,
      targetAsset: assetFromStringEx(process.argv[6]),
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
  const thorchainCache = new ThorchainCache(new Midgard(network), new Thornode(network))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  await getLoanQuoteOpen(thorchainAmm)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
