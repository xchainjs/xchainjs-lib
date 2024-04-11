import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { defaultDashParams } from '../src/client'
import { ClientLedger } from '../src/clientLedger'
import { AssetDASH } from '../src/const'

jest.setTimeout(200000)

describe('Dash Client Ledger', () => {
  let dashClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    dashClient = new ClientLedger({
      transport,
      ...defaultDashParams,
    })
  })
  it('get address async without verification', async () => {
    const address = await dashClient.getAddressAsync()
    console.log('address', address)
  })

  it('get address async with verification', async () => {
    const address = await dashClient.getAddressAsync(0, true)
    console.log('address', address)
  })

  it('get balance', async () => {
    const address = await dashClient.getAddressAsync()
    const balance = await dashClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer', async () => {
    try {
      const to = await dashClient.getAddressAsync(0)
      const amount = assetToBase(assetAmount('0.01'))
      const txid = await dashClient.transfer({
        asset: AssetDASH,
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
