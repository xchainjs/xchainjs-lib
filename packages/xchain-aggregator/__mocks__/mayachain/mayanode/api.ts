import mock from '../../axios-adapter'

const importjson = async (file) => (await import(file, { with: { type: 'json' } })).default

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/mayachain\/quote\/swap/).reply(async () => {
      return [200, await importjson('./responses/quoteSwap.json')]
    })
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(async () => {
      return [200, await importjson('./responses/inboundAddresses.json')]
    })
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      return [200, await importjson('./responses/mimir.json')]
    })
  },
}
