import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

type MockConfig = {
  url?: string
}

const axiosMockAdapter = new MockAdapter(axios)

const mocks = {
  restore: axiosMockAdapter.restore,
  mockThorchain: () => {
    axiosMockAdapter.onGet(/testnet(.*)\/thorchain\/inbound_addresses/).reply(async () => {
      const resp = (await import(`./response/thornode-testnet-inbound-addresses.json`, { with: { type: 'json' } }))
        .default
      return [200, resp]
    })

    axiosMockAdapter.onGet(/\/inbound_addresses/).reply(async () => {
      const resp = (await import(`./response/thornode-mainnet-inbound-addresses.json`, { with: { type: 'json' } }))
        .default
      return [200, resp]
    })
  },
  mockBitgo: () => {
    axiosMockAdapter.onGet('https://app.bitgo.com/api/v2/dash/tx/fee').reply(async () => [
      200,
      {
        feePerKb: 10000,
        numBlocks: 2,
      },
    ])
  },
  mockInsight: () => {
    const getAddressPattern = /insight-api\/addr\/(\w+)$/
    axiosMockAdapter.onGet(getAddressPattern).reply(async (config: MockConfig) => {
      const address = config.url?.match(getAddressPattern)?.[1]
      const resp = (await import(`./response/insight-addr-${address?.substr(0, 4)}.json`, { with: { type: 'json' } }))
        .default
      return [200, resp]
    })

    const getAddressUnspentTransactionsPattern = /insight-api\/addr\/(\w+)\/utxo$/
    axiosMockAdapter.onGet(getAddressUnspentTransactionsPattern).reply(async (config: MockConfig) => {
      const address = config.url?.match(getAddressUnspentTransactionsPattern)?.[1]
      const resp = (
        await import(`./response/insight-addr-utxos-${address?.substr(0, 4)}.json`, { with: { type: 'json' } })
      ).default
      return [200, resp]
    })

    const getAddressTransactionsPattern = /insight-api\/txs\?address=(\w+)/
    axiosMockAdapter.onGet(getAddressTransactionsPattern).reply(async (config: MockConfig) => {
      const address = config.url?.match(getAddressTransactionsPattern)?.[1]
      const resp = (await import(`./response/insight-txs-${address?.substr(0, 4)}.json`, { with: { type: 'json' } }))
        .default
      return [200, resp]
    })

    const getTransactionPattern = /insight-api\/tx\/(\w+)/
    axiosMockAdapter.onGet(getTransactionPattern).reply(async (config: MockConfig) => {
      const txid = config.url?.match(getTransactionPattern)?.[1]
      const resp = (await import(`./response/insight-tx-${txid?.substr(0, 4)}.json`, { with: { type: 'json' } }))
        .default
      return [200, resp]
    })
  },
  mockDashNode: () => {
    axiosMockAdapter.onPost(/dash\.thorchain\.info/).reply(async () => [
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
  },
}

export default mocks
