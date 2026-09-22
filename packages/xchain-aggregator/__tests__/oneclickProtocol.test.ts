import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import {
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'

import { Aggregator } from '../src'
import { OneClickApi } from '../src/protocols/oneclick/api'
import { OneClickProtocol } from '../src/protocols/oneclick'
import { OneClickToken } from '../src/protocols/oneclick/types'
import {
  ONECLICK_PREVIEW_ADDRESS,
  findOneClickToken,
  oneClickBlockchainToXChain,
  toOneClickAmountString,
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
  {
    assetId: 'nep141:wrap.near',
    blockchain: 'near',
    symbol: 'wNEAR',
    decimals: 24,
    contractAddress: 'wrap.near',
  },
  {
    assetId: 'nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
    blockchain: 'near',
    symbol: 'USDC',
    decimals: 6,
    contractAddress: '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
  },
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
      expect(xChainToOneClickBlockchain('NEAR')).toBe('near')
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
      expect(oneClickBlockchainToXChain('near')).toBe('NEAR')
    })

    it('should return null for unknown blockchains', () => {
      expect(oneClickBlockchainToXChain('ton')).toBeNull()
    })
  })

  describe('findOneClickToken', () => {
    it('should find native token by chain and symbol', () => {
      const token = findOneClickToken(AssetBTC, mockTokens)
      expect(token).toBeDefined()
      expect(token?.assetId).toBe('nep141:btc.omft.near')
    })

    it('should map native NEAR to wrap.near / wNEAR', () => {
      const near = assetFromStringEx('NEAR.NEAR')
      const token = findOneClickToken(near, mockTokens)
      expect(token).toBeDefined()
      expect(token?.assetId).toBe('nep141:wrap.near')
      expect(token?.contractAddress).toBe('wrap.near')
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

  describe('toOneClickAmountString', () => {
    it('should keep digit-only strings', () => {
      expect(toOneClickAmountString('7700000000000000000000000')).toBe('7700000000000000000000000')
    })

    it('should expand scientific notation to an integer digit string', () => {
      expect(toOneClickAmountString('7.7e+24')).toBe('7700000000000000000000000')
      expect(toOneClickAmountString('1e+24')).toBe('1000000000000000000000000')
      expect(toOneClickAmountString('1.2e+2')).toBe('120')
    })

    it('should truncate fractional base units toward zero', () => {
      expect(toOneClickAmountString('1.9')).toBe('1')
      expect(toOneClickAmountString('0.1')).toBe('0')
    })

    it('should not send a signed amount', () => {
      expect(toOneClickAmountString('-7.7e+24')).toBe('0')
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
      mockFetch.mockImplementation((url: string, _options?: RequestInit) => {
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
      expect(parsed.refundTo).toBe(ONECLICK_PREVIEW_ADDRESS)
      expect(parsed.recipient).toBe(ONECLICK_PREVIEW_ADDRESS)
      expect(parsed.referral).toBeUndefined()
    })

    it('should use the preview recipient when only fromAddress is set', async () => {
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
        fromAddress: '0xSender',
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.dry).toBe(true)
      expect(parsed.refundTo).toBe('0xSender')
      expect(parsed.recipient).toBe(ONECLICK_PREVIEW_ADDRESS)
    })

    it('should stay dry and canSwap from amountOut when a deposit address is absent', async () => {
      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { depositAddress: null, amountOut: '99000', timeEstimate: 600 } }),
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

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.dry).toBe(true)
      expect(parsed.refundTo).toBe('0xSender')
      expect(parsed.recipient).toBe('bc1qRecipient')
      expect(quote.canSwap).toBe(true)
      expect(quote.toAddress).toBe('')
      expect(quote.expectedAmount.baseAmount.amount().toString()).toBe('99000')
    })

    it('should send NEAR 24dp amounts as digit-only base units', async () => {
      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { amountOut: '100000', timeEstimate: 30 } }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const near = assetFromStringEx('NEAR.NEAR')
      const nearUsdc = assetFromStringEx('NEAR.USDC-17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1')
      // 7.7 NEAR in 24dp base units. BigNumber#toString() is "7.7e+24".
      const amount = new CryptoAmount(baseAmount('7700000000000000000000000', 24), near)
      expect(amount.baseAmount.amount().toString()).toBe('7.7e+24')

      const quote = await protocol.estimateSwap({
        fromAsset: near,
        destinationAsset: nearUsdc,
        amount,
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.amount).toBe('7700000000000000000000000')
      expect(parsed.amount).toMatch(/^\d+$/)
      expect(parsed.dry).toBe(true)
      expect(parsed.originAsset).toBe('nep141:wrap.near')
      expect(parsed.destinationAsset).toBe('nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1')
      expect(quote.canSwap).toBe(true)
      expect(quote.expectedAmount.baseAmount.amount().toString()).toBe('100000')
    })

    it('should set canSwap false when amountOut is zero', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { amountOut: '0', timeEstimate: 600 } }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const quote = await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
      })

      expect(quote.canSwap).toBe(false)
      expect(quote.errors).toHaveLength(0)
    })

    it('should include the 1Click error body when the quote request is rejected', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ message: 'amount must match pattern' }),
          })
        }
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) })
      })

      const quote = await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
      })

      expect(quote.canSwap).toBe(false)
      expect(quote.errors).toContain('1Click getQuote failed: 400: amount must match pattern')
    })

    it('should stamp oneClickReferral on the quote body', async () => {
      protocol = new OneClickProtocol({ oneClickReferral: 'asgardex' })
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
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      expect(JSON.parse(capturedBody!).referral).toBe('asgardex')
    })

    it('should populate affiliateFee from echoed quoteRequest.appFees matching affiliate address', async () => {
      const affiliateAddress = 'bc1qydqk2n5wwm2ugg05tv482w8p42734gft0ssze8'
      protocol = new OneClickProtocol({
        affiliateAddress,
        affiliateBps: 30,
      })

      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                quoteRequest: {
                  appFees: [
                    { recipient: affiliateAddress, fee: 15 },
                    { recipient: '5880ad2b362620fadf759cbceb1cd5737ce8c6ed7fb8e9942881e6731f9247dd', fee: 25 },
                  ],
                },
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

      // 1 ETH = 1e18 base units; echoed fee 15 bps → 1e18 * 15 / 10000 = 1.5e15
      const quote = await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.appFees).toEqual([{ recipient: affiliateAddress, fee: 30 }])
      expect(quote.fees.affiliateFee.baseAmount.amount().toString()).toBe('1500000000000000')
      expect(assetToString(quote.fees.affiliateFee.asset)).toBe('ETH.ETH')
      expect(quote.fees.affiliateFee.baseAmount.decimal).toBe(18)
    })

    it('should fall back to configured affiliateBps when quoteRequest.appFees is absent', async () => {
      const affiliateAddress = 'bc1qydqk2n5wwm2ugg05tv482w8p42734gft0ssze8'
      protocol = new OneClickProtocol({
        affiliateAddress,
        affiliateBps: 30,
      })

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

      // 1 BTC = 1e8 sats; 30 bps → 1e8 * 30 / 10000 = 300000
      const quote = await protocol.estimateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 8)), AssetBTC),
        fromAddress: 'bc1qSender',
        destinationAddress: '0xRecipient',
      })

      expect(quote.fees.affiliateFee.baseAmount.amount().toString()).toBe('300000')
      expect(assetToString(quote.fees.affiliateFee.asset)).toBe('BTC.BTC')
    })

    it('should leave affiliateFee at 0 when no affiliate is configured', async () => {
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

      const quote = await protocol.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      expect(quote.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
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
      protocol = new OneClickProtocol({
        wallet: {
          transfer: jest.fn(),
          getExplorerTxUrl: jest.fn(),
        } as never,
      })
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

    it('should request a wet quote and transfer to the deposit address', async () => {
      const transfer = jest.fn().mockResolvedValue('near-tx-hash')
      const getExplorerTxUrl = jest.fn().mockResolvedValue('https://nearblocks.io/txns/near-tx-hash')
      protocol = new OneClickProtocol({
        wallet: { transfer, getExplorerTxUrl } as never,
      })

      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                correlationId: 'corr-1',
                quote: { depositAddress: 'bc1qwetdeposit', amountOut: '99000', timeEstimate: 600 },
              }),
          })
        }
        if (url.includes('/v0/deposit/submit')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const nearAmount = new CryptoAmount(baseAmount('7700000000000000000000000', 24), assetFromStringEx('NEAR.NEAR'))
      const result = await protocol.doSwap({
        fromAsset: assetFromStringEx('NEAR.NEAR'),
        destinationAsset: AssetETH,
        amount: nearAmount,
        fromAddress: 'sender.near',
        destinationAddress: '0xRecipient',
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.dry).toBe(false)
      expect(parsed.amount).toBe('7700000000000000000000000')
      expect(parsed.refundTo).toBe('sender.near')
      expect(parsed.recipient).toBe('0xRecipient')
      expect(transfer).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: 'bc1qwetdeposit',
          memo: '',
        }),
      )
      expect(result).toEqual({ hash: 'near-tx-hash', url: 'https://nearblocks.io/txns/near-tx-hash' })
    })

    it('should report the broadcast hash and deposit address when submitDeposit fails', async () => {
      const transfer = jest.fn().mockResolvedValue('near-tx-hash')
      protocol = new OneClickProtocol({
        wallet: {
          transfer,
          getExplorerTxUrl: jest.fn(),
        } as never,
      })

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                quote: { depositAddress: 'bc1qwetdeposit', amountOut: '99000' },
              }),
          })
        }
        if (url.includes('/v0/deposit/submit')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ message: 'deposit not found' }),
          })
        }
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) })
      })

      await expect(
        protocol.doSwap({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
          fromAddress: '0xSender',
          destinationAddress: 'bc1qRecipient',
        }),
      ).rejects.toThrow(
        '1Click deposit tx near-tx-hash was broadcast to bc1qwetdeposit, but submitDeposit failed: 1Click submitDeposit failed: 400: deposit not found. Retry submitOneClickDeposit with this hash and deposit address; do not transfer again.',
      )
      expect(transfer).toHaveBeenCalledTimes(1)
    })
  })

  describe('requestDepositAddress', () => {
    it('should require refund and recipient addresses', async () => {
      await expect(
        protocol.requestDepositAddress({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        }),
      ).rejects.toThrow(/fromAddress is required/)

      await expect(
        protocol.requestDepositAddress({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          fromAddress: '0xSender',
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        }),
      ).rejects.toThrow(/destinationAddress is required/)
    })

    it('should return the wet deposit address', async () => {
      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                correlationId: 'corr-2',
                quote: { depositAddress: 'bc1qwetdeposit', amountOut: '99000' },
              }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const deposit = await protocol.requestDepositAddress({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      expect(JSON.parse(capturedBody!).dry).toBe(false)
      expect(deposit.depositAddress).toBe('bc1qwetdeposit')
      expect(deposit.correlationId).toBe('corr-2')
      expect(deposit.expectedAmount.baseAmount.amount().toString()).toBe('99000')
    })

    it('should throw when the wet quote has no deposit address', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { amountOut: '99000' } }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      await expect(
        protocol.requestDepositAddress({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
          fromAddress: '0xSender',
          destinationAddress: 'bc1qRecipient',
        }),
      ).rejects.toThrow('OneClick quote returned no deposit address')
    })
  })

  describe('Aggregator.requestOneClickDepositAddress', () => {
    it('should open a wet quote through the aggregator', async () => {
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/tokens')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTokens) })
        }
        if (url.includes('/v0/quote')) {
          const body = JSON.parse(options?.body as string)
          expect(body.dry).toBe(false)
          expect(body.referral).toBe('asgardex')
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { depositAddress: 'bc1qwetdeposit', amountOut: '99000' } }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const aggregator = new Aggregator({ protocols: ['OneClick'], oneClickReferral: 'asgardex' })
      const deposit = await aggregator.requestOneClickDepositAddress({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        fromAddress: '0xSender',
        destinationAddress: 'bc1qRecipient',
      })

      expect(deposit.depositAddress).toBe('bc1qwetdeposit')
    })

    it('should throw if OneClick is disabled', async () => {
      const aggregator = new Aggregator({ protocols: ['Thorchain'] })
      await expect(
        aggregator.requestOneClickDepositAddress({
          fromAsset: AssetETH,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
          fromAddress: '0xSender',
          destinationAddress: 'bc1qRecipient',
        }),
      ).rejects.toThrow(/OneClick protocol is not enabled/)
    })
  })

  describe('submitOneClickDeposit', () => {
    it('should register a broadcast tx without requesting another quote', async () => {
      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/deposit/submit')) {
          capturedBody = options?.body as string
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        }
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) })
      })

      const aggregator = new Aggregator({ protocols: ['OneClick'] })
      await aggregator.submitOneClickDeposit('near-tx-hash', 'bc1qwetdeposit')

      expect(JSON.parse(capturedBody!)).toEqual({ txHash: 'near-tx-hash', depositAddress: 'bc1qwetdeposit' })
    })

    it('should throw the 1Click error body when registration is rejected', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/v0/deposit/submit')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ error: 'unknown deposit address' }),
          })
        }
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) })
      })

      const aggregator = new Aggregator({ protocols: ['OneClick'] })
      await expect(aggregator.submitOneClickDeposit('near-tx-hash', 'bc1qwetdeposit')).rejects.toThrow(
        '1Click submitDeposit failed: 400: unknown deposit address',
      )
    })

    it('should throw if OneClick is disabled', async () => {
      const aggregator = new Aggregator({ protocols: ['Thorchain'] })
      await expect(aggregator.submitOneClickDeposit('near-tx-hash', 'bc1qwetdeposit')).rejects.toThrow(
        /OneClick protocol is not enabled/,
      )
    })
  })

  describe('OneClickApi.getQuote', () => {
    it('should normalize a scientific amount at the HTTP boundary', async () => {
      let capturedBody: string | undefined
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url.includes('/v0/quote')) {
          capturedBody = options?.body as string
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ quote: { amountOut: '1' } }),
          })
        }
        return Promise.resolve({ ok: false, status: 404 })
      })

      const api = new OneClickApi(undefined, 'asgardex')
      await api.getQuote({
        dry: true,
        swapType: 'EXACT_INPUT',
        depositType: 'ORIGIN_CHAIN',
        recipientType: 'DESTINATION_CHAIN',
        refundType: 'ORIGIN_CHAIN',
        originAsset: 'nep141:wrap.near',
        destinationAsset: 'nep141:btc.omft.near',
        amount: '7.7e+24',
        refundTo: ONECLICK_PREVIEW_ADDRESS,
        recipient: ONECLICK_PREVIEW_ADDRESS,
      })

      const parsed = JSON.parse(capturedBody!)
      expect(parsed.amount).toBe('7700000000000000000000000')
      expect(parsed.referral).toBe('asgardex')
    })
  })

  describe('getSwapHistory', () => {
    it('should return an empty history', async () => {
      const result = await protocol.getSwapHistory({ chainAddresses: [] })
      expect(result).toEqual({ count: 0, swaps: [] })
    })
  })

  describe('shouldBeApproved', () => {
    it('should return false for a token asset', async () => {
      const usdt = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7') as TokenAsset
      const result = await protocol.shouldBeApproved({
        asset: usdt,
        amount: new CryptoAmount(assetToBase(assetAmount(100, 6)), usdt),
        address: '0x123',
      })
      expect(result).toBe(false)
    })
  })

  describe('approveRouterToSpend', () => {
    it('should reject as not implemented', async () => {
      const usdt = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7') as TokenAsset
      await expect(protocol.approveRouterToSpend({ asset: usdt })).rejects.toThrow('Not implemented')
    })
  })
})
