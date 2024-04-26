import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
// import { Network } from '@xchainjs/xchain-client'
// import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ClientLedger } from '../src/ClientLedger'
import { defaultEthParams } from '../src/const'

jest.setTimeout(200000)

describe('Eth Client Ledger', () => {
  let ethClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    ethClient = new ClientLedger({ transport, ...defaultEthParams })
  })
  it('get ledger address async without verification ', async () => {
    const address = await ethClient.getAddressAsync()
    console.log('address', address)
    expect(address).toContain('0')
  })
})
