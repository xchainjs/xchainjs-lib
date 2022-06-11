import mock from './axios-adapter'

export default {
  restore: () => {
    mock.restore()
  },
  reset: () => {
    mock.reset()
  },
  resetHistory: () => {
    mock.resetHistory()
  },
  init: () => {
    //Mock login
    const login_uri = '/login'
    mock.onPost(new RegExp(`${login_uri}/*`)).reply(function () {
      const resp = require(`./response/login.json`)
      return [200, resp]
    })

    const get_version_uri = '/get_version'
    mock.onPost(new RegExp(`${get_version_uri}/*`)).reply(function () {
      const resp = require(`./response/get_version.json`)
      return [200, resp]
    })

    //Mock get_address_info
    const get_address_info_uri = '/get_address_info'
    mock.onPost(new RegExp(`${get_address_info_uri}/*`)).reply(function () {
      //simulate syncing behaviour, by increasing scanned_block_height on subsequent requests
      // this will only effect unit tests for syncing
      const numRequest = mock.history.post.filter((axiosConfig) => axiosConfig.url?.includes(get_address_info_uri))
        .length
      const resp = require(`./response/get_address_info.json`)
      //overriding scanned_block_height by number of requests to simulate backend syncing behaviour
      resp.scanned_block_height = Math.min(numRequest * 10000, resp.blockchain_height)

      return [200, resp]
    })

    //Mock get_address_txs
    const get_address_txs_uri = '/get_address_txs'
    mock.onPost(new RegExp(`${get_address_txs_uri}/*`)).reply(function () {
      const resp = require(`./response/get_address_txs.json`)
      return [200, resp]
    })

    //Mock get_tx
    const get_tx_uri = '/get_tx'
    mock.onPost(new RegExp(`${get_tx_uri}/*`)).reply(function () {
      const resp = require(`./response/get_tx.json`)
      return [200, resp]
    })

    //Mock get_unspent_outs
    const get_unspent_outs_uri = '/get_unspent_outs'
    mock.onPost(new RegExp(`${get_unspent_outs_uri}/*`)).reply(function () {
      const resp = require(`./response/get_unspent_outs.json`)
      return [200, resp]
    })

    //Mock get_random_outs
    const get_random_outs_uri = '/get_random_outs'
    mock.onPost(new RegExp(`${get_random_outs_uri}/*`)).reply(function () {
      const resp = require(`./response/get_random_outs.json`)
      return [200, resp]
    })

    //Mock submit tx
    const submit_raw_tx_uri = '/submit_raw_tx'
    mock.onPost(new RegExp(`${submit_raw_tx_uri}/*`)).reply(function () {
      return [200, null]
    })

    //Mock ping
    const ping_uri = '/ping'
    mock.onPost(new RegExp(`${ping_uri}/*`)).reply(function () {
      const resp = require(`./response/ping.json`)
      return [200, resp]
    })
  },
}
