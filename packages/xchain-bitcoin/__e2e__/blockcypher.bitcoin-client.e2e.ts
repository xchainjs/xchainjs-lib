import { AssetInfo, Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, baseToAsset } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientKeystore as Client } from '../src/clientKeystore'
import {
  AssetBTC,
  BTC_DECIMAL,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from '../src/const'

const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
const btcClient = new Client({
  ...defaultBTCParams,
  phrase: process.env.PHRASE_MAINNET,
})

describe('Bitcoin Integration Tests for BlockCypher', () => {
  it('should fetch correct asset ', async () => {
    const info = btcClient.getAssetInfo()
    const correctAssetInf: AssetInfo = {
      asset: AssetBTC,
      decimal: BTC_DECIMAL,
    }
    expect(info).toEqual(correctAssetInf)
  })
  it('should fetch address balance for blockcypher', async () => {
    const balances = await btcClient.getBalance('bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${baseToAsset(bal.amount).amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions for blockcypher', async () => {
    let txHistory = await btcClient.getTransactions({
      address: '15UWKjrakkZjvAGjJttvAm1o6NsB5VeMb9',
      offset: 1,
      limit: 10,
    })
    expect(txHistory.total).toBe(0)

    txHistory = await btcClient.getTransactions({
      address: '15UWKjrakkZjvAGjJttvAm1o6NsB5VeMb9',
      offset: 5,
      limit: 1,
    })
    expect(txHistory.total).toBe(0)

    const address = 'bc1qd8jhw2m64r8lslzkx59h8jf3uhgw56grx5dqcf'
    txHistory = await btcClient.getTransactions({ address, offset: 5, limit: 1 })
    expect(txHistory.total).toBe(1)
    expect(txHistory.txs[0].asset).toEqual(AssetBTC)
    // expect(txHistory.txs[0].hash).toEqual('a9cadbf0a59bbee3253c30978c00eb587a16c7e41421732968fd9626a7fea8af')
    expect(txHistory.txs[0].type).toEqual('transfer')

    txHistory = await btcClient.getTransactions({ address, offset: 500, limit: 10 })
    expect(txHistory.total).toBe(0)

    txHistory = await btcClient.getTransactions({ address, offset: 0, limit: 40 })
    expect(txHistory.total).toBe(40)

    txHistory = await btcClient.getTransactions({ address, offset: 11, limit: 20 })
    expect(txHistory.total).toBe(20)

    try {
      txHistory = await btcClient.getTransactions({ address, offset: -1, limit: 10 })
      fail()
    } catch (_error) {}
    try {
      txHistory = await btcClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (_error) {}

    // for (const tx of txHistory.txs) {
    //   console.log(tx.hash, tx.date)
    //   console.log(tx.from[0].from, tx.from[0].amount.amount().toFixed())
    //   console.log(tx.to[0].to, tx.to[0].amount.amount().toFixed())
    //   // console.log(JSON.stringify(txHistory, null, 2))
    // }
  })
  it('should fetch btc tx data for blockcypher', async () => {
    const txId = '3b250bfd61e7f231a22c6e02f9927927ac33e40c8b343716e08fec29c509ab54'
    const tx = await btcClient.getTransactionData(txId)
    //console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe(txId)
  })
  it('should send btc tx via blockcypher', async () => {
    try {
      // const from = btcClientTestnet.getAddress(0)
      const to = await btcClient.getAddressAsync(1)
      console.log('to', to)
      // console.log(JSON.stringify(to, null, 2))
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
  it('should prepare transaction', async () => {
    try {
      const from = await btcClient.getAddressAsync(0)
      const to = await btcClient.getAddressAsync(1)
      console.log('to', to)
      const amount = assetToBase(assetAmount('0.0001'))
      const rawUnsignedTransaction = await btcClient.prepareTx({
        sender: from,
        recipient: to,
        amount,
        memo: 'test',
        feeRate: 1,
      })
      console.log(rawUnsignedTransaction)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('should prepare transaction with enhanced UTXO selection', async () => {
    try {
      const from = await btcClient.getAddressAsync(0)
      const to = await btcClient.getAddressAsync(1)
      console.log('From:', from)
      console.log('To:', to)

      const amount = assetToBase(assetAmount('0.00119375'))
      const feeRate = await btcClient.getFeesWithRates()

      // Test enhanced transaction preparation
      const enhancedTx = await btcClient.prepareTxEnhanced({
        sender: from,
        recipient: to,
        amount,
        memo: 'test',
        feeRate: feeRate.rates.fast,
        utxoSelectionPreferences: {
          minimizeFee: true,
          avoidDust: true,
          minimizeInputs: false,
        },
      })

      console.log('Enhanced TX prepared:', {
        rawTxLength: enhancedTx.rawUnsignedTx.length,
        inputCount: enhancedTx.inputs.length,
        utxoCount: enhancedTx.utxos.length,
      })

      expect(enhancedTx.rawUnsignedTx).toBeDefined()
      expect(enhancedTx.inputs.length).toBeGreaterThan(0)
      expect(enhancedTx.utxos.length).toBeGreaterThan(0)

      // Actually send the prepared enhanced transaction
      const txHash = await btcClient.transfer({
        asset: AssetBTC,
        recipient: to,
        amount,
        memo: 'enhanced-test-broadcast',
        feeRate: feeRate.rates.fast,
      })

      console.log('Enhanced TX broadcast successful!')
      console.log('Transaction hash:', txHash)

      // Verify transaction hash format
      expect(txHash).toBeDefined()
      expect(typeof txHash).toBe('string')
      expect(txHash.length).toBeGreaterThan(0)

      console.log('✅ Enhanced transaction preparation and broadcast verified successfully!')
    } catch (err) {
      console.error('ERR running enhanced prepare test:', err)
      if (err instanceof Error) {
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
      }
      fail(err instanceof Error ? err.message : 'Enhanced prepare test failed')
    }
  })
  it('Send max amount with enhanced UTXO selection', async () => {
    try {
      const senderAddress = await btcClient.getAddressAsync(0)
      const recipientAddress = await btcClient.getAddressAsync(1)

      console.log('Sender address:', senderAddress)
      console.log('Recipient address:', recipientAddress)

      // Get current balance before send max
      const balance = await btcClient.getBalance(senderAddress)
      if (!balance || balance.length === 0) {
        console.log('No balance found for sender address, skipping test')
        return
      }

      const currentBalance = balance[0].amount.amount().toNumber()
      console.log('Current balance (satoshis):', currentBalance)

      if (currentBalance < 1000) {
        console.log('Balance too low for meaningful test, skipping')
        return
      }

      // Get fee rates
      const feeRates = await btcClient.getFeesWithRates()
      const feeRate = feeRates.rates.average
      console.log('Using fee rate:', feeRate, 'sat/byte')

      // Calculate max sendable amount using enhanced method
      const maxTxData = await btcClient.prepareMaxTx({
        sender: senderAddress,
        recipient: recipientAddress,
        feeRate: feeRate,
        memo: 'sendmax-test',
        utxoSelectionPreferences: {
          minimizeFee: true,
          avoidDust: true,
          minimizeInputs: false, // Allow more inputs for max send
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

      // Test the actual send max transaction building
      const sendMaxResult = await btcClient.sendMax({
        sender: senderAddress,
        recipient: recipientAddress,
        feeRate: feeRate,
        memo: 'sendmax-test',
        utxoSelectionPreferences: {
          minimizeFee: true,
          avoidDust: true,
          minimizeInputs: false,
        },
      })

      console.log('Send max result:', {
        maxAmount: sendMaxResult.maxAmount,
        fee: sendMaxResult.fee,
        inputCount: sendMaxResult.inputs.length,
        psbtBase64: sendMaxResult.psbt.toBase64().substring(0, 100) + '...',
      })

      // Verify send max result matches preparation
      expect(sendMaxResult.maxAmount).toBe(maxTxData.maxAmount)
      expect(sendMaxResult.fee).toBe(maxTxData.fee)
      expect(sendMaxResult.inputs.length).toBe(maxTxData.inputs.length)
      expect(sendMaxResult.psbt).toBeDefined()

      // Verify PSBT structure
      const psbtInputs = sendMaxResult.psbt.data.inputs
      const psbtOutputs = sendMaxResult.psbt.txOutputs
      expect(psbtInputs.length).toBe(sendMaxResult.inputs.length)
      expect(psbtOutputs.length).toBeGreaterThanOrEqual(1) // At least recipient output

      console.log('✅ Send max calculations and PSBT generation verified successfully!')

      // Optional: Actually broadcast the transaction (commented out for safety)
      // Uncomment the following to actually send the transaction
      // console.log('Broadcasting transaction...')
      // const txHash = await btcClient.transfer({
      //   walletIndex: 0,
      //   asset: AssetBTC,
      //   recipient: recipientAddress,
      //   amount: baseAmount(sendMaxResult.maxAmount, BTC_DECIMAL),
      //   memo: 'max',
      //   feeRate: feeRate,
      // })
      // console.log('✅ Transaction broadcast successfully!')
      // console.log('Transaction hash:', txHash)
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
