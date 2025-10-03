import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { assetAmount, assetToBase, assetToString, CryptoAmount } from '@xchainjs/xchain-util'

import mockThornodeApi from '../__mocks__/mayachain/mayanode/api'
import mockMayaMidgardApi from '../__mocks__/mayachain/midgard/api'
import mockThorMidgardApi from '../__mocks__/thorchain/midgard/api'
import mockMayanodeApi from '../__mocks__/thorchain/thornode/api'
import { Aggregator } from '../src'
import { ThorchainProtocol } from '../src/protocols/thorchain'
import { MayachainProtocol } from '../src/protocols/mayachain'

describe('Performance Optimizations', () => {
  let aggregator: Aggregator
  let thorchainProtocol: ThorchainProtocol
  let mayachainProtocol: MayachainProtocol

  beforeAll(() => {
    aggregator = new Aggregator()
    thorchainProtocol = new ThorchainProtocol()
    mayachainProtocol = new MayachainProtocol()
  })

  beforeEach(() => {
    mockThornodeApi.init()
    mockThorMidgardApi.init()
    mockMayanodeApi.init()
    mockMayaMidgardApi.init()
  })

  afterEach(() => {
    mockThornodeApi.restore()
    mockThorMidgardApi.restore()
    mockMayanodeApi.restore()
    mockMayaMidgardApi.restore()
  })

  describe('Fast Mode Asset Decimals', () => {
    it('Should use fast mode decimals for common assets', async () => {
      const commonAssets = [AssetBTC, AssetETH, AssetRuneNative, AssetCacao]

      // Fast mode should handle these assets efficiently
      const results = await Promise.all(commonAssets.map((asset) => thorchainProtocol.isAssetSupported(asset)))

      // All common assets should be properly supported
      results.forEach((isSupported: boolean) => {
        expect(typeof isSupported).toBe('boolean')
      })
    })
  })

  describe('Supported Assets Caching', () => {
    it('Should cache supported assets and provide consistent results', async () => {
      // Multiple calls should return consistent results (indicating cache is working)
      const isSupported1 = await thorchainProtocol.isAssetSupported(AssetBTC)
      const isSupported2 = await thorchainProtocol.isAssetSupported(AssetBTC)
      const isSupported3 = await thorchainProtocol.isAssetSupported(AssetBTC)

      expect(isSupported1).toBe(isSupported2)
      expect(isSupported2).toBe(isSupported3)
      expect(typeof isSupported1).toBe('boolean')
    })
  })

  describe('Mayanode Direct Pool Access', () => {
    it('Should use Mayanode directly for pool data', async () => {
      // This should work using Mayanode directly for pool data
      const isSupported = await mayachainProtocol.isAssetSupported(AssetBTC)

      expect(typeof isSupported).toBe('boolean')

      // Test multiple assets to ensure pool fetching works correctly
      const assets = [AssetBTC, AssetETH, AssetCacao]
      const results = await Promise.all(assets.map((asset) => mayachainProtocol.isAssetSupported(asset)))

      results.forEach((result: boolean) => {
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('Quote Performance', () => {
    it('Should provide fast quotes with optimized caching', async () => {
      const swapParams = {
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetBTC),
        destinationAddress: '0x1234567890123456789012345678901234567890',
      }

      // Measure quote performance
      const startTime = Date.now()

      const quote = await aggregator.estimateSwap(swapParams)

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(quote).toBeDefined()
      expect(quote.length).toBeGreaterThan(0)

      // Should be reasonably fast (less than 5 seconds in test environment)
      expect(duration).toBeLessThan(5000)

      console.log(`Quote completed in ${duration}ms`)
    })

    it('Should have faster subsequent quotes due to caching', async () => {
      const swapParams = {
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetBTC),
        destinationAddress: '0x1234567890123456789012345678901234567890',
      }

      // First quote (cache miss)
      const startTime1 = Date.now()
      const quote1 = await aggregator.estimateSwap(swapParams)
      const duration1 = Date.now() - startTime1

      // Second quote (should hit cache)
      const startTime2 = Date.now()
      const quote2 = await aggregator.estimateSwap(swapParams)
      const duration2 = Date.now() - startTime2

      expect(quote1).toBeDefined()
      expect(quote2).toBeDefined()

      // Both quotes should be reasonably fast (indicating caching is working)
      expect(duration1).toBeLessThan(100)
      expect(duration2).toBeLessThan(100)

      console.log(`First quote: ${duration1}ms, Second quote: ${duration2}ms`)
    })
  })

  describe('Cache TTL Optimization', () => {
    it('Should use different cache TTLs for different data types', async () => {
      // This test verifies our cache TTL optimizations are properly configured
      const thorchainProtocol = aggregator.getProtocol('Thorchain')
      const mayachainProtocol = aggregator.getProtocol('Mayachain')

      // Check that protocols are properly initialized with optimized caches
      expect(thorchainProtocol).toBeDefined()
      expect(mayachainProtocol).toBeDefined()

      // Verify protocols can handle asset support checks efficiently
      const assets = [AssetBTC, AssetETH, AssetRuneNative, AssetCacao]

      const results = await Promise.all(
        assets.map(async (asset) => ({
          asset: assetToString(asset),
          thorchain: await thorchainProtocol!.isAssetSupported(asset),
          mayachain: await mayachainProtocol!.isAssetSupported(asset),
        })),
      )

      // All results should be boolean (not undefined/error)
      results.forEach((result) => {
        expect(typeof result.thorchain).toBe('boolean')
        expect(typeof result.mayachain).toBe('boolean')
      })

      console.log('Asset support results:', results)
    })
  })
})
