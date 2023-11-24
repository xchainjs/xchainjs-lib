import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{{midgard}}/v2/pools
    mock.onGet(/\/v2\/pools/).reply(() => {
      const resp = require(`./responses/pools.json`)
      return [200, resp]
    })
  },
}
