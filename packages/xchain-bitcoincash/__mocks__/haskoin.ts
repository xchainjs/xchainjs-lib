import mock from './axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{haskoinurl}/{bch|bchtest}/address/{address}/balance
    mock.onGet(/\/address\/\w+\/balance/).reply((config: MockConfig) => {
      const address = config.url?.split('/')?.[5] ?? ''
      const resp = require(`./response/balances/${address}.json`)
      return [200, resp]
    }),
      //Mock GET https://{haskoinurl}/{bch|bchtest}/transaction/{hash}/raw
      mock.onGet(/\/transaction\/\w+\/raw/).reply((config: MockConfig) => {
        const id = config.url?.split('/')?.[5] ?? ''
        const resp = require(`./response/txs/raw-${id}.json`)
        return [200, resp]
      }),
      //Mock GET https://{haskoinurl}/{bch|bchtest}/address/{address}/unspent
      mock.onGet(/\/address\/\w+\/unspent/).reply((config: MockConfig) => {
        const address = config.url?.split('/')?.[5] ?? ''
        const resp = require(`./response/balances/unspent-${address}.json`)
        return [200, resp]
      }),
      //Mock GET https://{haskoinurl}/{bch|bchtest}/address/{address}/transactions/full
      mock.onGet(/\/address\/\w+\/transactions\/full/).reply((config: MockConfig) => {
        const address = config.url?.split('/')?.[5] ?? ''
        const resp = require(`./response/txs/full-${address}.json`)
        return [200, resp]
      }),
      //Mock GET https://{haskoinurl}/{bch|bchtest}/transactioin/{id}
      mock.onGet(/\/transaction\/\w+/).reply((config: MockConfig) => {
        const id = config.url?.split('/')?.[5] ?? ''
        const resp = require(`./response/txs/${id}.json`)
        return [200, resp]
      }),
      //Mock POST https://{haskoinurl}/{btc|btctest}/transactions
      mock.onPost(/\/transactions/).reply(() => [200, { txid: 'mock-txid-haskoin' }])
  },
}
