import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    //Mock midgard pools
    mock.onGet(/\/v2\/pools/).reply(function () {
      const resp = require(`./responses/midgard/pools.json`)
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/v2\/thorchain\/mimir/).reply(function () {
      const resp = require(`./responses/mimir/mimirConstants.json`)
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/v2\/thorchain\/constants/).reply(function () {
      const resp = require(`./responses/thorchain/thorchainConstants.json`)
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/v2\/thorchain\/queue/).reply(function () {
      const resp = require(`./responses/thorchain/outboundQueue.json`)
      return [200, resp]
    })
    //Mock midgard health
    mock.onGet(/\/v2\/health/).reply(function () {
      const resp = require(`./responses/midgard/health.json`)
      return [200, resp]
    })
    //Mock midgard actions
    mock.onGet(/\/v2\/actions?/).reply(function () {
      const resp = require(`./responses/midgard/health.json`)
      console.log(`actions`)
      return [200, resp]
    })
  },
}
