import mock from '../axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    // Mimir
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      const resp = (await import(`./responses/mimir.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    // Inbound addresses
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(async () => {
      const resp = (await import(`./responses/inbound-addresses.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    // Quote swap
    mock.onGet(/\/mayachain\/quote/).reply(async (config) => {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''
      if (from_asset === 'THOR.RUNE' && to_asset === 'BTC.BTC') {
        const resp = (await import(`./responses/quote-swap.json`, { with: { type: 'json' } })).default
        return [200, resp]
      }
      if (from_asset === 'ETH.ETH' && to_asset === 'BTC.BTC') {
        const resp = (await import(`./responses/quote-sswap.json`, { with: { type: 'json' } })).default
        return [200, resp]
      }
      return [200, {}]
    })
    // Latest block
    mock.onGet(/\/mayachain\/lastblock/).reply(async () => {
      const resp = (await import(`./responses/latestBlock.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
