import { BTCChain, BNBChain, CosmosChain, ETHChain, THORChain, PolkadotChain } from './chain.const'
import { getPrefix } from './address'

describe('address', () => {
  describe('getPrefix', () => {
    it('THORChain', () => {
      expect(getPrefix(THORChain, false)).toEqual('thor')
      expect(getPrefix(THORChain, true)).toEqual('tthor')
    })
    it('BTCChain', () => {
      expect(getPrefix(BTCChain, false)).toEqual('bc1')
      expect(getPrefix(BTCChain, true)).toEqual('tb1')
    })
    it('BNBChain', () => {
      expect(getPrefix(BNBChain, false)).toEqual('bnb')
      expect(getPrefix(BNBChain, true)).toEqual('tbnb')
    })
    it('CosmosChain', () => {
      expect(getPrefix(CosmosChain, false)).toEqual('cosmos')
      expect(getPrefix(CosmosChain, true)).toEqual('cosmos')
    })
    it('ETHChain', () => {
      expect(getPrefix(ETHChain, false)).toEqual('0x')
      expect(getPrefix(ETHChain, true)).toEqual('0x')
    })
    it('PolkadotChain', () => {
      expect(getPrefix(PolkadotChain, false)).toEqual('1')
      expect(getPrefix(PolkadotChain, true)).toEqual('5')
    })
  })
})
