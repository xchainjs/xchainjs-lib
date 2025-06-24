import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{{bitgourl}}/api/v2/{{coin}}/tx/fee
    mock.onGet(/\/api\/v2\/\w+\/tx\/fee/).reply(async () => {
      const resp = (await import(`./response/bitgo/get-fee-estimate.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
