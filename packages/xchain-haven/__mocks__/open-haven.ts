import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    //Mock login
    mock.onPost(/\/login\//).reply(function () {
      const resp = require(`./response/login.json`)
      return [200, resp]
    })

    //Mock get_address_info
    mock.onPost(/\/get_address_info\//).reply(function () {
      const resp = require(`./response/get_address_info.json`)
      return [200, resp]
    })

    //Mock get_address_txs
    mock.onPost(/\/get_address_txs\//).reply(function () {
      const resp = require(`./response/get_address_txs.json`)
      return [200, resp]
    })

    //Mock get_unspent_outs
    mock.onPost(/\/get_unspent_outs\//).reply(function () {
      const resp = require(`./response/get_unspent_outs.json`)
      return [200, resp]
    })

    //Mock get_random_outs
    mock.onPost(/\/get_random_outs\//).reply(function () {
      const resp = require(`./response/get_random_outs.json`)
      return [200, resp]
    })

    //Mock submit tx
    mock.onPost(/\/submit_raw_tx/).reply(function () {
      return [200, null]
    })

    //Mock submit tx
    mock.onPost(/\/ping/).reply(function () {
      const resp = require(`./response/ping.json`)
      return [200, resp]
    })
  },
}
