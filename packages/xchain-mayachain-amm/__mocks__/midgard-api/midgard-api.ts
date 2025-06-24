import mock from '../axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    // MAYAName details
    mock.onGet(/\/v2\/mayaname\/lookup\/\w+/).reply(async (config: MockConfig) => {
      const mayaname = config.url?.split('/')?.[6] ?? ''
      if (mayaname === 'eld') {
        const resp = (await import(`./responses/mayaname-details.json`, { with: { type: 'json' } })).default
        return [200, resp]
      }
      return [404, 'Not found']
    })
    mock.onGet(/\/v2\/mayaname\/rlookup\/maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09/).reply(async () => {
      const resp = (await import(`./responses/owner.json`, { with: { type: 'json' } })).default
      return [200, resp]
    })
  },
}
