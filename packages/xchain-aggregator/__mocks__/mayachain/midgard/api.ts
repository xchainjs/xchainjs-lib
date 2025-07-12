import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/v2\/pools/).reply(async () => {
      return [200, (await import('./responses/pools.json', { with: { type: 'json' } })).default]
    })
    mock.onGet(/\/v2\/actions?/).replyOnce(async () => {
      const resp = (await import(`./responses/actions.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
