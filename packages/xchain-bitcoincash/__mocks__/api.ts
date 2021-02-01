import nock from 'nock'
import { AddressDetails } from '../src/types'

export const mock_getBalance = (url: string, address: string, result: AddressDetails) => {
  nock(url)
    .get(`/address/details/${address}`)
    .reply(200, result)
}