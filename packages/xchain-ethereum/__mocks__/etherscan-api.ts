import nock from 'nock'

export const mock_etherscan_api = (url: string, method: string, result: string) => {
  nock(url)
    .get(`/api`)
    .query(param => param.module === 'proxy' && param.action === method)
    .reply(200, {
      jsonrpc: '2.0',
      result,
      id: 1,
    })
}

export const mock_etherscan_balance_api = (url: string, result: string) => {
  nock(url)
    .get(`/api`)
    .query(param => {
      return param.module === 'account' && param.action === 'balance'
    })
    .reply(200, {
      status: "1",
      message: "OK",
      result,
    })
}
