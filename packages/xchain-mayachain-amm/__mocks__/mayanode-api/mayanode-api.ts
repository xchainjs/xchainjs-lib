import mock from '../axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    // Mimir
    mock.onGet(/\/mayachain\/mimir/).reply(() => {
      const resp = require(`./responses/mimir.json`)
      return [200, resp]
    })
    // Inbound addresses
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(() => {
      const resp = require(`./responses/inbound-addresses.json`)
      return [200, resp]
    })
    // Quote swap
    mock.onGet(/\/mayachain\/quote/).reply(() => {
      const resp = require(`./responses/quote-swap.json`)
      return [200, resp]
    })
    // Latest block
    mock.onGet(/\/mayachain\/lastblock/).reply(() => {
      const resp = require(`./responses/latestBlock.json`)
      return [200, resp]
    })
  },
}
