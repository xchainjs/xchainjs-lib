import mock from './axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock addresses summary
    mock.onGet(/\/address_summary\//).reply(function (config: MockConfig) {
      const id: string = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/addresses/${id}.json`)
      return [200, resp]
    })

    //Mock get transaction data
    mock.onGet(/\/v3\/transaction\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/tx/${id}.json`)
      return [200, resp]
    })

    //Mock get addresses transactions
    mock.onGet(/\/v3\/transactions\//).reply(function (config: MockConfig) {
      const split = config.url?.split('/')
      const address = split?.[7] || ''
      const resp = require(`./response/txs/${address}.json`)
      return [200, resp]
    })

    //Mock get_address_balance
    mock.onGet(/\/balance\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/balances/${id}.json`)
      return [200, resp]
    })

    //Mock get_unspent_txs
    mock.onGet(/\/unspent_outputs\//).reply(function (config: MockConfig) {
      const split = config.url?.split('/')

      //the address is always the 7th, the optional 8th param would be starting from txid to allow paging
      const address = split?.[7] || ''
      const page = split?.length == 9 ? split?.[8] : ''

      let filePath = `./response/unspent-txs/${address}.json`
      if (page) {
        // this allows you to return utxos starting from a given page
        filePath = `./response/unspent-txs/${address}/${page}.json`
      }
      const resp = require(filePath)
      return [200, resp]
    })

    //Mock is_tx_confirmed
    mock.onGet(/\/is_tx_confirmed\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/is-tx-confirmed/${id}.json`)
      return [200, resp]
    })

    //Mock blockstream send tx
    mock.onPost(/\/transaction/).reply(function () {
      return [200, 'TEST_OK']
    })
    //
    //Mock thorchain/inbound_addresses
    mock.onGet(/\/thorchain\/inbound_addresses/).reply(function () {
      const resp = require(`./response/thornode/inbound_addresses.json`)
      return [200, resp]
    })

    //Mock thorchain/mimir
    mock.onGet(/\/thorchain\/mimir/).reply(function () {
      const resp = require(`./response/thornode/mimir.json`)
      return [200, resp]
    })
  },
}
