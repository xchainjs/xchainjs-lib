import { Chain, chainToString, isChain } from './chain'

describe('chain', () => {
  it('checks type Chain', () => {
    expect(isChain('BNB')).toBeTruthy()
    expect(isChain('BTC')).toBeTruthy()
    expect(isChain('BCH')).toBeTruthy()
    expect(isChain('ETH')).toBeTruthy()
    expect(isChain('THOR')).toBeTruthy()
    expect(isChain('GAIA')).toBeTruthy()
    expect(isChain('POLKA')).toBeTruthy()
    expect(isChain('LTC')).toBeTruthy()
    expect(isChain('')).toBeFalsy()
    expect(isChain('invalid')).toBeFalsy()
  })
  describe('chainToString', () => {
    it('returns string for Thorchain', () => {
      expect(chainToString(Chain.THORChain)).toEqual('Thorchain')
    })
    it('returns string for BTC', () => {
      expect(chainToString(Chain.BitcoinCash)).toEqual('Bitcoin')
    })
    it('returns string for BCH', () => {
      expect(chainToString(Chain.BitcoinCash)).toEqual('Bitcoin Cash')
    })
    it('returns string for ETH', () => {
      expect(chainToString(Chain.Ethereum)).toEqual('Ethereum')
    })
    it('returns string for BNB', () => {
      expect(chainToString(Chain.Binance)).toEqual('Binance Chain')
    })
    it('returns string for GAIA', () => {
      expect(chainToString(Chain.Cosmos)).toEqual('Cosmos')
    })
    it('returns string for POLKA', () => {
      expect(chainToString(Chain.Polkadot)).toEqual('Polkadot')
    })
    it('returns string for LTC', () => {
      expect(chainToString(Chain.Litecoin)).toEqual('Litecoin')
    })
    it('returns string for DOGE', () => {
      expect(chainToString(Chain.Litecoin)).toEqual('Dogecoin')
    })
  })
})
