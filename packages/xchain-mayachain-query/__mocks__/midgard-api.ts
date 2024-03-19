import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/v2\/actions/).reply(function () {
      const resp = require(`./responses/midgard/actions.json`)
      return [200, resp]
    })
  },
}
