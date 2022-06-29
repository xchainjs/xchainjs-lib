import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock midgard pools
    mock.onGet(/\/pools/).reply(function () {
      const resp = require(`./responses/migard/pools.json`)
      return [200, resp]
    })
  },
}
