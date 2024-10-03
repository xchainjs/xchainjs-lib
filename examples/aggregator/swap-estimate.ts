import { Aggregator } from '@xchainjs/xchain-aggregator'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

const main = async () => {
  const fromAsset = assetFromStringEx(process.argv[2] || '')
  const toAsset = assetFromStringEx(process.argv[3] || '')
  const amount = assetToBase(assetAmount(process.argv[4], Number(process.argv[5] || 8)))

  const aggregator = new Aggregator()

  const quote = await aggregator.estimateSwap({
    fromAsset,
    destinationAsset: toAsset,
    amount: new CryptoAmount(amount, fromAsset),
  })

  console.log({
    canSwap: quote.canSwap,
    protocol: quote.protocol,
    expectedAmount: quote.expectedAmount.assetAmount.amount().toString(),
    memo: quote.memo,
    toAddress: quote.toAddress,
  })
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
