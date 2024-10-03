import { Aggregator } from '@xchainjs/xchain-aggregator'
import { assetToString } from '@xchainjs/xchain-util'

const main = async () => {
  const chainAddress1 = process.argv[2] || ''
  const chainAddress2 = process.argv[3] || ''

  const aggregator = new Aggregator()

  const swaps = await aggregator.getSwapHistory({
    chainAddresses: [
      {
        chain: chainAddress1.split(':')[0],
        address: chainAddress1.split(':')[1],
      },
      {
        chain: chainAddress2.split(':')[0],
        address: chainAddress2.split(':')[1],
      },
    ],
  })

  console.table(
    swaps.swaps.map((swap) => {
      return {
        protocol: swap.protocol,
        fromAsset: assetToString(swap.inboundTx.amount.asset),
        toAsset: swap.status === 'success' ? assetToString(swap.outboundTx.amount.asset) : undefined,
        hash: swap.inboundTx.hash,
        fromAmount: swap.inboundTx.amount.assetAmount.amount().toString(),
        toAmount: swap.status === 'success' ? swap.outboundTx.amount.assetAmount.amount().toString() : undefined,
      }
    }),
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
