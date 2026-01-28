import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import type { Payment } from 'xrpl'

import { AssetXRP, ClientLedger, defaultXRPParams } from '../src'

describe('XRP Ledger Client', () => {
  let xrpClient: ClientLedger

  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    xrpClient = new ClientLedger({
      transport,
      ...defaultXRPParams,
    })
  })

  it('Should get address', async () => {
    const address = await xrpClient.getAddressAsync(0)
    console.log('Address:', address)
    expect(address).toBeDefined()
    expect(typeof address).toBe('string')
  })

  it('Should get address with verification', async () => {
    const address = await xrpClient.getAddressAsync(0, true)
    console.log('Address with verification:', address)
    expect(address).toBeDefined()
    expect(typeof address).toBe('string')
  })

  it('Should throw error for sync getAddress', () => {
    expect(() => xrpClient.getAddress()).toThrow('Sync method not supported for Ledger')
  })

  it('Should get balance', async () => {
    const address = await xrpClient.getAddressAsync(0)
    const balances = await xrpClient.getBalance(address)
    console.log(`Balance: ${balances[0].amount.amount().toString()} ${balances[0].asset.symbol}`)

    expect(balances).toBeDefined()
    expect(Array.isArray(balances)).toBe(true)
    expect(balances.length).toBeGreaterThan(0)

    const xrpBalance = balances.find((balance) => balance.asset.symbol === 'XRP')
    expect(xrpBalance).toBeDefined()
  })

  it('Should sign transaction', async () => {
    const address = await xrpClient.getAddressAsync(0)

    // Mock payment transaction
    const payment = {
      TransactionType: 'Payment',
      Account: address,
      Destination: 'rDNvpT4ZJfG3mC5QfHi4q3wXGKpWkuSzPm', // Test destination
      Amount: '1000000', // 1 XRP in drops
      Sequence: 1,
      LastLedgerSequence: 1000,
      Fee: '12',
    }

    const signedTx = await xrpClient.signTransaction(payment as Payment, 0)
    console.log('Signed transaction:', signedTx)

    expect(signedTx).toBeDefined()
    expect(signedTx.tx_blob).toBeDefined()
    expect(typeof signedTx.tx_blob).toBe('string')
  })

  it('Should transfer XRP Ledger', async () => {
    const address = await xrpClient.getAddressAsync(1)

    const txHash = await xrpClient.transfer({
      recipient: address, // Send to self for testing
      amount: assetToBase(assetAmount(1, 6)), // 1 XRP
      asset: AssetXRP,
      memo: 'test',
    })

    console.log('Transaction hash:', txHash)
    expect(txHash).toBeDefined()
    expect(typeof txHash).toBe('string')
  }, 30000) // 30 second timeout for network operations
})
