import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet('https://midgard.ninerealms.com/v2/pools').reply(function () {
      return [200, require('./responses/pools.json')]
    })
    mock.onGet(/\/v2\/actions?/).replyOnce(function () {
      const resp = require(`./responses/actions.json`)
      return [200, resp]
    })
  },
}
