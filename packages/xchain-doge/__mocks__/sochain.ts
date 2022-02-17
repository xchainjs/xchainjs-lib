import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    //Mock address
    mock.onGet(/\/address\//).reply(function (config: MockConfig) {
      const id: string = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/addresses/${id}.json`)
      return [200, resp]
    })

    //Mock get_tx
    mock.onGet(/\/get_tx\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/tx/${id}.json`)
      return [200, resp]
    })

    //Mock get_address_balance
    mock.onGet(/\/get_address_balance\//).reply(function (config: MockConfig) {
      const id = config.url?.split('/').pop() ?? ''
      const resp = require(`./response/balances/${id}.json`)
      return [200, resp]
    })

    //Mock get_unspent_txs
    mock.onGet(/\/get_tx_unspent\//).reply(function (config: MockConfig) {
      const split = config.url?.split('/')

      //the address is always the 7th, the optional 8th param would be starting from txid to allow paging
      const address = split?.[7] || ''
      const startingfromTxId = split?.length == 9 ? split?.[8] : ''

      let filePath = `./response/unspent-txs/${address}.json`
      if (startingfromTxId) {
        // this allows you to page utxos starting from a given txid
        filePath = `./response/unspent-txs/${address}/${startingfromTxId}.json`
      }
      const resp = require(filePath)
      return [200, resp]
    })

    //Mock ltc node send tx
    mock.onPost(/https:\/\/testnet.ltc.thorchain.info/).reply(function () {
      return [
        200,
        {
          id: '1',
          result: 'TEST_OK',
          error: null,
        },
      ]
    })
  },
}
