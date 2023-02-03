import mock from './axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock address
    mock.onGet(/\/address_summary\//).reply(function (config: MockConfig) {
      const id: string = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/addresses/${id}.json`)
      return [200, resp]
    })

    //Mock get transaction data
    mock.onGet(/\/transaction\//).reply(function (config: MockConfig) {
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

    //Mock get balance for address
    mock.onGet(/\/balance\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/balances/${id}.json`)
      return [200, resp]
    })

    //Mock get_unspent_txs
    mock.onGet(/\/v3\/unspent_outputs\//).reply(function (config: MockConfig) {
      const split = config.url?.split('/')

      //the address is always the 7th, the optional 8th param would be starting from txid to allow paging
      const address = split?.[7] || ''
      const startingfrompage = split?.length == 9 ? split?.[8] : ''
      let filePath = `./response/unspent-txs/${address}.json`
      if (startingfrompage) {
        // this allows you to page utxos starting from a given txid
        filePath = `./response/unspent-txs/${address}/${startingfrompage}.json`
      }
      const resp = require(filePath)
      return [200, resp]
    })

    // Mock broad cast tx
    mock.onPost(/\/v3\/broadcast_transaction\//).reply(function () {
      return [
        200,
        {
          data: {
            network: 'DOGE',
            txid: 'mock-txid-sochain',
          },
        },
      ]
    })
  },
}
