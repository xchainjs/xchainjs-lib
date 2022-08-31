import MockAdapter from "axios-mock-adapter";

export default (mock: MockAdapter) => ({
  restore: mock.restore,
  init: () => {
    mock.onGet(/testnet(.*)\/thorchain\/inbound_addresses/).reply(() => {
      const resp = require(`./response/thornode-testnet-inbound-addresses.json`)
      return [200, resp]
    })

    mock.onGet(/\/inbound_addresses/).reply(() => {
      const resp = require(`./response/thornode-mainnet-inbound-addresses.json`)
      return [200, resp]
    })

    mock.onGet(/\/thorchain\/mimir/).reply(() => {
      const resp = require(`./response/thornode-mimir.json`)
      return [200, resp]
    })

    mock.onPost(/dash\.thorchain\.info/).reply(() => [
      200,
      {
        id: '1',
        result: 'mock-txid-thorchain-node',
        error: null,
      },
    ])

    mock.onGet('https://app.bitgo.com/api/v2/dash/tx/fee').reply(() => [
      200,
      {
        feePerKb: 10000,
        numBlocks: 2
      }
    ])
  },
})
