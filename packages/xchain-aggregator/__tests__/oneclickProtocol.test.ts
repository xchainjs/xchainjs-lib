import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { OneClickProtocol } from '../src/protocols/oneclick'
import { OneClickApi } from '../src/protocols/oneclick/api'
import { OneClickToken } from '../src/protocols/oneclick/types'
import {
  findOneClickToken,
  oneClickBlockchainToXChain,
  xChainToOneClickBlockchain,
} from '../src/protocols/oneclick/utils'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

const mockTokens: OneClickToken[] = [
  { assetId: 'nep141:btc.omft.near', blockchain: 'btc', symbol: 'BTC', decimals: 8 },
  { assetId: 'nep141:eth.omft.near', blockchain: 'eth', symbol: 'ETH', decimals: 18 },
  {
    assetId: 'nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near',
    blockchain: 'eth',
    symbol: 'USDT',
    decimals: 6,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  { assetId: 'nep141:sol.omft.near', blockchain: 'sol', symbol: 'SOL', decimals: 9 },
  { assetId: 'nep141:doge.omft.near', blockchain: 'doge', symbol: 'DOGE', decimals: 8 },
  { assetId: 'nep141:avax.omft.near', blockchain: 'avax', symbol: 'AVAX', decimals: 18 },
]

describe('OneClick utils', () => {
  describe('xChainToOneClickBlockchain', () => {
    it('should map known chains', () => {
      expect(xChainToOneClickBlockchain('BTC')).toBe('btc')
      expect(xChainToOneClickBlockchain('ETH')).toBe('eth')
      expect(xChainToOneClickBlockchain('SOL')).toBe('sol')
      expect(xChainToOneClickBlockchain('DOGE')).toBe('doge')
      expect(xChainToOneClickBlockchain('AVAX')).toBe('avax')
      expect(xChainToOneClickBlockchain('ARB')).toBe('arb')
      expect(xChainToOneClickBlockchain('BSC')).toBe('bsc')
      expect(xChainToOneClickBlockchain('ADA')).toBe('cardano')
      expect(xChainToOneClickBlockchain('SUI')).toBe('sui')
    })

    it('should return null for unsupported chains', () => {
      expect(xChainToOneClickBlockchain('THOR')).toBeNull()
      expect(xChainToOneClickBlockchain('MAYA')).toBeNull()
      expect(xChainToOneClickBlockchain('GAIA')).toBeNull()
    })
  })

  describe('oneClickBlockchainToXChain', () => {
    it('should reverse map known blockchains', () => {
      expect(oneClickBlockchainToXChain('btc')).toBe('BTC')
      expect(oneClickBlockchainToXChain('eth')).toBe('ETH')
      expect(oneClickBlockchainToXChain('sol')).toBe('SOL')
      expect(oneClickBlockchainToXChain('cardano')).toBe('ADA')
    })

    it('should return null for unknown blockchains', () => {
      expect(oneClickBlockchainToXChain('near')).toBeNull()
      expect(oneClickBlockchainToXChain('ton')).toBeNull()
    })
  })

  describe('findOneClickToken', () => {
    it('should find native token by chain and symbol', () => {
      const token = findOneClickToken(AssetBTC, mockTokens)
      expect(token).toBeDefined()
      expect(token?.assetId).toBe('nep141:btc.omft.near')
    })

    it('should find ERC20 token by contract address', () => {
      const usdt = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')
      const token = findOneClickToken(usdt, mockTokens)
      expect(token).toBeDefined()
      expect(token?.assetId).toBe('nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near')
    })

    it('should match contract address case-insensitively', () => {
      const usdt = assetFromStringEx('ETH.USDT-0xdac17f958d2ee523a2206206994597c13d831ec7')
      const token = findOneClickToken(usdt, mockTokens)
      expect(token).toBeDefined()
      expect(token?.assetId).toBe('nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near')
    })

    it('should return undefined for synth assets', () => {
      const synth = assetFromStringEx('BTC/BTC')
      expect(findOneClickToken(synth, mockTokens)).toBeUndefined()
    })

    it('should return undefined for trade assets', () => {
      const trade = assetFromStringEx('BTC~BTC')
      expect(findOneClickToken(trade, mockTokens)).toBeUndefined()
    })

    it('should return undefined for unsupported chain', () => {
      expect(findOneClickToken(AssetRuneNative, mockTokens)).toBeUndefined()
    })

    it('should not match native token with wrong symbol', () => {
      const fakeAsset = { chain: 'BTC', symbol: 'FAKE', ticker: 'FAKE', type: 0 }
      expect(findOneClickToken(fakeAsset, mockTokens)).toBeUndefined()
    })
  })
})

describe('OneClick protocol', () => {
  let protocol: OneClickProtocol

  beforeEach(() => {
    mockFetch.mockReset()
    // Mock getTokens for constructor's CachedValue
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v0/tokens')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
      }
      return Promise.resolve({ ok: false, status: 404 })
    })

    protocol = new OneClickProtocol()
  })

  describe('isAssetSupported', () => {
    it('should support BTC', async () => {
      expect(await protocol.isAssetSupported(AssetBTC)).toBe(true)
    })

    it('should support ETH', async () => {
      expect(await protocol.isAssetSupported(AssetETH)).toBe(true)
    })

    it('should not support RUNE', async () => {
      expect(await protocol.isAssetSupported(AssetRuneNative)).toBe(false)
    })

    it('should not support CACAO', async () => {
      expect(await protocol.isAssetSupported(AssetCacao)).toBe(false)
    })

    it('should not support synth assets', async () => {
      expect(await protocol.isAssetSupported(assetFromStringEx('BTC/BTC'))).toBe(false)
    })

    it('should not support trade assets', async () => {
      expect(await protocol.isAssetSupported(assetFromStringEx('BTC~BTC'))).toBe(false)
    })
  })

  describe('getSupportedChains', () => {
    it('should return mapped chains from tokens', async () => {
      const chains = await protocol.getSupportedChains()
      expect(chains).toContain('BTC')
      expect(chains).toContain('ETH')
      expect(chains).toContain('SOL')
      expect(chains).toContain('DOGE')
      expect(chains).toContain('AVAX')
      expect(chains).not.toContain('THOR')
    })
  })

  describe('estimateSwap', () => {
    it('should return quote on success', async () => {
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                quote: {
                  depositAddress: 'bc1qfakedeposit',
                  amountOut: '99000',
                  timeEstimate: 600,
                },
              }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const quote = await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      expect(quote.protocol).toBe('OneClick')
      expect(quote.toAddress).toBe('bc1qfakedeposit')
      expect(quote.canSwap).toBe(true)
      expect(quote.errors).toHaveLength(0)
      expect(quote.expectedAmount.baseAmount.amount().toString()).toBe('99000')
      expect(assetToString(quote.expectedAmount.asset)).toBe('BTC.BTC')
      expect(quote.totalSwapSeconds).toBe(600)
    })

    it('should return error quote for unsupported source asset', async () => {
      const quote = await protocol.estimateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 8)), AssetRuneNative),
      })

      expect(quote.canSwap).toBe(false)
      expect(quote.errors).toContain('Source asset not supported')
    })

    it('should return error quote for unsupported destination asset', async () => {
      const quote = await protocol.estimateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetRuneNative,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 8)), AssetBTC),
      })

      expect(quote.canSwap).toBe(false)
      expect(quote.errors).toContain('Destination asset not supported')
    })

    it('should return error quote when API returns error', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ error: 'Insufficient liquidity', message: 'Insufficient liquidity' }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const quote = await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      expect(quote.canSwap).toBe(false)
      expect(quote.errors).toContain('Insufficient liquidity')
    })

    it('should use dry=true when addresses not provided', async () => {
      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { amountOut: '99000', timeEstimate: 600 } }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.dry).toBe(true)
    })
  })

  describe('doSwap', () => {
    it('should throw if wallet not configured', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                quote: {
                  depositAddress: 'bc1qfakedeposit',
                  amountOut: '99000',
                  timeEstimate: 600,
                },
              }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      await expect(
        protocol.doSwap({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
          fromAddress: '0xSender',
          destinationAddress: 'bc1qRecipient',
        }),
      ).rejects.toThrow('Wallet not configured')
    })

    it('should throw if swap cannot be done', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ error: 'No route' }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      await expect(
        protocol.doSwap({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
          fromAddress: '0xSender',
          destinationAddress: 'bc1qRecipient',
        }),
      ).rejects.toThrow('Can not make swap')
    })
  })

  describe('getSwapHistory', () => {
    it('should throw not implemented', async () => {
      await expect(protocol.getSwapHistory({ chainAddresses: [] })).rejects.toThrow('Not implemented')
    })
  })

  describe('shouldBeApproved', () => {
    it('should return false', async () => {
      const result = await protocol.shouldBeApproved({
        asset: AssetETH as any,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        address: '0x123',
      })
      expect(result).toBe(false)
    })
  })

  describe('approveRouterToSpend', () => {
    it('should throw not implemented', async () => {
      expect(() => protocol.approveRouterToSpend({ asset: AssetETH as any })).toThrow('Not implemented')
    })
  })
})
