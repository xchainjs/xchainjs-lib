import mock, { importjson } from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/mayachain\/quote/).reply(async (config) => {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''

      // Should fetch BTC to ETH swap
      if (from_asset === 'BTC.BTC' && to_asset === 'ETH.ETH') {
        const resp = await importjson(`./responses/mayanode/QuoteSwapBtcEth.json`)
        return [200, resp]
      }

      // Should fetch RUNE to BTC swap
      if (from_asset === 'THOR.RUNE' && to_asset === 'BTC.BTC') {
        const resp = await importjson(`./responses/mayanode/QuoteSwapRuneBtc.json`)
        return [200, resp]
      }

      if (from_asset === 'ETH.ETH' && to_asset === 'BTC.BTC') {
        const resp = await importjson(`./responses/mayanode/QuoteSSwapEthBtc.json`)
        return [200, resp]
      }

      return [200, {}]
    })
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      const resp = await importjson(`./responses/mayanode/mimir.json`)
      return [200, resp]
    })
    mock.onGet(/\/mayachain\/lastblock/).reply(async () => {
      const resp = await importjson(`./responses/mayanode/latestBlock.json`)
      return [200, resp]
    })
  },
}
