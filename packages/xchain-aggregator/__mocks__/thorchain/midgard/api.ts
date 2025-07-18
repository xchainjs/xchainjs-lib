import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/v2\/pools/).reply(async () => {
      return [200, require('./responses/pools.json')]
    })
    mock.onGet(/\/v2\/actions?/).replyOnce(async () => {
      const resp = require(`./responses/actions.json`)
      return [200, resp]
    })
  },
}
