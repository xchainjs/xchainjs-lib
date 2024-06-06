import mock from './axios-adapter'

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/v2\/actions/).reply(function () {
      const resp = require(`./responses/midgard/actions.json`)
      return [200, resp]
    })
    mock.onGet(/\/v2\/mayaname\/lookup\/eld/).reply(function () {
      const resp = require(`./responses/midgard/mayaname.json`)
      return [200, resp]
    })
    mock.onGet(/\/v2\/mayaname\/rlookup\/maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn/).reply(function () {
      const resp = require(`./responses/midgard/owner.json`)
      return [200, resp]
    })
  },
}
