import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { PendingSwap } from '../src/types'

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
})
