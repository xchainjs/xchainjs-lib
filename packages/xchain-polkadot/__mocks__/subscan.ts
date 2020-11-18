import nock from 'nock'
import { SubscanResponse, Account, TransfersResult, Extrinsic } from '../src/types'

export const assertAccountsBalance = (url: string, address: string, result: SubscanResponse<Account>) => {
  nock(url)
    .post('/api/open/account', (body) => {
      expect(body.address).toEqual(address)

      return true
    })
    .reply(200, result)
}

export const assertTxHistory = (url: string, address: string, result: SubscanResponse<TransfersResult>) => {
  nock(url)
    .post('/api/scan/transfers', (body) => {
      expect(body.address).toEqual(address)

      return true
    })
    .reply(200, result)
}

export const assertTxData = (url: string, hash: string, result: SubscanResponse<Extrinsic>) => {
  nock(url)
    .post('/api/scan/extrinsic', (body) => {
      expect(body.hash).toEqual(hash)

      return true
    })
    .reply(200, result)
}
