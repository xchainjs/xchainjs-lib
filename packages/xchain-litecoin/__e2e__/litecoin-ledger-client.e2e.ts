import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ClientLedger } from '../src/ClientLedger'
import { defaultLtcParams } from '../src/client'
import { AssetLTC } from '../src/const'

jest.setTimeout(200000)

describe('Litecoin Client Ledger', () => {
  let ltcClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    ltcClient = new ClientLedger({
      transport,
      ...defaultLtcParams,
    })
  })
  it('get address async without verification', async () => {
    const address = await ltcClient.getAddressAsync()
    console.log('address', address)
  })

  it('get address async with verification', async () => {
    const address = await ltcClient.getAddressAsync(0, true)
    console.log('address', address)
  })

  it('get balance', async () => {
    const address = await ltcClient.getAddressAsync()
    const balance = await ltcClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer', async () => {
    try {
      const to = await ltcClient.getAddressAsync(0)
      const amount = assetToBase(assetAmount('0.01'))
      const txid = await ltcClient.transfer({
        asset: AssetLTC,
        recipient: to,
        amount,
        memo: 'test',
        feeRate: 1,
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
