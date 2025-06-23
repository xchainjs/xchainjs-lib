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
    } catch (error) {}
    try {
      txHistory = await btcClient.getTransactions({ address, offset: 0, limit: -10 })
      fail()
    } catch (error) {}

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
  it('Try to send max amount', async () => {
    try {
      const firstAddress = await btcClient.getAddressAsync(0)
      const address = await btcClient.getAddressAsync(1)
      console.log('address', address)
      const balance = await btcClient.getBalance(address)
      console.log(balance[0].amount.amount().toString())
      const fee = await btcClient.getFees({
        memo: address,
        sender: address,
      })
      console.log(fee.fast.amount().toString())
      const txid = await btcClient.transfer({
        walletIndex: 1,
        asset: AssetBTC,
        recipient: firstAddress,
        amount: balance[0].amount.minus(fee.fast),
        memo: 'test',
        feeRate: 1,
      })
      console.log('txid', txid)
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
