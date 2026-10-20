import { Asset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

import { MidgardCache } from '../src/midgard-cache'
import { MidgardQuery } from '../src/midgard-query'

describe('getSaverPositions', () => {
  it('uses the redeem amount Midgard reports', async () => {
    const getSavers = jest.fn(async () => ({
      pools: [
        {
          pool: 'BTC.BTC',
          assetAddress: 'bc1q',
          assetAdded: '300000000',
          assetWithdrawn: '100000000',
          assetDeposit: '200000000',
          assetRedeem: '9007199254740993',
          saverUnits: '1',
          dateFirstAdded: '0',
          dateLastAdded: '0',
        },
      ],
    }))
    const query = new MidgardQuery({ getSavers } as unknown as MidgardCache)

    const [position] = await query.getSaverPositions([
      { asset: assetFromStringEx('BTC.BTC') as Asset, address: 'bc1q' },
    ])

    expect(getSavers).toHaveBeenCalledWith('bc1q')
    expect(assetToString(position.asset)).toBe('BTC.BTC')
    expect(position.depositValue.baseAmount.amount().toString()).toBe('200000000')
    expect(position.redeemableValue.baseAmount.amount().toString()).toBe('9007199254740993')
  })
})
