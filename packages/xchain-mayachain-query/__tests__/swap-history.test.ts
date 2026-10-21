import { assetToString } from '@xchainjs/xchain-util'

import { MayachainCache } from '../src/mayachain-cache'
import { MayachainQuery } from '../src/mayachain-query'
import { PendingSwap, SuccessSwap } from '../src/types'

function queryFor(actions: unknown[]): MayachainQuery {
  return new MayachainQuery({
    midgardQuery: { getActions: async () => ({ count: String(actions.length), actions }) },
    getAssetDecimals: async () => ({}),
    getPools: async () => [],
  } as unknown as MayachainCache)
}

describe('MAYA getSwapHistory', () => {
  it('adds duplicate inbounds with integer amounts', async () => {
    const action = {
      date: '1700000000000000000',
      status: 'pending',
      in: [{ txID: 'in', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '9007199254740993' }] }],
      out: [],
      metadata: { swap: { memo: '=:ETH.ETH:0xdest' } },
    }
    const second = {
      ...action,
      in: [{ txID: 'in', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '2' }] }],
    }

    const history = await queryFor([action, second]).getSwapHistory({ addresses: ['bc1qfrom'] })

    expect(history.swaps).toHaveLength(1)
    expect(history.swaps[0].inboundTx.amount.baseAmount.amount().toString()).toBe('9007199254740995')
  })

  it('keeps a swap pending when the destination asset was not paid out', async () => {
    const history = await queryFor([
      {
        date: '1700000000000000000',
        status: 'success',
        in: [{ txID: 'in', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '100000' }] }],
        out: [{ txID: 'back', address: 'bc1qfrom', coins: [{ asset: 'BTC.BTC', amount: '100000' }] }],
        metadata: { swap: { memo: '=:ETH.ETH:0xdest' } },
      },
    ]).getSwapHistory({ addresses: ['bc1qfrom'] })

    const swap = history.swaps[0] as PendingSwap
    expect(swap.status).toBe('pending')
    expect('outboundTx' in swap).toBe(false)
  })

  it('matches a lowercase destination to the pool asset', async () => {
    const query = new MayachainQuery({
      midgardQuery: {
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
      getAssetDecimals: async () => ({}),
      getPools: async () => [{ asset: 'ETH.ETH' }],
    } as unknown as MayachainCache)

    const history = await query.getSwapHistory({ addresses: ['bc1qfrom'] })
    const swap = history.swaps[0] as SuccessSwap

    expect(swap.status).toBe('success')
    expect(assetToString(swap.toAsset)).toBe('ETH.ETH')
    expect(swap.outboundTx.amount.baseAmount.amount().toString()).toBe('5000')
  })
})
