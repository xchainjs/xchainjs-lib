import { AssetLUNA, Chain } from '@xchainjs/xchain-util'

import { TerraNativeAsset, getTerraMicroDenom, isTerraAsset } from '../src/util'

describe('terra/util', () => {
  describe('getTerraMicroDenom', () => {
    it('LUNA', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.LUNA)).toEqual('uluna')
    })
    it('UST', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.UST)).toEqual('uusd')
    })
    it('EUT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.EUT)).toEqual('ueur')
    })
    it('BTC', () => {
      expect(getTerraMicroDenom('BTC')).toBeNull()
    })
  })

  describe('isTerraAsset', () => {
    it('LUNA', () => {
      expect(isTerraAsset(AssetLUNA)).toBeTruthy()
    })
    it('LUNA synth', () => {
      expect(isTerraAsset({ ...AssetLUNA, synth: true })).toBeFalsy()
    })
    it('UST', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: false })).toBeTruthy()
    })
    it('UST synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: true })).toBeFalsy()
    })
    it('EUT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: false })).toBeTruthy()
    })
    it('EUT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: true })).toBeFalsy()
    })
  })
})
