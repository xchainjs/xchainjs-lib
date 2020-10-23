import { chainToString, isChain } from './chain'

describe('chain', () => {
  it('checks type Chain', () => {
    expect(isChain('BNB')).toBeTruthy()
    expect(isChain('BTC')).toBeTruthy()
    expect(isChain('ETH')).toBeTruthy()
    expect(isChain('THOR')).toBeTruthy()
    expect(isChain('')).toBeFalsy()
    expect(isChain('invalid')).toBeFalsy()
  })
  describe('chainToString', () => {
    it('returns string for Thorchain', () => {
      expect(chainToString('THOR')).toEqual('Thorchain')
    })
    it('returns string for BTC', () => {
      expect(chainToString('BTC')).toEqual('Bitcoin')
    })
    it('returns string for ETH', () => {
      expect(chainToString('ETH')).toEqual('Ethereum')
    })
    it('returns string for BNB', () => {
      expect(chainToString('BNB')).toEqual('Binance Chain')
    })
  })
})
