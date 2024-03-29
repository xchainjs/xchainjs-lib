import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/pools/).reply(function () {
      return [200, require('./responses/pools.json')]
    })
    mock.onGet(/\/thorchain\/quote\/swap/).reply(function () {
      return [200, require('./responses/quoteSwap.json')]
    })
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(function () {
      return [200, require('./responses/inboundAddresses.json')]
    })
    mock.onGet(/\/thorchain\/mimir/).reply(function () {
      return [200, require('./responses/mimir.json')]
    })
  },
}
