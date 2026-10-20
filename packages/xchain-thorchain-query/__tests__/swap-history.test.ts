import { assetToString } from '@xchainjs/xchain-util'

import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { PendingSwap, SuccessSwap } from '../src/types'

const refunded = {
  count: '1',
  actions: [
    {
      date: '1700000000000000000',
      status: 'success',
      in: [{ txID: 'in', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '100000' }] }],
      out: [{ txID: 'back', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '100000' }] }],
      metadata: { swap: { memo: '=:ETH.ETH:0xdest' } },
    },
  ],
}

describe('getSwapHistory', () => {
  it('keeps a swap pending when the destination asset was not paid out', async () => {
    const query = new ThorchainQuery({
      midgardQuery: { midgardCache: { midgard: { getActions: async () => refunded } } },
      getPools: async () => ({}),
    } as unknown as ThorchainCache)

    const history = await query.getSwapHistory({ addresses: ['bc1qfrom'] })

    expect(history.swaps).toHaveLength(1)
    const swap = history.swaps[0] as PendingSwap
    expect(swap.status).toBe('pending')
    expect(swap.inboundTx.hash).toBe('in')
    expect('outboundTx' in swap).toBe(false)
  })

  it('matches a lowercase destination to the pool asset', async () => {
    const query = new ThorchainQuery({
      midgardQuery: {
        midgardCache: {
          midgard: {
            getActions: async () => ({
              count: '1',
              actions: [
                {
                  date: '1700000000000000000',
                  status: 'success',
                  in: [{ txID: 'in', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '100000' }] }],
                  out: [{ txID: 'out', address: '0xdest', coins: [{ asset: 'ETH.ETH', amount: '5000' }] }],
                  metadata: { swap: { memo: '=:eth.eth:0xdest' } },
                },
              ],
            }),
          },
        },
      },
      getPools: async () => ({
        'ETH.ETH': { assetString: 'ETH.ETH', thornodeDetails: { decimals: 8 } },
      }),
    } as unknown as ThorchainCache)

    const history = await query.getSwapHistory({ addresses: ['bc1qfrom'] })
    const swap = history.swaps[0] as SuccessSwap

    expect(swap.status).toBe('success')
    expect(assetToString(swap.toAsset)).toBe('ETH.ETH')
    expect(swap.outboundTx.amount.baseAmount.amount().toString()).toBe('5000')
  })
})
