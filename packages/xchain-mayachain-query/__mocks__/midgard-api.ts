import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/v2\/actions/).reply(async () => {
      const resp = (await import(`./responses/midgard/actions.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/v2\/pools/).reply(async () => {
      const resp = (await import(`./responses/midgard/pools.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/v2\/mayaname\/lookup\/eld/).reply(async () => {
      const resp = (await import(`./responses/midgard/mayaname.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/v2\/mayaname\/rlookup\/maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn/).reply(async () => {
      const resp = (await import(`./responses/midgard/owner.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
