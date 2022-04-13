import { LCDClient } from '@terra-money/terra.js'
import { Network } from '@xchainjs/xchain-client'
import { AssetBTC, TerraChain } from '@xchainjs/xchain-util'

import mockTerraApi from '../__mocks__/terra'
import { AssetLUNA, AssetLUNASynth, AssetUST, AssetUSTSynth } from '../src/const'
import {
  getAccount,
  getGasPriceByAsset,
  getTerraNativeAsset,
  getTerraNativeDenom,
  isTerraNativeAsset,
} from '../src/util'

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
    it('AUT', () => {
      expect(getTerraNativeDenom({ chain: TerraChain, symbol: 'AUT', ticker: 'AUT', synth: false })).toEqual('uaud')
    })
    it('EUT', () => {
      expect(getTerraNativeDenom({ chain: TerraChain, symbol: 'EUT', ticker: 'EUT', synth: false })).toEqual('ueur')
    })

    it('BTC', () => {
      expect(getTerraNativeDenom(AssetBTC)).toBeNull()
    })
  })

  describe('getTerraNativeAsset', () => {
    it('LUNA', () => {
      expect(getTerraNativeAsset('uluna')).toEqual(AssetLUNA)
    })
    it('UST', () => {
      expect(getTerraNativeAsset('uusd')).toEqual(AssetUST)
    })
    it('AUT', () => {
      expect(getTerraNativeAsset('uaud')).toEqual({ chain: TerraChain, symbol: 'AUT', ticker: 'AUT', synth: false })
    })
    it('EUT', () => {
      expect(getTerraNativeAsset('ueur')).toEqual({ chain: TerraChain, symbol: 'EUT', ticker: 'EUT', synth: false })
    })
    it('unknown', () => {
      expect(getTerraNativeAsset('unknown')).toBeNull()
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

  describe('getAccount', () => {
    it('returns all values of an account', async () => {
      const lcdClient = new LCDClient({
        chainID: 'bombay-12',
        URL: 'https://bombay-fcd.terra.dev',
      })

      const address = 'terra1hf2j3w46zw8lg25awgan7x8wwsnc509sk0e6gr'

      const { sequence, publicKey, number } = await getAccount(address, lcdClient)
      expect(sequence).toEqual(5)
      expect(number).toEqual(198482)
      expect(publicKey?.address()).toEqual(address)
    })
  })
})
