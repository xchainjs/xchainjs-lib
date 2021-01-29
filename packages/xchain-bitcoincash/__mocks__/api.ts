import nock from 'nock'
import { AddressBalance, TransactionData, TransactionCoins } from '../src/types'

export const mock_getBalance = (url: string, address: string, result: AddressBalance) => {
  nock(url)
    .get(`/address/${address}/balance`)
    .reply(200, result)
}

export const mock_getTransactionData = (url: string, txId: string, txData: TransactionData, coins: TransactionCoins) => {
  nock(url)
    .get(`/tx/${txId}`)
    .reply(200, txData)

  nock(url)
    .get(`/tx/${txId}/coins`)
    .reply(200, coins)
}
