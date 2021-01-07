import nock from 'nock'
import { AddressInfo } from '../src/types'

export const mock_ethplorer_api_getAddress = (url: string, address: string, result: AddressInfo) => {
  nock(url)
    .get(`/getAddressInfo/${address}`)
    .query((_) => true)
    .reply(200, result)
}
