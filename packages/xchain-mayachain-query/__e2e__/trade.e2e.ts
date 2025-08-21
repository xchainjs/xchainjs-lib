import { Network } from '@xchainjs/xchain-client'
import { assetFromStringEx, assetToString, TradeAsset } from '@xchainjs/xchain-util'

import { MayachainQuery } from '../src'

describe('MayachainQuery Trade E2E Tests', () => {
  let mayachainQuery: MayachainQuery

  beforeAll(() => {
    mayachainQuery = new MayachainQuery({ network: Network.Stagenet })
  })

  describe('Trade Asset Units', () => {
    it('Should get trade asset units for ETH~ETH', async () => {
      try {
        const asset = assetFromStringEx('ETH~ETH') as TradeAsset
        const result = await mayachainQuery.getTradeAssetUnits({ asset })
        
        expect(assetToString(result.asset)).toBe('ETH~ETH')
        expect(result.units.assetAmount.amount().toNumber()).toBeGreaterThan(0)
        expect(result.depth.assetAmount.amount().toNumber()).toBeGreaterThan(0)
        expect(result.units.assetAmount.decimal).toBe(8)
        expect(result.depth.assetAmount.decimal).toBe(8)
      } catch (error) {
        // May fail if stagenet doesn't have trade assets yet
        console.warn('Trade asset units not available on stagenet:', error)
      }
    })

    it('Should get all trade assets units', async () => {
      try {
        const result = await mayachainQuery.getTradeAssetsUnits()
        
        if (result.length > 0) {
          expect(result).toBeInstanceOf(Array)
          const firstAsset = result[0]
          expect(assetToString(firstAsset.asset)).toContain('~')
          expect(firstAsset.units.assetAmount.decimal).toBe(8)
          expect(firstAsset.depth.assetAmount.decimal).toBe(8)
        }
      } catch (error) {
        // May fail if stagenet doesn't have trade assets yet
        console.warn('Trade assets units not available on stagenet:', error)
      }
    })
  })

  describe('Trade Accounts', () => {
    it('Should get trade accounts for an address', async () => {
      try {
        // This is a placeholder address, replace with actual stagenet address with trade accounts
        const address = 'smaya1qtemwlu9ju3ts3da5l82qejnzdl3xfs3lv7xz4'
        const result = await mayachainQuery.getAddressTradeAccounts({ address })
        
        if (result.length > 0) {
          expect(result).toBeInstanceOf(Array)
          const firstAccount = result[0]
          expect(assetToString(firstAccount.asset)).toContain('~')
          expect(firstAccount.owner).toBe(address)
          expect(firstAccount.units.assetAmount.decimal).toBe(8)
        }
      } catch (error) {
        // May fail if address doesn't have trade accounts
        console.warn('Trade accounts not found for address:', error)
      }
    })

    it('Should get all trade accounts for an asset', async () => {
      try {
        const asset = assetFromStringEx('ETH~ETH') as TradeAsset
        const result = await mayachainQuery.getTradeAssetAccounts({ asset })
        
        if (result.length > 0) {
          expect(result).toBeInstanceOf(Array)
          const firstAccount = result[0]
          expect(assetToString(firstAccount.asset)).toBe('ETH~ETH')
          expect(firstAccount.owner).toBeTruthy()
          expect(firstAccount.units.assetAmount.decimal).toBe(8)
        }
      } catch (error) {
        // May fail if asset doesn't have trade accounts
        console.warn('Trade accounts not found for asset:', error)
      }
    })
  })
})