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
    mock.onGet(/\/mayachain\/quote/).reply((config) => {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''
      if (from_asset === 'THOR.RUNE' && to_asset === 'BTC.BTC') {
        const resp = require(`./responses/quote-swap.json`)
        return [200, resp]
      }
      if (from_asset === 'ETH.ETH' && to_asset === 'BTC.BTC') {
        const resp = require(`./responses/quote-sswap.json`)
        return [200, resp]
      }
      return [200, {}]
    })
    // Latest block
    mock.onGet(/\/mayachain\/lastblock/).reply(() => {
      const resp = require(`./responses/latestBlock.json`)
      return [200, resp]
    })
  },
}
