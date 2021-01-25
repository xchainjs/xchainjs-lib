import nock from 'nock'

export const mock_infra_api = (url: string, method: string, result: string | Object) => {
  nock(url)
    .post(_ => true, body => body.method === method)
    .reply(200, {
      jsonrpc: '2.0',
      result,
      id: 1,
    })
}
