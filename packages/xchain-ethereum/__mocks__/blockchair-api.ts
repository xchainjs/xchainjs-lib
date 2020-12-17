import nock from 'nock'
import { BlockChairResponse, AddressDTO, Transactions } from '../src/types/blockchair-api-types'

export const mockDashboardAddress = (url: string, address: string, result: AddressDTO) => {
  nock(url)
    .get(`/dashboards/address/${address}`)
    .query((_) => true)
    .reply(200, {
      data: result,
      context: {
        status: 1,
      }
    } as BlockChairResponse<AddressDTO>)
}

export const mockGetTx = (url: string, txId: string, result: Transactions) => {
  nock(url)
    .get(`/dashboards/transaction/${txId}`)
    .query((_) => true)
    .reply(200, {
      data: result,
      context: {
        status: 1,
      }
    } as BlockChairResponse<Transactions>)
}
