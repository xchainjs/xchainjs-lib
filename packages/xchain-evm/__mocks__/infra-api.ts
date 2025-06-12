import mock from './axios-adapter'

export const mock_infra_api = (url: string, method: string, result: string | Record<string, unknown>) => {
  mock
    .onPost(url, (body: any) => {
      try {
        const parsedBody = typeof body === 'string' ? JSON.parse(body) : body
        return parsedBody.method === method
      } catch {
        return false
      }
    })
    .reply(200, {
      jsonrpc: '2.0',
      result,
      id: 1,
    })
}
