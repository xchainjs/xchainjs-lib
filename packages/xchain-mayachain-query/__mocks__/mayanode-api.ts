import mock from './axios-adapter'

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
        const resp = (await import(`./responses/mayanode/QuoteSwapBtcEth.json`, { with: { type: 'json' } })).default
        return [200, resp]
      }

      // Should fetch RUNE to BTC swap
      if (from_asset === 'THOR.RUNE' && to_asset === 'BTC.BTC') {
        const resp = (await import(`./responses/mayanode/QuoteSwapRuneBtc.json`, { with: { type: 'json' } })).default
        return [200, resp]
      }

      if (from_asset === 'ETH.ETH' && to_asset === 'BTC.BTC') {
        const resp = (await import(`./responses/mayanode/QuoteSSwapEthBtc.json`, { with: { type: 'json' } })).default
        return [200, resp]
      }

      return [200, {}]
    })
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      const resp = (await import(`./responses/mayanode/mimir.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/mayachain\/lastblock/).reply(async () => {
      const resp = (await import(`./responses/mayanode/latestBlock.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
