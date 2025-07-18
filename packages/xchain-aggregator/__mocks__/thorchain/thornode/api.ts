import mock from '../../axios-adapter'

const importjson = async (file) => (await import(file, { with: { type: 'json' } })).default

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/pools/).reply(async () => {
      return [200, await importjson('./responses/pools.json')]
    })
    mock.onGet(/\/thorchain\/quote\/swap/).reply(async (config) => {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''
      if (from_asset === 'AVAX~AVAX' && to_asset === 'ETH~ETH') {
        return [200, await importjson(`./responses/tradeSwap.json`)]
      }
      if (from_asset === 'BTC.BTC' && to_asset === 'ETH.ETH') {
        return [200, await importjson('./responses/quoteSwap.json')]
      }
      return [500, { error: 'Not found' }]
    })
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(async () => {
      return [200, await importjson('./responses/inboundAddresses.json')]
    })
    mock.onGet(/\/thorchain\/mimir/).reply(async () => {
      return [200, await importjson('./responses/mimir.json')]
    })
  },
}
