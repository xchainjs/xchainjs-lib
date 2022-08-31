import MockAdapter from "axios-mock-adapter";

type MockConfig = {
  url?: string
}

export default (mock: MockAdapter) => ({
  restore: mock.restore,
  init: () => {
    const getAddressPattern = /insight-api\/addr\/(\w+)$/
    mock.onGet(getAddressPattern).reply((config: MockConfig) => {
      const address = config.url?.match(getAddressPattern)?.[1]
      const resp = require(`./response/insight-addr-${address?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getAddressUnspentTransactionsPattern = /insight-api\/addr\/(\w+)\/utxo$/
    mock.onGet(getAddressUnspentTransactionsPattern).reply((config: MockConfig) => {
      const address = config.url?.match(getAddressUnspentTransactionsPattern)?.[1]
      const resp = require(`./response/insight-addr-utxos-${address?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getAddressTransactionsPattern = /insight-api\/txs\?address=(\w+)/
    mock.onGet(getAddressTransactionsPattern).reply((config: MockConfig) => {
      const address = config.url?.match(getAddressTransactionsPattern)?.[1]
      const resp = require(`./response/insight-txs-${address?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getTransactionPattern = /insight-api\/tx\/(\w+)/
    mock.onGet(getTransactionPattern).reply((config: MockConfig) => {
      const txid = config.url?.match(getTransactionPattern)?.[1]
      const resp = require(`./response/insight-tx-${txid?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getRawTransactionPattern = /insight-api\/rawtx\/(\w+)/
    mock.onGet(getRawTransactionPattern).reply((config: MockConfig) => {
      const txid = config.url?.match(getRawTransactionPattern)?.[1]
      const resp = require(`./response/insight-rawtx-${txid?.substr(0, 4)}.json`)
      return [200, resp]
    })
  },
})
