import mock, { importjson } from './axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{haskoinurl}/{bch|bchtest}/address/{address}/balance
    mock.onGet(/\/address\/\w+\/balance/).reply(async (config: MockConfig) => {
      const address = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/balances/${address}.json`)
      return [200, resp]
    })
    //Mock GET https://{haskoinurl}/{bch|bchtest}/transaction/{hash}/raw
    mock.onGet(/\/transaction\/\w+\/raw/).reply(async (config: MockConfig) => {
      const id = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/txs/raw-${id}.json`)
      return [200, resp]
    })
    //Mock GET https://{haskoinurl}/{bch|bchtest}/address/{address}/unspent
    mock.onGet(/\/address\/\w+\/unspent/).reply(async (config: MockConfig) => {
      const address = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/balances/unspent-${address}.json`)
      return [200, resp]
    })
    //Mock GET https://{haskoinurl}/{bch|bchtest}/address/{address}/transactions/full
    mock.onGet(/\/address\/\w+\/transactions\/full/).reply(async (config: MockConfig) => {
      const address = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/txs/full-${address}.json`)
      return [200, resp]
    })
    //Mock GET https://{haskoinurl}/{bch|bchtest}/transactioin/{id}
    mock.onGet(/\/transaction\/\w+/).reply(async (config: MockConfig) => {
      const id = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/txs/${id}.json`)
      return [200, resp]
    })
    //Mock POST https://{haskoinurl}/{btc|btctest}/transactions
    mock.onPost(/\/transactions/).reply(async () => [200, { txid: 'mock-txid-haskoin' }])
  },
}
