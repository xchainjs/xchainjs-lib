import {
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain,
  chainToString,
  isChain,
} from './chain'

describe('chain', () => {
  it('checks type Chain', () => {
    expect(isChain('BNB')).toBeTruthy()
    expect(isChain('BTC')).toBeTruthy()
    expect(isChain('BCH')).toBeTruthy()
    expect(isChain('ETH')).toBeTruthy()
    expect(isChain('THOR')).toBeTruthy()
    expect(isChain('GAIA')).toBeTruthy()
    expect(isChain('LTC')).toBeTruthy()
    expect(isChain('')).toBeFalsy()
    expect(isChain('invalid')).toBeFalsy()
  })
  describe('chainToString', () => {
    it('returns string for BCH', () => {
      expect(chainToString(BCHChain)).toEqual('Bitcoin Cash')
    })
    it('returns string for BNB', () => {
      expect(chainToString(BNBChain)).toEqual('Binance Chain')
    })
    it('returns string for BTC', () => {
      expect(chainToString(BTCChain)).toEqual('Bitcoin')
    })
    it('returns string for DOGE', () => {
      expect(chainToString(DOGEChain)).toEqual('Dogecoin')
    })
    it('returns string for ETH', () => {
      expect(chainToString(ETHChain)).toEqual('Ethereum')
    })
    it('returns string for GAIA', () => {
      expect(chainToString(CosmosChain)).toEqual('Cosmos')
    })
    it('returns string for LTC', () => {
      expect(chainToString(LTCChain)).toEqual('Litecoin')
    })
    it('returns string for THOR', () => {
      expect(chainToString(THORChain)).toEqual('Thorchain')
    })
  })
})
