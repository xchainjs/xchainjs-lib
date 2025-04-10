import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/api\/v2\/address\/[^/]+/).reply(() => {
      const resp = require('./response/nownodes/get-balance.json')
      return [200, resp]
    })
  },
}
