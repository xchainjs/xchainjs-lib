import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock https://api.haskoin.com/haskoin-store/btc/address/{address}/balance
    mock.onGet(/\/address\/\w+\/balance/).reply((config: MockConfig) => {
      const address = config.url?.split('/')?.[6] ?? ''
      const resp = require(`./response/balances/haskoin-${address}.json`)
      return [200, resp]
    })
  },
}
