import mock from '../../axios-adapter'

const importjson = async (file: string) => (await import(file, { with: { type: 'json' } })).default

export default {
  reset: mock.reset,
  restore: mock.restore,
  init: () => {
    mock.onGet(/v2\/pools/).reply(async () => {
      return [200, await importjson('./responses/pools.json')]
    })
    mock.onGet(/\/v2\/actions?/).replyOnce(async () => {
      const resp = await importjson(`./responses/actions.json`)
      return [200, resp]
    })
  },
}
