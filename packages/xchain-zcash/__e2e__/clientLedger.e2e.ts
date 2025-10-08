import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ClientLedger, defaultZECParams } from '../src'

describe('Zcash Ledger Client', () => {
  let client: ClientLedger

  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    client = new ClientLedger({
      ...defaultZECParams,
      transport,
    })
  })

  it('Should get address', async () => {
    const address = await client.getAddressAsync(0)
    console.log('Address:', address)
    expect(address).toBeDefined()
    expect(typeof address).toBe('string')
  })

  it('Should throw error for sync getAddress', () => {
    expect(() => client.getAddress()).toThrow('Sync method not supported for Ledger')
  })

  it('Should get balance', async () => {
    const address = await client.getAddressAsync(0)
    const balances = await client.getBalance(address)
    console.log('Balance', balances[0].amount.amount().toString())
    console.log(balances[0].asset)

    expect(balances).toBeDefined()
    expect(Array.isArray(balances)).toBe(true)
    expect(balances.length).toBeGreaterThan(0)
  })

  it('Should transfer TX without memo', async () => {
    const address = await client.getAddressAsync(1)
    const txHash = await client.transfer({
      walletIndex: 0,
      amount: assetToBase(assetAmount('0.1', 8)),
      recipient: address,
    })
    console.log('txHash', txHash)
    expect(txHash).toBeDefined()
    expect(typeof txHash).toBe('string')
  })

  it.skip('Should transfer TX with memo', async () => {
    const address = await client.getAddressAsync(1)
    const txHash = await client.transfer({
      walletIndex: 0,
      amount: assetToBase(assetAmount('0.1', 8)),
      recipient: address,
      memo: 'test',
    })
    console.log('txHash', txHash)
    expect(txHash).toBeDefined()
    expect(typeof txHash).toBe('string')
  })
})
