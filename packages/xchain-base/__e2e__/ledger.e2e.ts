import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ClientLedger, defaultBaseParams } from '../src'

describe('Base', () => {
  describe('Ledger', () => {
    let client: ClientLedger

    beforeAll(async () => {
      client = new ClientLedger({
        ...defaultBaseParams,
        network: Network.Mainnet,
        transport: await TransportNodeHid.create(),
      })
    })

    it('Should get address', async () => {
      console.log(await client.getAddressAsync())
    })

    it('Should get balance', async () => {
      const balances = await client.getBalance(await client.getAddressAsync())
      console.log(balances[0].amount.amount().toString())
    })

    it('Should make self transfer', async () => {
      const hash = await client.transfer({
        amount: assetToBase(assetAmount(0.001, 18)),
        recipient: await client.getAddressAsync(),
      })
      console.log(hash)
    })
  })
})
