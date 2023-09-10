import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'

const thorchainCache = new ThorchainCache()
const thorchainQuery = new ThorchainQuery(thorchainCache)

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-query thorname Integration Tests', () => {
  it('should fetch thorname details', async () => {
    const thorname = await thorchainQuery.getThornameDetails('dx')
    console.log(thorname)
  })
})
