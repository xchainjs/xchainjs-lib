import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    mock.onGet(/\/api\/v2\/address\/[^/]+/).reply(async () => {
      const resp = (await import('./response/nownodes/get-txs.json', { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/tx\/[^/]+/).reply(async () => {
      const resp = (await import('./response/nownodes/get-tx.json', { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/txs\/[^/]+/).reply(async () => {
      const resp = (await import('./response/nownodes/get-txs.json', { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/utxo\/[^/]+/).reply(async () => {
      const resp = (await import('./response/nownodes/get-utxos.json', { with: { type: 'json' } })).default
      return [200, resp]
    })
    mock.onGet(/\/api\/v2\/sendtx\/[^/]+/).reply(async () => {
      const resp = (await import('./response/nownodes/broadcast.json', { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
