import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock getAddress
    mock.onGet(/\/dashboards\/address\//).reply(function (config: MockConfig) {
      const id: string = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/addresses/${id}.json`)
      return [200, { data: { [id]: resp } }]
    })

    //Mock getRawTx
    mock.onGet(/\/raw\/transaction\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/rawTransactions/${id}.json`)
      const result: any = { data: { [id]: resp } }
      return [200, result]
    })

    //Mock getStat
    mock.onGet(/\/stats/).reply(function () {
      const resp = require(`./response/litecoinStats.json`)
      return [200, { data: resp }]
    })

    //Mock getTx
    mock.onGet(/\/dashboards\/transaction\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/dashboardTransactions/${id}.json`)
      return [200, { data: { [id]: resp } }]
    })

    //Mock pushTransaction
    mock.onPost(/\/push\/transaction/).reply(function () {
      return [200, { data: { transaction_hash: 'TEST_OK' } }]
    })
  },
}
