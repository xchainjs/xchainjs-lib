import { getInboundDetails, getMimirDetails } from './async'
import { Chain } from './chain'

describe('functions from Midgard', () => {
  it('should return mimir details', async function () {
    await expect(getMimirDetails()).resolves.toHaveProperty('HALTCHAINGLOBAL')
  })

  it('should return inbound details for ETH', async function () {
    await expect(getInboundDetails(Chain.Ethereum)).resolves.toHaveProperty('router')
  })
})
