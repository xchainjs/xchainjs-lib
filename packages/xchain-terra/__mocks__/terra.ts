import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock https://bombay-fcd.terra.dev/v1/txs/gas_prices
    mock.onGet(/\/txs\/gas_prices/).reply(function () {
      const resp = require(`./response/terra/gas.json`)
      return [200, resp]
    })
  },
}
