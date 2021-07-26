import nock from 'nock'

import { AddressBalance, RawTransaction, Transaction, TxUnspent } from '../src/types'

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

export const mock_getRawTransactionData = (url: string, txId: string, txData: RawTransaction) => {
  nock(url).get(`/transaction/${txId}/raw`).reply(200, txData)
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
  nock(url).post('/').reply(200, {
    result: txid,
    error: null,
    id: 'sendrawtransaction',
  })
}

export const mock_estimateFee = () => {
  nock('https://app.bitgo.com').get(`/api/v2/bch/tx/fee`).reply(200, {
    feePerKb: 2000,
    numBlocks: 2,
  })
}

export const mock_estimateFeeFromThor = () => {
  nock('https://thornode.thorchain.info')
    .get('/thorchain/inbound_addresses')
    .reply(200, [
      {
        chain: 'BCH',
        pub_key: 'thorpub1addwnpepqgphxg4kqfwvcha2dr9m44r4k73cqm2yd74vumyvke78zjj80mzrwh4y6nw',
        address: 'qzr0swflj9fq26ktjhxh6q0kl9ddvxljlye66s7lvx',
        halted: false,
        gas_rate: '3',
      },
      {
        chain: 'BNB',
        pub_key: 'thorpub1addwnpepqgphxg4kqfwvcha2dr9m44r4k73cqm2yd74vumyvke78zjj80mzrwh4y6nw',
        address: 'bnb1smurj0u32gzk4ju4e47srahetttphuhe64gyg4',
        halted: false,
        gas_rate: '37500',
      },
      {
        chain: 'BTC',
        pub_key: 'thorpub1addwnpepqgphxg4kqfwvcha2dr9m44r4k73cqm2yd74vumyvke78zjj80mzrwh4y6nw',
        address: 'bc1qsmurj0u32gzk4ju4e47srahetttphuhewtfrdk',
        halted: false,
        gas_rate: '72',
      },
      {
        chain: 'ETH',
        pub_key: 'thorpub1addwnpepqgphxg4kqfwvcha2dr9m44r4k73cqm2yd74vumyvke78zjj80mzrwh4y6nw',
        address: '0xbcd3fd5588369d84f4fefde45ccfdc3e74d5a805',
        router: '0x42A5Ed456650a09Dc10EBc6361A7480fDd61f27B',
        halted: false,
        gas_rate: '30',
      },
      {
        chain: 'LTC',
        pub_key: 'thorpub1addwnpepqgphxg4kqfwvcha2dr9m44r4k73cqm2yd74vumyvke78zjj80mzrwh4y6nw',
        address: 'ltc1qsmurj0u32gzk4ju4e47srahetttphuhe2hn84x',
        halted: false,
        gas_rate: '75',
      },
    ])
}
