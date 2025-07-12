import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/pools/).reply(async () => {
      return [200, (await import('./responses/pools.json', { with: { type: 'json' } })).default]
    })
    mock.onGet(/\/thorchain\/quote\/swap/).reply(async (config) => {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''
      if (from_asset === 'AVAX~AVAX' && to_asset === 'ETH~ETH') {
        return [200, (await import(`./responses/tradeSwap.json`, { with: { type: 'json' } })).default]
      }
      if (from_asset === 'BTC.BTC' && to_asset === 'ETH.ETH') {
        return [200, (await import('./responses/quoteSwap.json', { with: { type: 'json' } })).default]
      }
      return [500, { error: 'Not found' }]
    })
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(async () => {
      return [200, (await import('./responses/inboundAddresses.json', { with: { type: 'json' } })).default]
    })
    mock.onGet(/\/thorchain\/mimir/).reply(async () => {
      return [200, (await import('./responses/mimir.json', { with: { type: 'json' } })).default]
    })
  },
}
