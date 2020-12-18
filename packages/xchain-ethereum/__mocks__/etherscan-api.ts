import nock from 'nock'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mock_eth_gasPrice = (url: string, result: any) => {
  nock(url)
    .get(`/api`)
    .query((param) => {
        console.log('here', param)
        return param.module === 'proxy' && param.action === 'eth_gasPrice'
    })
    .reply(200, {
      jsonrpc: '2.0',
      result,
      id: 73,
    })
}
