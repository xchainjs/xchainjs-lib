import { MayachainQuery } from '../src'

describe('Thorchain-query thorname Integration Tests', () => {
  let mayachainQuery: MayachainQuery

  beforeAll(() => {
    mayachainQuery = new MayachainQuery()
  })

  it('should fetch MAYAName details', async () => {
    const thorname = await mayachainQuery.getMAYANameDetails('jf')
    console.log(thorname)
  })
})
