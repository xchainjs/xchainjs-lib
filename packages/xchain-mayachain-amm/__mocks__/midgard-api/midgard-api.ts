import mock from '../axios-adapter'

type MockConfig = {
  url?: string
}

export default {
  restore: mock.restore,
  init: () => {
    // MAYAName details
    mock.onGet(/\/v2\/mayaname\/lookup\/\w+/).reply((config: MockConfig) => {
      const mayaname = config.url?.split('/')?.[6] ?? ''
      if (mayaname === 'eld') {
        const resp = require(`./responses/mayaname-details.json`)
        return [200, resp]
      }
      return [404, 'Not found']
    })
  },
}
