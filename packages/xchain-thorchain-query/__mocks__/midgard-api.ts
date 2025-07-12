import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    //Mock midgard pools
    mock.onGet(/\/v2\/pools/).reply(async () => {
      const resp = (await import(`./responses/midgard/pools.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/v2\/thorchain\/mimir/).reply(async () => {
      const resp = (await import(`./responses/mimir/mimirConstants.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/v2\/thorchain\/constants/).reply(async () => {
      const resp = (await import(`./responses/thorchain/thorchainConstants.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    //Mock thorchain/mimir
    mock.onGet(/\/v2\/thorchain\/queue/).reply(async () => {
      const resp = (await import(`./responses/thorchain/outboundQueue.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    //Mock midgard health
    mock.onGet(/\/v2\/health/).reply(async () => {
      const resp = (await import(`./responses/midgard/health.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    //Mock midgard actions
    mock.onGet(/\/v2\/actions?/).reply(async () => {
      const resp = (await import(`./responses/midgard/actions.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
