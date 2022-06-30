import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock midgard pools
    mock.onGet(/\/pools/).reply(function () {
      const resp = require(`./responses/midgard/pools.json`)
      return [200, resp]
    })
    //Mock thorchain/inbound_addresses
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(function () {
      const resp = require(`./responses/midgard/inbound_addresses.json`)
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/thorchain\/mimir/).reply(function () {
      const resp = require(`./responses/mimir/mimirConstants.json`)
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/thorchain\/constants/).reply(function () {
      const resp = require(`./responses/thorchain/thorchainConstants.json`)
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/thorchain\/queue/).reply(function () {
      const resp = require(`./responses/thorchain/outboundQueue.json`)
      return [200, resp]
    })
  },
}
