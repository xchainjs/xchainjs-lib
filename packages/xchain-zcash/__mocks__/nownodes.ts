import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/api\/v2\/address\/[^/]+/).reply(() => {
      const resp = require('./response/nownodes/get-txs.json')
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/tx\/[^/]+/).reply(() => {
      const resp = require('./response/nownodes/get-tx.json')
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/txs\/[^/]+/).reply(() => {
      const resp = require('./response/nownodes/get-txs.json')
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/utxo\/[^/]+/).reply(() => {
      const resp = require('./response/nownodes/get-utxos.json')
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/sendtx\/[^/]+/).reply(() => {
      const resp = require('./response/nownodes/broadcast.json')
      return [200, resp]
    })
  },
}
