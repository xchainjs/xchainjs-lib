import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/mayachain\/quote\/swap/).reply(async () => {
      return [200, require('./responses/quoteSwap.json')]
    })
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(async () => {
      return [200, require('./responses/inboundAddresses.json')]
    })
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      return [200, require('./responses/mimir.json')]
    })
  },
}
