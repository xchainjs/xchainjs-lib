import { getTokenAddress } from '../src/utils'
import { assetFromString } from '@xchainjs/xchain-util'

describe('ethereum/util', () => {
  describe('getTokenAddress', () => {
    it('should return the token address ', () => {
      const tokenAddress = getTokenAddress(assetFromString('ETH.USDT-0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'))
      expect(tokenAddress).toEqual('0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa')
    })
    it('should return null ', () => {
      const tokenAddress = getTokenAddress(assetFromString('ETH.ETH'))
      expect(tokenAddress).toBeFalsy()
    })
  })
})
