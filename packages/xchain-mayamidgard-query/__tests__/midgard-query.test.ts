import midgardApi from '../__mocks__/midgard/midgardApi'
import { MidgardQuery } from '../src'

describe('Midgard query', () => {
  let midgardQuery: MidgardQuery
  beforeAll(() => {
    midgardQuery = new MidgardQuery()
  })
  beforeEach(() => {
    midgardApi.init()
  })
  afterEach(() => {
    midgardApi.restore()
  })
  it('Should get pools', async () => {
    console.log(await midgardQuery.getPools())
  })
})
