import { assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { SwapsHistory, ThorchainQuery } from '../src'

describe('Thorchain Query', () => {
  let thorchainQuery: ThorchainQuery

  beforeAll(() => {
    thorchainQuery = new ThorchainQuery()
  })

  it('Should get swaps history', async () => {
    const swapResume: SwapsHistory = await thorchainQuery.getSwapHistory({
      addresses: ['address'],
    })

    console.log(
      swapResume.swaps.map((swap) => {
        switch (swap.status) {
          case 'pending':
            return {
              date: swap.date,
              status: swap.status,
              in: {
                hash: swap.inboundTx.hash,
                address: swap.inboundTx.address,
                asset: assetToString(swap.inboundTx.amount.asset),
                amount: baseToAsset(swap.inboundTx.amount.baseAmount).amount().toString(),
              },
            }
          default:
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
                amount: baseToAsset(swap.outboundTx.amount.baseAmount).amount().toString(),
              },
            }
        }
      }),
    )
  })
})
