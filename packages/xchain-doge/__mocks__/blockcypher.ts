import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    // Mock send tx
    mock.onPost(/\/txs\/push/).reply(function () {
      return [
        200,
        {
          tx: {
            hash: 'mock-txid-blockcypher',
          },
        },
      ]
    })
  },
}
