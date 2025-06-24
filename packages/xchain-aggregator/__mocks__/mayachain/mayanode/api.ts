import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/mayachain\/quote\/swap/).reply(async () => {
      return [200, (await import('./responses/quoteSwap.json', { with: { type: 'json' } })).default]
    })
    mock.onGet(/\/mayachain\/inbound_addresses/).reply(async () => {
      return [200, (await import('./responses/inboundAddresses.json', { with: { type: 'json' } })).default]
    })
    mock.onGet(/\/mayachain\/mimir/).reply(async () => {
      return [200, (await import('./responses/mimir.json', { with: { type: 'json' } })).default]
    })
  },
}
