import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { TronWeb } from 'tronweb'

import {
  ClientLedger,
  defaultTRONParams,
  AssetTRX,
  TRX_DECIMAL,
  AssetTRONUSDT,
  TRON_USDT_CONTRACT,
  TRON_DEFAULT_RPC,
} from '../src'

describe('TRON Ledger Client', () => {
  let tronLedgerClient: ClientLedger

  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    tronLedgerClient = new ClientLedger({
      ...defaultTRONParams,
      transport,
    })
  })

  it('Should get address', async () => {
    const address = await tronLedgerClient.getAddressAsync(0)
    console.log('Address:', address)
    expect(address).toBeDefined()
    expect(typeof address).toBe('string')
  })

  it('Should get address with verification', async () => {
    const address = await tronLedgerClient.getAddressAsync(0, true)
    console.log('Address with verification:', address)
    expect(address).toBeDefined()
    expect(typeof address).toBe('string')
  })

  it('Should throw error for sync getAddress', () => {
    expect(() => tronLedgerClient.getAddress()).toThrow('Sync method not supported for Ledger')
  })

  it('Should get balance', async () => {
    const address = await tronLedgerClient.getAddressAsync(0)
    const balances = await tronLedgerClient.getBalance(address)
    console.log(`Balance: ${balances[0].amount.amount().toString()} ${balances[0].asset.symbol}`)

    expect(balances).toBeDefined()
    expect(Array.isArray(balances)).toBe(true)
    expect(balances.length).toBeGreaterThan(0)

    const trxBalance = balances.find((balance) => balance.asset.symbol === AssetTRX.symbol)
    expect(trxBalance).toBeDefined()
  })

  it('Should sign TRX transaction without memo', async () => {
    const sender = await tronLedgerClient.getAddressAsync(0)
    const recipient = await tronLedgerClient.getAddressAsync(1)

    const amount = assetToBase(assetAmount('0.1', TRX_DECIMAL))

    const tronWeb = new TronWeb({ fullHost: TRON_DEFAULT_RPC })
    const transaction = await tronWeb.transactionBuilder.sendTrx(recipient, amount.amount().toNumber(), sender)

    const signedTx = await tronLedgerClient.signTransaction(transaction, 0)
    console.log('Signed transaction:', signedTx)

    expect(signedTx).toBeDefined()
    expect(signedTx.signature).toBeDefined()
    expect(Array.isArray(signedTx.signature)).toBe(true)
    expect(signedTx.signature.every((sig) => typeof sig === 'string')).toBe(true)
  })

  it('Should sign TRC20 transaction with memo', async () => {
    const recipient = await tronLedgerClient.getAddressAsync(1)

    const txParams = {
      asset: AssetTRONUSDT,
      amount: assetToBase(assetAmount('0.1', 6)),
      recipient,
      memo: 'test',
    }

    const transaction = await tronLedgerClient.createTransaction(txParams)

    const signedTx = await tronLedgerClient.signTransaction(transaction, 0)
    console.log('Signed transaction:', signedTx)

    expect(signedTx).toBeDefined()
    expect(signedTx.signature).toBeDefined()
    expect(Array.isArray(signedTx.signature)).toBe(true)
    expect(signedTx.signature.every((sig) => typeof sig === 'string')).toBe(true)
  })

  it('Should transfer TRX signed by ledger with memo', async () => {
    const address_1 = await tronLedgerClient.getAddressAsync(1)

    const txHash = await tronLedgerClient.transfer({
      asset: AssetTRX,
      amount: assetToBase(assetAmount('0.1', TRX_DECIMAL)),
      recipient: address_1,
      memo: 'test',
    })

    console.log('Transfer transaction signed by ledger:', txHash)
    expect(txHash).toBeDefined()
    expect(typeof txHash).toBe('string')
  }, 30000) // 30 second timeout for network operations

  it('Should approve contract', async () => {
    const SunswapV3Router = 'TQAvWQpT9H916GckwWDJNhYZvQMkuRL7PN'
    const txHash = await tronLedgerClient.approve({
      walletIndex: 0,
      contractAddress: TRON_USDT_CONTRACT,
      spenderAddress: SunswapV3Router,
      amount: assetToBase(assetAmount('1', 6)),
    })
    console.log(`Approve tx:`, txHash)
    expect(txHash).toBeDefined()
    expect(typeof txHash).toBe('string')
  }, 30000)
})
