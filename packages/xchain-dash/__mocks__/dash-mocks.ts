import MockAdapter from "axios-mock-adapter";
import axios from "axios";

type MockConfig = {
  url?: string
}

const axiosMockAdapter = new MockAdapter(axios)

const mocks = {
  restore: axiosMockAdapter.restore,
  mockThorchain: () => {
    axiosMockAdapter.onGet(/testnet(.*)\/thorchain\/inbound_addresses/).reply(() => {
      const resp = require(`./response/thornode-testnet-inbound-addresses.json`)
      return [200, resp]
    })

    axiosMockAdapter.onGet(/\/inbound_addresses/).reply(() => {
      const resp = require(`./response/thornode-mainnet-inbound-addresses.json`)
      return [200, resp]
    })
  },
  mockBitgo: () => {
    axiosMockAdapter.onGet('https://app.bitgo.com/api/v2/dash/tx/fee').reply(() => [
      200,
      {
        feePerKb: 10000,
        numBlocks: 2
      }
    ])
  },
  mockInsight: () => {
    const getAddressPattern = /insight-api\/addr\/(\w+)$/
    axiosMockAdapter.onGet(getAddressPattern).reply((config: MockConfig) => {
      const address = config.url?.match(getAddressPattern)?.[1]
      const resp = require(`./response/insight-addr-${address?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getAddressUnspentTransactionsPattern = /insight-api\/addr\/(\w+)\/utxo$/
    axiosMockAdapter.onGet(getAddressUnspentTransactionsPattern).reply((config: MockConfig) => {
      const address = config.url?.match(getAddressUnspentTransactionsPattern)?.[1]
      const resp = require(`./response/insight-addr-utxos-${address?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getAddressTransactionsPattern = /insight-api\/txs\?address=(\w+)/
    axiosMockAdapter.onGet(getAddressTransactionsPattern).reply((config: MockConfig) => {
      const address = config.url?.match(getAddressTransactionsPattern)?.[1]
      const resp = require(`./response/insight-txs-${address?.substr(0, 4)}.json`)
      return [200, resp]
    })

    const getTransactionPattern = /insight-api\/tx\/(\w+)/
    axiosMockAdapter.onGet(getTransactionPattern).reply((config: MockConfig) => {
      const txid = config.url?.match(getTransactionPattern)?.[1]
      const resp = require(`./response/insight-tx-${txid?.substr(0, 4)}.json`)
      return [200, resp]
    })
  },
  mockDashNode: () => {
    axiosMockAdapter.onPost(/dash\.thorchain\.info/).reply(() => [
      200,
      {
        id: '1',
        result: 'mock-txid-thorchain-node',
        error: null,
      },
    ])
  },
  init: () => {
    mocks.mockDashNode()
    mocks.mockThorchain()
    mocks.mockBitgo()
    mocks.mockInsight()
  }
}

export default mocks
