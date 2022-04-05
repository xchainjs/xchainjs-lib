import { AssetBTC } from '@xchainjs/xchain-util'

import mockTerraApi from '../__mocks__/terra'
import {
  AssetAUT,
  AssetCAT,
  AssetCHT,
  AssetCNT,
  AssetDKT,
  AssetEUT,
  AssetGBT,
  AssetHKT,
  AssetIDT,
  AssetINT,
  AssetJPT,
  AssetKRT,
  AssetLUNA,
  AssetLUNASynth,
  AssetMNT,
  AssetMYT,
  AssetNOT,
  AssetPHT,
  AssetSDT,
  AssetSET,
  AssetSGT,
  AssetTBT,
  AssetTWT,
  AssetUST,
  AssetUSTSynth,
} from '../src/const'
import { getFees, getFeesByAsset, getTerraDenom, isTerraNativeAsset } from '../src/util'

describe('terra/util', () => {
  beforeEach(() => {
    mockTerraApi.init()
  })
  afterEach(() => {
    mockTerraApi.restore()
  })

  describe('getTerraDenom', () => {
    it('LUNA', () => {
      expect(getTerraDenom(AssetLUNA)).toEqual('uluna')
    })
    it('SDT', () => {
      expect(getTerraDenom(AssetSDT)).toEqual('usdr')
    })
    it('UST', () => {
      expect(getTerraDenom(AssetUST)).toEqual('uusd')
    })
    it('KRT', () => {
      expect(getTerraDenom(AssetKRT)).toEqual('ukrw')
    })
    it('MNT', () => {
      expect(getTerraDenom(AssetMNT)).toEqual('umnt')
    })
    it('EUT', () => {
      expect(getTerraDenom(AssetEUT)).toEqual('ueur')
    })
    it('CNT', () => {
      expect(getTerraDenom(AssetCNT)).toEqual('ucny')
    })
    it('JPT', () => {
      expect(getTerraDenom(AssetJPT)).toEqual('ujpy')
    })
    it('GBT', () => {
      expect(getTerraDenom(AssetGBT)).toEqual('ugbp')
    })
    it('INT', () => {
      expect(getTerraDenom(AssetINT)).toEqual('uinr')
    })
    it('CAT', () => {
      expect(getTerraDenom(AssetCAT)).toEqual('ucad')
    })
    it('CHT', () => {
      expect(getTerraDenom(AssetCHT)).toEqual('uchf')
    })
    it('AUT', () => {
      expect(getTerraDenom(AssetAUT)).toEqual('uaud')
    })
    it('SGT', () => {
      expect(getTerraDenom(AssetSGT)).toEqual('usgd')
    })
    it('TBT', () => {
      expect(getTerraDenom(AssetTBT)).toEqual('uthb')
    })
    it('SET', () => {
      expect(getTerraDenom(AssetSET)).toEqual('usek')
    })
    it('NOT', () => {
      expect(getTerraDenom(AssetNOT)).toEqual('unok')
    })
    it('DKT', () => {
      expect(getTerraDenom(AssetDKT)).toEqual('udkk')
    })
    it('IDT', () => {
      expect(getTerraDenom(AssetIDT)).toEqual('uidr')
    })
    it('PHT', () => {
      expect(getTerraDenom(AssetPHT)).toEqual('uphp')
    })
    it('HKT', () => {
      expect(getTerraDenom(AssetHKT)).toEqual('uhkd')
    })
    it('MYT', () => {
      expect(getTerraDenom(AssetMYT)).toEqual('umyr')
    })
    it('TWT', () => {
      expect(getTerraDenom(AssetTWT)).toEqual('utwd')
    })
    it('BTC', () => {
      expect(getTerraDenom(AssetBTC)).toBeUndefined()
    })
  })

  describe('isTerraNativeAsset', () => {
    it('LUNA', () => {
      expect(isTerraNativeAsset(AssetLUNA)).toBeTruthy()
    })
    it('LUNA synth', () => {
      expect(isTerraNativeAsset(AssetLUNASynth)).toBeFalsy()
    })
    it('SDT', () => {
      expect(isTerraNativeAsset(AssetSDT)).toBeTruthy()
    })
    it('UST', () => {
      expect(isTerraNativeAsset(AssetUST)).toBeTruthy()
    })
    it('UST synth', () => {
      expect(isTerraNativeAsset(AssetUSTSynth)).toBeFalsy()
    })
    it('KRT', () => {
      expect(isTerraNativeAsset(AssetKRT)).toBeTruthy()
    })
    it('MNT', () => {
      expect(isTerraNativeAsset(AssetMNT)).toBeTruthy()
    })
    it('EUT', () => {
      expect(isTerraNativeAsset(AssetEUT)).toBeTruthy()
    })
    it('CNT', () => {
      expect(isTerraNativeAsset(AssetCNT)).toBeTruthy()
    })
    it('JPT', () => {
      expect(isTerraNativeAsset(AssetJPT)).toBeTruthy()
    })

    it('GBT', () => {
      expect(isTerraNativeAsset(AssetGBT)).toBeTruthy()
    })
    it('INT', () => {
      expect(isTerraNativeAsset(AssetINT)).toBeTruthy()
    })
    it('CAT', () => {
      expect(isTerraNativeAsset(AssetCAT)).toBeTruthy()
    })
    it('CHT', () => {
      expect(isTerraNativeAsset(AssetCHT)).toBeTruthy()
    })
    it('AUT', () => {
      expect(isTerraNativeAsset(AssetAUT)).toBeTruthy()
    })
    it('SGT', () => {
      expect(isTerraNativeAsset(AssetSGT)).toBeTruthy()
    })
    it('TBT', () => {
      expect(isTerraNativeAsset(AssetTBT)).toBeTruthy()
    })
    it('SET', () => {
      expect(isTerraNativeAsset(AssetSET)).toBeTruthy()
    })
    it('NOT', () => {
      expect(isTerraNativeAsset(AssetNOT)).toBeTruthy()
    })
    it('DKT', () => {
      expect(isTerraNativeAsset(AssetDKT)).toBeTruthy()
    })
    it('IDT', () => {
      expect(isTerraNativeAsset(AssetIDT)).toBeTruthy()
    })
    it('PHT', () => {
      expect(isTerraNativeAsset(AssetPHT)).toBeTruthy()
    })
    it('HKT', () => {
      expect(isTerraNativeAsset(AssetHKT)).toBeTruthy()
    })
    it('MYT', () => {
      expect(isTerraNativeAsset(AssetMYT)).toBeTruthy()
    })
    it('TWT', () => {
      expect(isTerraNativeAsset(AssetTWT)).toBeTruthy()
    })
  })

  describe.only('fees', () => {
    const url = 'https://bombay-fcd.terra.dev/v1/txs/gas_prices'

    describe('getFeesByAsset', () => {
      it('fees -> LUNA', async () => {
        const fees = await getFeesByAsset(url, AssetLUNA)
        expect(fees.average.amount().toString()).toEqual('11330')
      })

      it('fees -> UST', async () => {
        const fees = await getFeesByAsset(url, AssetUST)
        expect(fees.average.amount().toString()).toEqual('150000')
      })

      it('fees -> AUT', async () => {
        const fees = await getFeesByAsset(url, AssetAUT)
        expect(fees.average.amount().toString()).toEqual('190000')
      })
    })

    describe('getFees', () => {
      it('LUNA (only)', async () => {
        const fees = await getFees(url)
        expect(fees.average.amount().toString()).toEqual('11330')
      })
    })
  })
})
