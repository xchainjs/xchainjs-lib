import type Transport from '@ledgerhq/hw-transport'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AssetATOM, COSMOS_DECIMAL, ClientLedger, defaultClientConfig } from '../src'

describe('Cosmos client e2e', () => {
  let client: ClientLedger

  beforeAll(async () => {
    const transport: Transport = await TransportNodeHid.create()

    client = new ClientLedger({
      transport,
      ...defaultClientConfig,
    })
  })
  it('get address async', async () => {
    const address = await client.getAddressAsync(0, true)
    console.log({ address })
  })
  it('should broadcast a normal transfer', async () => {
    const amount = assetAmount(0.1, COSMOS_DECIMAL)
    const hash = await client.transfer({
      walletIndex: 0,
      asset: AssetATOM,
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(amount),
      memo: 'test',
    })
    console.log({ hash })
  })
})
