import { Network } from '@xchainjs/xchain-client'
import { assetFromStringEx } from '@xchainjs/xchain-util'

import { MidgardCache } from '../src/midgard-cache'
import { MidgardQuery } from '../src/midgard-query'
import { Midgard } from '../src/utils/midgard'

describe('Midgard fallbacks', () => {
  const query = new MidgardQuery({ getPools: async () => [] } as unknown as MidgardCache)

  it('uses 18 decimals for Binance-peg USDT and USDC', async () => {
    const usdt = assetFromStringEx('BSC.USDT-0X55D398326F99059FF775485246999027B3197955')
    const usdc = assetFromStringEx('BSC.USDC-0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d')
    expect(await query.getDecimalForAsset(usdt)).toBe(18)
    expect(await query.getDecimalForAsset(usdc)).toBe(18)
  })

  it('matches a fallback decimal when the contract case differs', async () => {
    const gusd = assetFromStringEx('ETH.GUSD-0X056FD409E1D7A124BD7017459DFEA2F387B6D5CD')
    expect(await query.getDecimalForAsset(gusd)).toBe(2)
  })

  it('asks saver details for the address it was given', async () => {
    const getSavers = jest.fn(async (address: string) => ({ pools: [], address }))
    const cache = new MidgardCache({ getSavers } as unknown as Midgard)
    await cache.getSavers('thor1a')
    await cache.getSavers('thor1b')
    expect(getSavers).toHaveBeenNthCalledWith(1, 'thor1a')
    expect(getSavers).toHaveBeenNthCalledWith(2, 'thor1b')
  })

  it('forwards txType to Midgard', async () => {
    const getActions = jest.fn(async () => ({ actions: [] }))
    const actionsQuery = new MidgardQuery({ midgard: { getActions } } as unknown as MidgardCache)
    await actionsQuery.getActions({ address: 'thor1a', txType: 'swap' })
    expect(getActions).toHaveBeenCalledWith(expect.objectContaining({ address: 'thor1a', txType: 'swap' }))
  })

  it('has no testnet Midgard host', async () => {
    await expect(new Midgard(Network.Testnet).getPools()).rejects.toThrow('Midgard not responding')
  })
})
