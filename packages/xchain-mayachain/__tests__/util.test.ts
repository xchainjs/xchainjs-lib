import { AssetType } from '@xchainjs/xchain-util'

import { parseAssetToMayanodeAsset } from '../src'

describe('Utils', () => {
  describe('parseAssetToMayanodeAsset', () => {
    it('should parse a NATIVE asset correctly', () => {
      const asset = {
        chain: 'MAYA',
        symbol: 'CACAO',
        ticker: 'CACAO',
        type: AssetType.NATIVE,
      }

      const result = parseAssetToMayanodeAsset(asset)

      expect(result).toEqual({
        chain: 'MAYA',
        symbol: 'CACAO',
        ticker: 'CACAO',
        synth: false,
        trade: false,
      })
    })

    it('should parse a SYNTH asset correctly', () => {
      const asset = {
        chain: 'ETH',
        symbol: 'USDT',
        ticker: 'USDT',
        type: AssetType.SYNTH,
      }

      const result = parseAssetToMayanodeAsset(asset)

      expect(result).toEqual({
        chain: 'ETH',
        symbol: 'USDT',
        ticker: 'USDT',
        synth: true,
        trade: false,
      })
    })

    it('should parse a TRADE asset correctly', () => {
      const asset = {
        chain: 'BNB',
        symbol: 'BNB',
        ticker: 'BNB',
        type: AssetType.TRADE,
      }

      const result = parseAssetToMayanodeAsset(asset)

      expect(result).toEqual({
        chain: 'BNB',
        symbol: 'BNB',
        ticker: 'BNB',
        synth: false,
        trade: true,
      })
    })
  })
})
