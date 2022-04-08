import { Network } from '@xchainjs/xchain-client'
import { AssetBTC } from '@xchainjs/xchain-util'

import mockTerraApi from '../__mocks__/terra'
import { AssetLUNA, AssetLUNASynth, AssetUST, AssetUSTSynth } from '../src/const'
import { getGasPriceByAsset, getTerraNativeDenom, isTerraNativeAsset } from '../src/util'

describe('terra/util', () => {
  beforeEach(() => {
    mockTerraApi.init()
  })
  afterEach(() => {
    mockTerraApi.restore()
  })

  describe('getTerraNativeDenom', () => {
    it('LUNA', () => {
      expect(getTerraNativeDenom(AssetLUNA)).toEqual('uluna')
    })

    it('UST', () => {
      expect(getTerraNativeDenom(AssetUST)).toEqual('uusd')
    })
    it('BTC', () => {
      expect(getTerraNativeDenom(AssetBTC)).toBeNull()
    })
  })

  describe('isTerraNativeAsset', () => {
    it('LUNA', () => {
      expect(isTerraNativeAsset(AssetLUNA)).toBeTruthy()
    })
    it('LUNA synth', () => {
      expect(isTerraNativeAsset(AssetLUNASynth)).toBeFalsy()
    })
    it('UST', () => {
      expect(isTerraNativeAsset(AssetUST)).toBeTruthy()
    })
    it('UST synth', () => {
      expect(isTerraNativeAsset(AssetUSTSynth)).toBeFalsy()
    })
  })

  describe('getGasPriceByAsset', () => {
    const url = 'https://bombay-fcd.terra.dev/v1/txs/gas_prices'

    it('LUNA', async () => {
      const result = await getGasPriceByAsset({ url, asset: AssetLUNA, network: Network.Testnet })
      expect(result?.denom).toEqual('uluna')
      expect(result?.price.toString()).toEqual('0.01133')
    })

    it('UST', async () => {
      const result = await getGasPriceByAsset({ url, asset: AssetUST, network: Network.Testnet })
      expect(result?.denom).toEqual('uusd')
      expect(result?.price.toString()).toEqual('0.15')
    })
  })
})
