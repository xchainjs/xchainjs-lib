import mock, { importjson } from './axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{haskoinurl}/{btc|btctest}/address/{address}/balance
    mock.onGet(/\/address\/\w+\/balance/).reply(async (config: MockConfig) => {
      const address = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/balances/${address}.json`)
      return [200, resp]
    })
    //Mock Get utxo's
    mock.onGet(/\/address\/\w+\/unspent/).reply(async (config: MockConfig) => {
      const address = config.url?.split('/')?.[5] ?? ''
      const resp = await importjson(`./response/unspent-txs/${address}.json`)
      return [200, resp]
    })
    //Mock POST https://{haskoinurl}/{btc|btctest}/transactions
    mock.onPost(/\/transactions/).reply(async () => [200, { txid: 'mock-txid' }])
  },
}
