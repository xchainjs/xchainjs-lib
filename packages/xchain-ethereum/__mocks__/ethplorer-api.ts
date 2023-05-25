// import nock from 'nock'

// import { AddressInfo, TransactionInfo, TransactionOperation } from '../src/types'

// export const mock_ethplorer_api_getAddress = (url: string, address: string, result: AddressInfo) => {
//   nock(url)
//     .get(`/getAddressInfo/${address}`)
//     .query((_) => true)
//     .reply(200, result)
// }

// export const mock_ethplorer_api_getTxInfo = (url: string, txId: string, result: TransactionInfo) => {
//   nock(url)
//     .get(`/getTxInfo/${txId}`)
//     .query((_) => true)
//     .reply(200, result)
// }

// export const mock_ethplorer_api_getAddressTransactions = (url: string, address: string, result: TransactionInfo[]) => {
//   nock(url)
//     .get(`/getAddressTransactions/${address}`)
//     .query((_) => true)
//     .reply(200, result)
// }

// export const mock_ethplorer_api_getAddressHistory = (url: string, address: string, result: TransactionOperation[]) => {
//   nock(url)
//     .get(`/getAddressHistory/${address}`)
//     .query((_) => true)
//     .reply(200, {
//       operations: result,
//     })
// }
