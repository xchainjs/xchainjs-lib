import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { QuoteSwapParams } from '@xchainjs/xchain-mayachain-query'
import { CryptoAmount, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'

import { printQuoteSwap } from './utils'

const estimateSwap = async (mayachainAmm: MayachainAMM, quoteSwapParams: QuoteSwapParams) => {
  try {
    const quoteSwap = await mayachainAmm.estimateSwap(quoteSwapParams)
    console.log('______________________    ESTIMATION   ____________________')
    printQuoteSwap(quoteSwap)
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const amount = process.argv[2]
  const decimals = Number(process.argv[3])
  const fromAsset = assetFromString(`${process.argv[4]}`)
  const toAsset = assetFromString(`${process.argv[5]}`)
  const affiliateAddress = process.argv[6]
  let affiliateBps = 0

  if (affiliateAddress) {
    affiliateBps = Number(process.argv[7])
  }

  const quoteSwapParams: QuoteSwapParams = {
    fromAsset,
    destinationAsset: toAsset,
    amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
    affiliateAddress,
    affiliateBps,
  }

  console.log('====================== ESTIMATE SWAP EXAMPLE ====================')
  console.log('\n\n\n')
  console.log('______________________    SWAP TO ESTIMATE   ____________________')
  console.log({ ...quoteSwapParams, amount: quoteSwapParams.amount.assetAmount.amount().toString() })

  const mayachainAmm = new MayachainAMM()
  await estimateSwap(mayachainAmm, quoteSwapParams)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
