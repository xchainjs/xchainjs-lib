import { Network } from '@xchainjs/xchain-client'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import {
  AssetCryptoAmount,
  AssetType,
  CryptoAmount,
  TradeCryptoAmount,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
} from '@xchainjs/xchain-util'

import mockMayanodeApi from '../__mocks__/mayanode-api/mayanode-api'
import mockMidgardApi from '../__mocks__/midgard-api/midgard-api'
import { MayachainAMM } from '../src'
import { MayachainAction } from '../src/mayachain-action'

describe('MayachainAMM', () => {
  let mayachainAMM: MayachainAMM

  beforeAll(() => {
    mayachainAMM = new MayachainAMM()
  })

  beforeEach(() => {
    mockMayanodeApi.init()
    mockMidgardApi.init()
  })

  afterEach(() => {
    mockMayanodeApi.restore()
    mockMidgardApi.restore()
    jest.restoreAllMocks()
  })

  describe('Trade assets', () => {
    it('Should estimate add to trade account with no errors', async () => {
      const quote = await mayachainAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        address: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      })

      expect(quote.memo).toBe('TRADE+:maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz')
      expect(quote.toAddress).toBe('0x87a8d8abd8086173e2f15a90a1938d8077e02ecb')
      expect(assetToString(quote.value.asset)).toBe('ETH.ETH')
      expect(quote.value.assetAmount.amount().toString()).toBe('1')
      expect(quote.allowed).toBeTruthy()
      expect(quote.errors.length).toBe(0)
    })

    it('Should estimate add to trade account with address error', async () => {
      const quote = await mayachainAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        address: 'maya12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7se',
      })

      expect(quote.memo).toBe('')
      expect(quote.toAddress).toBe('')
      expect(assetToString(quote.value.asset)).toBe('ETH.ETH')
      expect(quote.value.assetAmount.amount().toString()).toBe('0')
      expect(quote.allowed).toBeFalsy()
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Invalid trade account address')
    })

    it('Should estimate add to trade account with asset error', async () => {
      const quote = await mayachainAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), {
          chain: 'ETHH',
          symbol: '',
          ticker: '',
          type: AssetType.NATIVE,
        }),
        address: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      })

      expect(quote.memo).toBe('')
      expect(quote.toAddress).toBe('')
      expect(assetToString(quote.value.asset)).toBe('ETHH.')
      expect(quote.value.assetAmount.amount().toString()).toBe('0')
      expect(quote.allowed).toBeFalsy()
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Can not get inbound address for ETHH')
    })

    it('Should estimate withdraw from trade account with no errors', async () => {
      const quote = await mayachainAMM.estimateWithdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(1, 18)), {
          chain: 'ETH',
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        }),
        address: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
      })

      expect(quote.memo).toBe('TRADE-:0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf')
      expect(assetToString(quote.value.asset)).toBe('ETH~ETH')
      expect(quote.value.assetAmount.amount().toString()).toBe('1')
      expect(quote.allowed).toBeTruthy()
      expect(quote.errors.length).toBe(0)
    })

    it('Should estimate withdraw from trade account with address error', async () => {
      const quote = await mayachainAMM.estimateWithdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(1, 18)), {
          chain: 'ETH',
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        }),
        address: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bb',
      })

      expect(quote.memo).toBe('')
      expect(assetToString(quote.value.asset)).toBe('ETH~ETH')
      expect(quote.value.assetAmount.amount().toString()).toBe('0')
      expect(quote.allowed).toBeFalsy()
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Invalid address to send the withdraw')
    })

    it('Should add to trade account', async () => {
      const addToTradeSpy = jest.spyOn(mayachainAMM, 'addToTradeAccount')
      const makeActionSpy = jest.spyOn(MayachainAction, 'makeAction').mockResolvedValue({
        hash: 'mock-tx-hash',
        url: 'mock-url',
      })

      await mayachainAMM.addToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        address: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      })

      expect(addToTradeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          address: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
          amount: expect.any(AssetCryptoAmount),
        })
      )

      expect(makeActionSpy).toHaveBeenCalledWith({
        wallet: expect.anything(),
        assetAmount: expect.objectContaining({
          asset: AssetETH,
        }),
        memo: 'TRADE+:maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
        recipient: '0x87a8d8abd8086173e2f15a90a1938d8077e02ecb',
      })
    })

    it('Should withdraw from trade account', async () => {
      const withdrawFromTradeSpy = jest.spyOn(mayachainAMM, 'withdrawFromTradeAccount')
      const makeActionSpy = jest.spyOn(MayachainAction, 'makeAction').mockResolvedValue({
        hash: 'mock-tx-hash',
        url: 'mock-url',
      })

      await mayachainAMM.withdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(1, 18)), {
          chain: 'ETH',
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        }),
        address: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
      })

      expect(withdrawFromTradeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
          amount: expect.any(TradeCryptoAmount),
        })
      )

      expect(makeActionSpy).toHaveBeenCalledWith({
        wallet: expect.anything(),
        assetAmount: expect.objectContaining({
          asset: expect.objectContaining({
            chain: 'ETH',
            symbol: 'ETH',
            ticker: 'ETH',
            type: AssetType.NATIVE, // Converted from TRADE to NATIVE
          }),
        }),
        memo: 'TRADE-:0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
        // No recipient parameter for protocol actions
      })
    })

    it('Should validate trade swap with no errors', async () => {
      const errors = await mayachainAMM.validateSwap({
        fromAsset: assetFromStringEx('ETH~ETH'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), assetFromStringEx('ETH~ETH')),
        destinationAsset: assetFromStringEx('BTC~BTC'),
      })
      expect(errors.length).toBe(0)
    })

    it('Should validate trade swap with incompatible destination asset error', async () => {
      const errors = await mayachainAMM.validateSwap({
        fromAsset: assetFromStringEx('ETH~ETH'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), assetFromStringEx('ETH~ETH')),
        destinationAddress: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
        destinationAsset: assetFromStringEx('ETH.ETH'),
      })
      expect(errors.length).toBe(1)
      expect(errors[0]).toBe(
        'Can not make swap from trade asset to non trade asset or non Cacao asset. Use withdrawFromTrade (TRADE-) operation',
      )
    })

    it('Should validate trade swap with incompatible source asset error', async () => {
      const errors = await mayachainAMM.validateSwap({
        fromAsset: assetFromStringEx('ETH.ETH'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), assetFromStringEx('ETH.ETH')),
        destinationAsset: assetFromStringEx('BTC~BTC'),
      })
      expect(errors.length).toBe(1)
      expect(errors[0]).toBe(
        'Can not make swap from non trade asset or non Cacao asset to trade asset. Use addToTrade (TRADE+) operation',
      )
    })

    it('Should call estimateSwap method successfully', async () => {
      const fromAsset = assetFromStringEx('ETH.ETH')
      const toAsset = assetFromStringEx('BTC.BTC')

      const quote = await mayachainAMM.estimateSwap({
        fromAsset,
        amount: new CryptoAmount(assetToBase(assetAmount('1')), fromAsset),
        destinationAsset: toAsset,
      })

      // Verify that the method returns a quote object with expected properties
      expect(quote).toBeDefined()
      expect(typeof quote.toAddress).toBe('string')
      expect(typeof quote.memo).toBe('string')
      expect(quote.memo).toContain('=:BTC.BTC')
      
      // Verify that the estimate swap functionality is working
      // Based on the actual structure returned
      expect(quote).toHaveProperty('dustThreshold')
      expect(quote).toHaveProperty('canSwap')
      expect(quote).toHaveProperty('errors')
      expect(quote).toHaveProperty('expectedAmount')
      expect(quote).toHaveProperty('fees')
      expect(quote).toHaveProperty('slipBasisPoints')
      expect(quote).toHaveProperty('outboundDelayBlocks')
      expect(quote).toHaveProperty('totalSwapSeconds')
      
      // Verify types
      expect(typeof quote.canSwap).toBe('boolean')
      expect(Array.isArray(quote.errors)).toBe(true)
      expect(typeof quote.slipBasisPoints).toBe('number')
      expect(typeof quote.outboundDelayBlocks).toBe('number')
      expect(typeof quote.totalSwapSeconds).toBe('number')
    })
  })
})