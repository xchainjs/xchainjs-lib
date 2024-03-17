import { assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { SwapsHistory, ThorchainQuery } from '../src'

describe('Thorchain Query', () => {
  let thorchainQuery: ThorchainQuery

  beforeAll(() => {
    thorchainQuery = new ThorchainQuery()
  })

  it('Should get swaps history', async () => {
    const swapResume: SwapsHistory = await thorchainQuery.getSwapsHistory({
      addresses: ['address'],
    })
    console.log(
      swapResume.swaps.map((swap) => {
        return {
          date: swap.date,
          status: swap.status,
          in: {
            hash: swap.inboundTx.hash,
            address: swap.inboundTx.address,
            asset: assetToString(swap.inboundTx.amount.asset),
            amount: baseToAsset(swap.inboundTx.amount.baseAmount).amount().toString(),
          },
          out: {
            hash: swap.outboundTx.hash,
            address: swap.outboundTx.address,
            asset: assetToString(swap.outboundTx.amount.asset),
            amount: baseToAsset(swap.outboundTx.amount.baseAmount).amount().toString(),
          },
        }
      }),
    )
  })
})
