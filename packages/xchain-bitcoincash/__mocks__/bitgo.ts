import mock from './axios-adapter'

export default {
  restore: mock.restore,
  init: () => {
    mock.onGet('https://app.bitgo.com/api/v2/bch/tx/fee').reply(async () => {
      return [
        200,
        {
          feePerKb: 2000,
          numBlocks: 2,
        },
      ]
    })
  },
}
