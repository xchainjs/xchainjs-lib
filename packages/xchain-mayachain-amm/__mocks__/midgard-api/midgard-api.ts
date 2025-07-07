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
        const resp = require(`./responses/mayaname-details.json`)
        return [200, resp]
      }
      return [404, 'Not found']
    })
    mock.onGet(/\/v2\/mayaname\/rlookup\/maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09/).reply(async () => {
      const resp = require(`./responses/owner.json`)
      return [200, resp]
    })
  },
}
