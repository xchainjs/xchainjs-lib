import mock from '../axios-adapter'

const importjson = async (file) => (await import(file, { with: { type: 'json' } })).default

export default {
  restore: mock.restore,
  init: () => {
    // Mimir
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      const resp = await importjson(`./responses/mimir.json`)
      return [200, resp]
    })
    // Inbound addresses
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(async () => {
      const resp = await importjson(`./responses/inbound-addresses.json`)
      return [200, resp]
    })
    // Quote swap
    mock.onGet(/\/mayachain\/quote/).reply(async (config) => {
      const parsedUrl = new URL(`${config.url}`)
      const from_asset = parsedUrl.searchParams.get('from_asset') ?? ''
      const to_asset = parsedUrl.searchParams.get('to_asset') ?? ''
      if (from_asset === 'THOR.RUNE' && to_asset === 'BTC.BTC') {
        const resp = await importjson(`./responses/quote-swap.json`)
        return [200, resp]
      }
      if (from_asset === 'ETH.ETH' && to_asset === 'BTC.BTC') {
        const resp = await importjson(`./responses/quote-sswap.json`)
        return [200, resp]
      }
      return [200, {}]
    })
    // Latest block
    mock.onGet(/\/mayachain\/lastblock/).reply(async () => {
      const resp = await importjson(`./responses/latestBlock.json`)
      return [200, resp]
    })
    // Gas rates mock for ETH
    mock.onGet(/api\.etherscan\.io.*gastracker/).reply(() => {
      return [200, {
        status: "1",
        message: "OK",
        result: {
          SafeGasPrice: "10",
          ProposeGasPrice: "15",
          FastGasPrice: "20"
        }
      }]
    })
  },
}
