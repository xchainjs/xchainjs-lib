import mock from '../../axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/mayachain\/quote\/swap/).reply(function () {
      return [200, require('./responses/quoteSwap.json')]
    })
  },
}
