import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { addresses, rawTransactions, dashboardTransactions, bitcoinStats } from './responses.json'

const mock = new MockAdapter(axios)

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock getAddress
    mock.onGet(/\/dashboards\/address\//).reply(function (config: MockConfig) {
      const id: any = config.url?.split('/').pop()
      return [200, { data: { [id]: (addresses as any)[id] } }]
    })

    //Mock getRawTx
    mock.onGet(/\/raw\/transaction\//).reply(function (config: MockConfig) {
      const id: any = config.url?.split('/').pop()
      const result: any = { data: { [id]: (rawTransactions as any)[id] } }
      return [200, result]
    })

    //Mock getStat
    mock.onGet(/\/stats/).reply(function () {
      return [200, { data: bitcoinStats }]
    })

    //Mock getTx
    mock.onGet(/\/dashboards\/transaction\//).reply(function (config: MockConfig) {
      const id: any = config.url?.split('/').pop()
      return [
        200,
        {
          data: {
            [id]: (dashboardTransactions as any)[id],
          },
        },
      ]
    })

    //Mock pushTransaction
    mock.onPost(/\/push\/transaction/).reply(function () {
      return [200, { data: { transaction_hash: 'TEST_OK' } }]
    })
  },
}
