// Sample data take from https://blockchair.com/api/docs
import responseData from './responses.json'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

export default {
  restore: mock.restore,
  mockGetAddress: () => {
    mock.onGet(/\/dashboards\/address\//).reply(function (config) {
      const id: any = config.url?.split('/').pop()
      return [
        200,
        {
          data: {
            [id]: responseData.getAddressResponse,
          },
        },
      ]
    })
  },
  mockGetRawTx: () => {
    mock.onGet(/\/raw\/transaction\//).reply(function (config) {
      const id: any = config.url?.split('/').pop()
      return [
        200,
        {
          data: {
            [id]: responseData.getRawTxResponse,
          },
        },
      ]
    })
  },
  mockBitcoinStats: () => {
    mock.onGet(/\/stats/).reply(function () {
      return [
        200,
        {
          data: responseData.bitcoinStatsResponse,
        },
      ]
    })
  },
  mockGetTx: () => {
    mock.onGet(/\/dashboards\/transactions\//).reply(function (config) {
      const id: any = config.url?.split('/').pop()
      return [
        200,
        {
          data: {
            [id]: responseData.getTxResponse,
          },
        },
      ]
    })
  },
}

export const responses = responseData
