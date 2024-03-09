import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/pools/).reply(function () {
      return [200, require('./responses/pools.json')]
    })
  },
}
