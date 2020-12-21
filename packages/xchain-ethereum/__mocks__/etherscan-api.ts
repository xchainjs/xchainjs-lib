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
