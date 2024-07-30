import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/mayachain\/quote/).reply(function (config) {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''

      // Should fetch BTC to ETH swap
      if (from_asset === 'BTC.BTC' && to_asset === 'ETH.ETH') {
        const resp = require(`./responses/mayanode/QuoteSwapBtcEth.json`)
        return [200, resp]
      }

      // Should fetch RUNE to BTC swap
      if (from_asset === 'THOR.RUNE' && to_asset === 'BTC.BTC') {
        const resp = require(`./responses/mayanode/QuoteSwapRuneBtc.json`)
        return [200, resp]
      }

      if (from_asset === 'ETH.ETH' && to_asset === 'BTC.BTC') {
        const resp = require(`./responses/mayanode/QuoteSSwapEthBtc.json`)
        return [200, resp]
      }

      return [200, {}]
    })
    mock.onGet(/\/mayachain\/mimir/).reply(function () {
      const resp = require(`./responses/mayanode/mimir.json`)
      return [200, resp]
    })
    mock.onGet(/\/mayachain\/lastblock/).reply(function () {
      const resp = require(`./responses/mayanode/latestBlock.json`)
      return [200, resp]
    })
  },
}
