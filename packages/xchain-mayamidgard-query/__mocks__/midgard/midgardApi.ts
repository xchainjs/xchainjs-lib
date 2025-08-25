import mock, { importjson } from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{{midgard}}/v2/pools
    mock.onGet(/\/v2\/pools/).reply(async () => {
      const resp = await importjson(`./responses/pools.json`)
      return [200, resp]
    })
    mock.onGet(/\/v2\/actions/).reply(async () => {
      const resp = await importjson(`./responses/actions.json`)
      return [200, resp]
    })
  },
}
