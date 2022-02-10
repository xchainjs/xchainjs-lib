import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{haskoinurl}/{btc|btctest}/address/{address}/balance
    mock.onGet(/\/address\/\w+\/balance/).reply((config: MockConfig) => {
      const address = config.url?.split('/')?.[6] ?? ''
      const resp = require(`./response/balances/haskoin-${address}.json`)
      return [200, resp]
    })
    //Mock POST https://{haskoinurl}/{btc|btctest}/transactions
    mock.onPost(/\/transactions/).reply(() => [200, { txid: 'mock-txid' }])
  },
}
