import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock testnet thorchain/inbound_addresses
    mock.onGet(/testnet(.*)\/thorchain\/inbound_addresses/).reply(function () {
      const resp = require(`./response/inbound_addresses/testnet.json`)
      return [200, resp]
    })

    // inbound_addresses
    mock.onGet(/\/inbound_addresses/).reply(() => {
      const resp = require(`./response/inbound_addresses/mainnet.json`)
      return [200, resp]
    })

    //Mock thorchain/mimir
    mock.onGet(/\/thorchain\/mimir/).reply(function () {
      const resp = require(`./response/thornode/mimir.json`)
      return [200, resp]
    })

    // Mock ltc node send tx
    mock.onPost(/ltc.thorchain.info/).reply((req) => {
      console.log(req.headers)
      return [
        200,
        {
          id: '1',
          result: 'mock-txid',
          error: null,
        },
      ]
    })
  },
}
