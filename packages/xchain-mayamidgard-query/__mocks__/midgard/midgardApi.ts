import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{{midgard}}/v2/pools
    mock.onGet(/\/v2\/pools/).reply(async () => {
      const resp = (await import(`./responses/pools.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/v2\/actions/).reply(async () => {
      const resp = (await import(`./responses/actions.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
