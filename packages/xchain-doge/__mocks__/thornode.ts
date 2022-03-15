import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock thorchain/inbound_addresses
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(function () {
      const resp = require(`./response/thornode/inbound_addresses.json`)
      return [200, resp]
    })
  },
}
