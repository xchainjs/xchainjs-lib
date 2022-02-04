import { AssetLUNA, Chain } from '@xchainjs/xchain-util'

import { TerraNativeAsset, getTerraMicroDenom, isTerraAsset } from '../src/util'

describe('terra/util', () => {
  describe('getTerraMicroDenom', () => {
    it('LUNA', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.LUNA)).toEqual('uluna')
    })
    it('SDT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.SDT)).toEqual('usdr')
    })
    it('UST', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.UST)).toEqual('uusd')
    })
    it('KRT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.KRT)).toEqual('ukrw')
    })
    it('MNT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.MNT)).toEqual('umnt')
    })
    it('EUT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.EUT)).toEqual('ueur')
    })
    it('CNT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.CNT)).toEqual('ucny')
    })
    it('JPT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.JPT)).toEqual('ujpy')
    })
    it('GBT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.GBT)).toEqual('ugbp')
    })
    it('INT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.INT)).toEqual('uinr')
    })
    it('CAT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.CAT)).toEqual('ucad')
    })
    it('CHT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.CHT)).toEqual('uchf')
    })
    it('AUT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.AUT)).toEqual('uaud')
    })
    it('SGT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.SGT)).toEqual('usgd')
    })
    it('TBT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.TBT)).toEqual('uthb')
    })
    it('SET', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.SET)).toEqual('usek')
    })
    it('NOT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.NOT)).toEqual('unok')
    })
    it('DKT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.DKT)).toEqual('udkk')
    })
    it('IDT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.IDT)).toEqual('uidr')
    })
    it('PHT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.PHT)).toEqual('uphp')
    })
    it('HKT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.HKT)).toEqual('uhkd')
    })
    it('MYT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.MYT)).toEqual('umyr')
    })
    it('TWT', () => {
      expect(getTerraMicroDenom(TerraNativeAsset.TWT)).toEqual('utwd')
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
    it('SDT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'SDT', ticker: 'SDT', synth: false })).toBeTruthy()
    })
    it('SDT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'SDT', ticker: 'SDT', synth: true })).toBeFalsy()
    })
    it('UST', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: false })).toBeTruthy()
    })
    it('UST synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'UST', ticker: 'UST', synth: true })).toBeFalsy()
    })
    it('KRT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'KRT', ticker: 'KRT', synth: false })).toBeTruthy()
    })
    it('KRT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'KRT', ticker: 'KRT', synth: true })).toBeFalsy()
    })
    it('MNT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'MNT', ticker: 'MNT', synth: false })).toBeTruthy()
    })
    it('MNT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'MNT', ticker: 'MNT', synth: true })).toBeFalsy()
    })
    it('EUT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: false })).toBeTruthy()
    })
    it('EUT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'EUT', ticker: 'EUT', synth: true })).toBeFalsy()
    })
    it('CNT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'CNT', ticker: 'CNT', synth: false })).toBeTruthy()
    })
    it('CNT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'CNT', ticker: 'CNT', synth: true })).toBeFalsy()
    })
    it('JPT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'JPT', ticker: 'JPT', synth: false })).toBeTruthy()
    })
    it('JPT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'JPT', ticker: 'JPT', synth: true })).toBeFalsy()
    })
    it('GBT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'GBT', ticker: 'GBT', synth: false })).toBeTruthy()
    })
    it('GBT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'GBT', ticker: 'GBT', synth: true })).toBeFalsy()
    })
    it('INT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'INT', ticker: 'INT', synth: false })).toBeTruthy()
    })
    it('INT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'INT', ticker: 'INT', synth: true })).toBeFalsy()
    })
    it('CAT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'CAT', ticker: 'CAT', synth: false })).toBeTruthy()
    })
    it('CAT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'CAT', ticker: 'CAT', synth: true })).toBeFalsy()
    })
    it('CHT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'CHT', ticker: 'CHT', synth: false })).toBeTruthy()
    })
    it('CHT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'CHT', ticker: 'CHT', synth: true })).toBeFalsy()
    })
    it('AUT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'AUT', ticker: 'AUT', synth: false })).toBeTruthy()
    })
    it('AUT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'AUT', ticker: 'AUT', synth: true })).toBeFalsy()
    })
    it('SGT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'SGT', ticker: 'SGT', synth: false })).toBeTruthy()
    })
    it('SGT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'SGT', ticker: 'SGT', synth: true })).toBeFalsy()
    })
    it('TBT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'TBT', ticker: 'TBT', synth: false })).toBeTruthy()
    })
    it('TBT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'TBT', ticker: 'TBT', synth: true })).toBeFalsy()
    })
    it('SET', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'SET', ticker: 'SET', synth: false })).toBeTruthy()
    })
    it('SET synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'SET', ticker: 'SET', synth: true })).toBeFalsy()
    })
    it('NOT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'NOT', ticker: 'NOT', synth: false })).toBeTruthy()
    })
    it('NOT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'NOT', ticker: 'NOT', synth: true })).toBeFalsy()
    })
    it('DKT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'DKT', ticker: 'DKT', synth: false })).toBeTruthy()
    })
    it('DKT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'DKT', ticker: 'DKT', synth: true })).toBeFalsy()
    })
    it('IDT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'IDT', ticker: 'IDT', synth: false })).toBeTruthy()
    })
    it('IDT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'IDT', ticker: 'IDT', synth: true })).toBeFalsy()
    })
    it('PHT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'PHT', ticker: 'PHT', synth: false })).toBeTruthy()
    })
    it('PHT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'PHT', ticker: 'PHT', synth: true })).toBeFalsy()
    })
    it('HKT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'HKT', ticker: 'HKT', synth: false })).toBeTruthy()
    })
    it('HKT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'HKT', ticker: 'HKT', synth: true })).toBeFalsy()
    })
    it('MYT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'MYT', ticker: 'MYT', synth: false })).toBeTruthy()
    })
    it('MYT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'MYT', ticker: 'MYT', synth: true })).toBeFalsy()
    })
    it('TWT', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'TWT', ticker: 'TWT', synth: false })).toBeTruthy()
    })
    it('TWT synth', () => {
      expect(isTerraAsset({ chain: Chain.Terra, symbol: 'TWT', ticker: 'TWT', synth: true })).toBeFalsy()
    })
  })
})
