import nock from 'nock'
import { AddressBalance, Transaction, TxUnspent } from '../src/types'

export const mock_getBalance = (url: string, address: string, result: AddressBalance, times = 1) => {
  nock(url)
    .get(`/address/${address}/balance`)
    .times(times)
    .query((_) => true)
    .reply(200, result)
}

export const mock_getTransactionData = (url: string, txId: string, txData: Transaction) => {
  nock(url).get(`/transaction/${txId}`).reply(200, txData)
}

export const mock_getTransactions = (url: string, address: string, txs: Transaction[]) => {
  nock(url)
    .get(`/address/${address}/transactions/full`)
    .query((_) => true)
    .reply(200, txs)
}

export const mock_getUnspents = (url: string, address: string, txs: TxUnspent[]) => {
  nock(url)
    .get(`/address/${address}/unspent`)
    .query((_) => true)
    .reply(200, txs)
}

export const mock_broadcastTx = (url: string, txid: string) => {
  nock(url).post(`/transactions`).reply(200, { txid })
}

export const mock_estimateFee = () => {
  nock('https://app.bitgo.com').get(`/api/v2/bch/tx/fee`).reply(200, {
    feePerKb: 2000,
    numBlocks: 2,
  })
}
