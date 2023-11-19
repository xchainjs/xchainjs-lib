import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock GET https://{{bitgourl}}/api/v2/{{coin}}/tx/fee
    mock.onGet(/\/api\/v2\/\w+\/tx\/fee/).reply(() => {
      const resp = require(`./response/bitgo/get-fee-estimate.json`)
      return [200, resp]
    })
  },
}
