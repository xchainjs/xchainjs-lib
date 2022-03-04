import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    // inbound_addresses
    mock.onGet(/\/inbound_addresses/).reply(() => {
      const resp = require(`./response/inbound_addresses/mainnet.json`)
      return [200, resp]
    })

    // Mock ltc node send tx
    mock.onPost(/ltc.thorchain.info/).reply(() => [
      200,
      {
        id: '1',
        result: 'mock-txid',
        error: null,
      },
    ])
  },
}
