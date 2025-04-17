import { AssetType } from '@xchainjs/xchain-util'

import { isAssetRuneNative as isAssetRune, parseAssetToTHORNodeAsset } from '../src'

describe('Utils', () => {
  it('Should validate Rune asset', () => {
    expect(isAssetRune({ chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', type: AssetType.NATIVE })).toBeTruthy()
    expect(isAssetRune({ chain: 'ARB', symbol: 'ARB', ticker: 'ETH', type: AssetType.NATIVE })).toBeFalsy()
  })

  describe('parseAssetToTHORNodeAsset', () => {
    it('should parse a NATIVE asset correctly', () => {
      const asset = {
        chain: 'THOR',
        symbol: 'RUNE',
        ticker: 'RUNE',
        type: AssetType.NATIVE,
      }

      const result = parseAssetToTHORNodeAsset(asset)

      expect(result).toEqual({
        chain: 'THOR',
        symbol: 'RUNE',
        ticker: 'RUNE',
        synth: false,
        trade: false,
        secured: false,
      })
    })

    it('should parse a SYNTH asset correctly', () => {
      const asset = {
        chain: 'ETH',
        symbol: 'USDT',
        ticker: 'USDT',
        type: AssetType.SYNTH,
      }

      const result = parseAssetToTHORNodeAsset(asset)

      expect(result).toEqual({
        chain: 'ETH',
        symbol: 'USDT',
        ticker: 'USDT',
        synth: true,
        trade: false,
        secured: false,
      })
    })

    it('should parse a TRADE asset correctly', () => {
      const asset = {
        chain: 'BNB',
        symbol: 'BNB',
        ticker: 'BNB',
        type: AssetType.TRADE,
      }

      const result = parseAssetToTHORNodeAsset(asset)

      expect(result).toEqual({
        chain: 'BNB',
        symbol: 'BNB',
        ticker: 'BNB',
        synth: false,
        trade: true,
        secured: false,
      })
    })

    it('should parse a SECURED asset correctly', () => {
      const asset = {
        chain: 'BTC',
        symbol: 'BTC',
        ticker: 'BTC',
        type: AssetType.SECURED,
      }

      const result = parseAssetToTHORNodeAsset(asset)

      expect(result).toEqual({
        chain: 'BTC',
        symbol: 'BTC',
        ticker: 'BTC',
        synth: false,
        trade: false,
        secured: true,
      })
    })
  })
})
