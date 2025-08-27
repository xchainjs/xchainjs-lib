import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientLedger } from '../src/clientLedger'
import {
  AssetBTC,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from '../src/const'

jest.setTimeout(200000)

const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/0'/0'/0/`,
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

describe('Bitcoin Client Ledger', () => {
  let btcClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    btcClient = new ClientLedger({
      transport,
      ...defaultBTCParams,
    })
  })
  it('get address async without verification', async () => {
    const address = await btcClient.getAddressAsync()
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get address async with verification', async () => {
    const address = await btcClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get balance', async () => {
    const address = await btcClient.getAddressAsync()
    const balance = await btcClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer', async () => {
    try {
      const to = await btcClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.00002'))
      const txid = await btcClient.transfer({
        asset: AssetBTC,
        recipient: to,
        amount,
        memo: 'test',
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('send max ledger', async () => {
    try {
      const senderAddress = await btcClient.getAddressAsync(0)
      const recipientAddress = await btcClient.getAddressAsync(1)

      console.log('Sender address:', senderAddress)
      console.log('Recipient address:', recipientAddress)

      // Get current balance before send max
      const balance = await btcClient.getBalance(senderAddress)
      const feeRate = await btcClient.getFeesWithRates()
      const currentBalance = balance[0].amount.amount().toNumber()
      console.log('Current balance (satoshis):', currentBalance)

      // Calculate max sendable amount
      const maxTxData = await btcClient.prepareMaxTx({
        sender: senderAddress,
        recipient: recipientAddress,
        feeRate: feeRate.rates.average, // 10 sat/byte
        memo: 'sendmax-test',
        utxoSelectionPreferences: {
          minimizeFee: true,
          avoidDust: true,
        },
      })

      console.log('Max sendable amount (satoshis):', maxTxData.maxAmount)
      console.log('Estimated fee (satoshis):', maxTxData.fee)
      console.log('UTXOs to use:', maxTxData.inputs.length)
      console.log(
        'Total input value:',
        maxTxData.inputs.reduce((sum, utxo) => sum + utxo.value, 0),
      )

      // Verify calculations
      expect(maxTxData.maxAmount).toBeGreaterThan(0)
      expect(maxTxData.fee).toBeGreaterThan(0)
      expect(maxTxData.maxAmount + maxTxData.fee).toBeLessThanOrEqual(currentBalance)
      expect(maxTxData.inputs.length).toBeGreaterThan(0)

      // Test the actual send max transaction
      const sendMaxResult = await btcClient.sendMax({
        sender: senderAddress,
        recipient: recipientAddress,
        feeRate: feeRate.rates.average,
        memo: 'sendmax-test',
        utxoSelectionPreferences: {
          minimizeFee: true,
          avoidDust: true,
        },
      })

      console.log('Send max result:', {
        maxAmount: sendMaxResult.maxAmount,
        fee: sendMaxResult.fee,
        inputCount: sendMaxResult.inputs.length,
        psbtBase64: sendMaxResult.psbt.toBase64().substring(0, 100) + '...',
      })

      // Verify send max result
      expect(sendMaxResult.maxAmount).toBe(maxTxData.maxAmount)
      expect(sendMaxResult.fee).toBe(maxTxData.fee)
      expect(sendMaxResult.inputs.length).toBe(maxTxData.inputs.length)
      expect(sendMaxResult.psbt).toBeDefined()

      console.log('✅ Send max calculations verified successfully!')

      // Note: Uncomment the next lines to actually broadcast the transaction
      // This requires user confirmation on the Ledger device

      const finalTxHash = await btcClient.transfer({
        walletIndex: 0,
        asset: AssetBTC,
        recipient: recipientAddress,
        amount: baseAmount(sendMaxResult.maxAmount, 8),
        memo: 'sendmax-test',
        feeRate: feeRate.rates.average,
      })
      console.log('Transaction broadcast! TxHash:', finalTxHash)
    } catch (err) {
      console.error('ERR running send max test:', err)
      if (err instanceof Error) {
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
      }
      fail(err instanceof Error ? err.message : 'Send max test failed')
    }
  })
})
