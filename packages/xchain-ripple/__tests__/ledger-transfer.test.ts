import { AssetType, baseAmount } from '@xchainjs/xchain-util'

import { AssetXRP, ClientLedger, defaultXRPParams } from '../src'

describe('ClientLedger transfer', () => {
  const client = new ClientLedger({ ...defaultXRPParams, transport: {} })

  it('rejects a non-XRP asset before talking to Ledger', async () => {
    const addressSpy = jest.spyOn(client, 'getAddressAsync')

    await expect(
      client.transfer({
        asset: { chain: 'XRP', symbol: 'USD-rIssuer', ticker: 'USD', type: AssetType.TOKEN },
        amount: baseAmount(1_000_000, 6),
        recipient: 'rRecipient',
      }),
    ).rejects.toThrow('Asset not supported')

    expect(addressSpy).not.toHaveBeenCalled()
    addressSpy.mockRestore()
  })

  it('accepts native XRP past the asset check', async () => {
    const addressSpy = jest.spyOn(client, 'getAddressAsync').mockRejectedValue(new Error('ledger stopped'))

    await expect(
      client.transfer({
        asset: AssetXRP,
        amount: baseAmount(1_000_000, 6),
        recipient: 'rRecipient',
      }),
    ).rejects.toThrow('ledger stopped')

    expect(addressSpy).toHaveBeenCalled()
    addressSpy.mockRestore()
  })
})
