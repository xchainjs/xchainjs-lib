/**
 * Simplified Swap Service for Testing GUI
 *
 * Uses THORChain AMM, MAYAChain AMM, and Chainflip SDK directly.
 */

import type { Network } from '@xchainjs/xchain-client'
import { type AnyAsset, type CryptoAmount, type Chain, CryptoAmount as CryptoAmountClass, baseAmount as baseAmountFn } from '@xchainjs/xchain-util'

// Types for swap quotes
export interface SwapQuote {
  protocol: 'Thorchain' | 'Mayachain' | 'Chainflip' | 'OneClick'
  toAddress: string
  memo: string
  expectedAmount: CryptoAmount
  totalSwapSeconds: number
  slipBasisPoints: number
  canSwap: boolean
  errors: string[]
  warning: string
  fees: {
    affiliateFee: CryptoAmount
    outboundFee: CryptoAmount
  }
}

export interface SwapParams {
  fromAsset: AnyAsset
  destinationAsset: AnyAsset
  amount: CryptoAmount
  fromAddress: string
  destinationAddress: string
  // Streaming swap parameters (THORChain only)
  streamingInterval?: number // Interval in blocks between sub-swaps
  streamingQuantity?: number // Number of sub-swaps (0 = automatic)
  // Slippage tolerance in basis points (used for Chainflip fillOrKill)
  slippageToleranceBps?: number
}

export interface SwapResult {
  hash: string
  url: string
  depositChannelId?: string
}

// 1Click (NEAR Intents) chain mapping
const ONECLICK_CHAINS: Record<string, string> = {
  BTC: 'btc', ETH: 'eth', ARB: 'arb', AVAX: 'avax', BSC: 'bsc',
  SOL: 'sol', DOGE: 'doge', DASH: 'dash', LTC: 'ltc', BCH: 'bch',
  XRP: 'xrp', ADA: 'cardano', SUI: 'sui',
}

const ONECLICK_BASE_URL = 'https://1click.chaindefuser.com'

interface OneClickToken {
  assetId: string
  blockchain: string
  symbol: string
  decimals: number
  contractAddress?: string
}

// Cached token list (24h TTL)
let oneClickTokensCache: { tokens: OneClickToken[]; fetchedAt: number } | null = null

async function getOneClickTokens(): Promise<OneClickToken[]> {
  const now = Date.now()
  if (oneClickTokensCache && now - oneClickTokensCache.fetchedAt < 24 * 60 * 60 * 1000) {
    return oneClickTokensCache.tokens
  }
  const apiKey = import.meta.env.VITE_ONECLICK_API_KEY
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  const resp = await fetch(`${ONECLICK_BASE_URL}/v0/tokens`, { headers })
  if (!resp.ok) throw new Error(`1Click getTokens failed: ${resp.status}`)
  const tokens: OneClickToken[] = await resp.json()
  oneClickTokensCache = { tokens, fetchedAt: now }
  return tokens
}

function findOneClickToken(asset: AnyAsset, tokens: OneClickToken[]): OneClickToken | undefined {
  const blockchain = ONECLICK_CHAINS[asset.chain]
  if (!blockchain) return undefined

  // Token asset: match by contract address
  if (asset.symbol.includes('-')) {
    const contractAddress = asset.symbol.split('-')[1]
    return tokens.find(
      (t) => t.blockchain === blockchain && t.contractAddress &&
        t.contractAddress.toLowerCase() === contractAddress.toLowerCase(),
    )
  }

  // Native asset: match by symbol, no contract address
  return tokens.find(
    (t) => t.blockchain === blockchain && !t.contractAddress &&
      t.symbol.toUpperCase() === asset.symbol.toUpperCase(),
  )
}

function isOneClickCompatible(chain: string): boolean {
  return chain in ONECLICK_CHAINS
}

// Chainflip chain mapping
const CHAINFLIP_CHAINS: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ARB: 'Arbitrum',
  SOL: 'Solana',
}

function isChainflipCompatible(chain: string): boolean {
  return chain in CHAINFLIP_CHAINS
}

// Fetch best Chainflip quote for a given swap params
async function fetchBestChainflipQuote(params: SwapParams) {
  const srcChain = params.fromAsset.chain
  const destChain = params.destinationAsset.chain
  if (!isChainflipCompatible(srcChain) || !isChainflipCompatible(destChain)) {
    throw new Error(`Chainflip does not support chain pair: ${srcChain} → ${destChain}`)
  }

  const sdk = await getChainflipSdk()
  const srcChainName = CHAINFLIP_CHAINS[srcChain]
  const destChainName = CHAINFLIP_CHAINS[destChain]
  const srcAsset = params.fromAsset.ticker
  const destAsset = params.destinationAsset.ticker
  const amountStr = params.amount.baseAmount.amount().toFixed(0)

  const affiliateAddress = import.meta.env.VITE_ASGARDEX_AFFILIATE_BROKERS_ADDRESS
  const affiliateBrokers = affiliateAddress
    ? [{ account: affiliateAddress as `cF${string}` | `0x${string}`, commissionBps: 0 }]
    : undefined

  const quoteResponse = await sdk.getQuoteV2({
    srcChain: srcChainName,
    srcAsset,
    destChain: destChainName,
    destAsset,
    amount: amountStr,
    ...(affiliateBrokers && { affiliateBrokers }),
  })

  const cfQuotes = quoteResponse.quotes || []
  const bestQuote = cfQuotes.find((q: any) => q.type === 'REGULAR') || cfQuotes[0]

  return { sdk, bestQuote, affiliateBrokers }
}

// Lazy-loaded AMM instances
let thorchainAmmPromise: Promise<any> | null = null
let mayachainAmmPromise: Promise<any> | null = null
let chainflipSdkPromise: Promise<any> | null = null

async function getThorchainAmm(wallet: any) {
  if (!thorchainAmmPromise) {
    thorchainAmmPromise = (async () => {
      const { ThorchainAMM } = await import('@xchainjs/xchain-thorchain-amm')
      const { ThorchainQuery, ThorchainCache, Thornode } = await import('@xchainjs/xchain-thorchain-query')
      const { MidgardQuery, MidgardCache, Midgard } = await import('@xchainjs/xchain-midgard-query')

      const network = wallet.getNetwork()
      const midgardCache = new MidgardCache(new Midgard(network))
      const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
      const thorchainQuery = new ThorchainQuery(thorchainCache)

      return new ThorchainAMM(thorchainQuery, wallet)
    })()
  }
  return thorchainAmmPromise
}

async function getMayachainAmm(wallet: any) {
  if (!mayachainAmmPromise) {
    mayachainAmmPromise = (async () => {
      const { MayachainAMM } = await import('@xchainjs/xchain-mayachain-amm')
      const { MayachainQuery, MayachainCache, Mayanode } = await import('@xchainjs/xchain-mayachain-query')

      const network = wallet.getNetwork()
      // MayachainCache constructor has default MidgardQuery, just pass Mayanode
      const mayachainCache = new MayachainCache(undefined, new Mayanode(network))
      const mayachainQuery = new MayachainQuery(mayachainCache)

      return new MayachainAMM(mayachainQuery, wallet)
    })()
  }
  return mayachainAmmPromise
}

async function getChainflipSdk() {
  if (!chainflipSdkPromise) {
    chainflipSdkPromise = (async () => {
      const { SwapSDK } = await import('@chainflip/sdk/swap')
      const brokerUrl = import.meta.env.VITE_ASGARDEX_BROKER_URL
      return new SwapSDK({
        network: 'mainnet',
        broker: brokerUrl ? { url: brokerUrl } : undefined,
      })
    })()
  }
  return chainflipSdkPromise
}

// Exported for use by PoolsPage and SwapTrackingModal
export { getChainflipSdk }

export class SwapService {
  private wallet: any

  constructor(wallet: any) {
    this.wallet = wallet
  }

  async estimateSwap(params: SwapParams): Promise<SwapQuote[]> {
    console.log('[SwapService] estimateSwap called with:', {
      fromAsset: params.fromAsset,
      destinationAsset: params.destinationAsset,
      amount: params.amount.assetAmount.amount().toString(),
      fromAddress: params.fromAddress,
      destinationAddress: params.destinationAddress,
    })

    const quotes: SwapQuote[] = []

    // Try THORChain
    try {
      console.log('[SwapService] Getting THORChain AMM...')
      const thorchainAmm = await getThorchainAmm(this.wallet)
      console.log('[SwapService] Calling THORChain estimateSwap...')
      const estimate = await thorchainAmm.estimateSwap({
        fromAsset: params.fromAsset,
        destinationAsset: params.destinationAsset,
        amount: params.amount,
        fromAddress: params.fromAddress,
        destinationAddress: params.destinationAddress,
        affiliateAddress: 'xc',
        affiliateBps: 0,
        // Streaming swap parameters
        ...(params.streamingInterval !== undefined && { streamingInterval: params.streamingInterval }),
        ...(params.streamingQuantity !== undefined && { streamingQuantity: params.streamingQuantity }),
      })
      console.log('[SwapService] THORChain estimate:', estimate)

      quotes.push({
        protocol: 'Thorchain',
        toAddress: estimate.toAddress,
        memo: estimate.memo,
        expectedAmount: estimate.txEstimate.netOutput,
        totalSwapSeconds: (estimate.txEstimate.inboundConfirmationSeconds || 0) + estimate.txEstimate.outboundDelaySeconds,
        slipBasisPoints: estimate.txEstimate.slipBasisPoints,
        canSwap: estimate.txEstimate.canSwap,
        errors: estimate.txEstimate.errors,
        warning: estimate.txEstimate.warning,
        fees: {
          affiliateFee: estimate.txEstimate.totalFees.affiliateFee,
          outboundFee: estimate.txEstimate.totalFees.outboundFee,
        },
      })
    } catch (e) {
      console.error('[SwapService] THORChain estimate failed:', e)
    }

    // Try MAYAChain
    try {
      console.log('[SwapService] Getting MAYAChain AMM...')
      const mayachainAmm = await getMayachainAmm(this.wallet)
      console.log('[SwapService] Calling MAYAChain estimateSwap...')
      const estimate = await mayachainAmm.estimateSwap({
        fromAsset: params.fromAsset,
        destinationAsset: params.destinationAsset,
        amount: params.amount,
        fromAddress: params.fromAddress,
        destinationAddress: params.destinationAddress,
        affiliateAddress: 'dx',
        affiliateBps: 0,
        // Streaming swap parameters
        ...(params.streamingInterval !== undefined && { streamingInterval: params.streamingInterval }),
        ...(params.streamingQuantity !== undefined && { streamingQuantity: params.streamingQuantity }),
      })
      console.log('[SwapService] MAYAChain estimate:', estimate)

      // MAYAChain returns flat QuoteSwap structure (not nested like THORChain's TxDetails)
      quotes.push({
        protocol: 'Mayachain',
        toAddress: estimate.toAddress,
        memo: estimate.memo,
        expectedAmount: estimate.expectedAmount,
        totalSwapSeconds: estimate.totalSwapSeconds || ((estimate.inboundConfirmationSeconds || 0) + estimate.outboundDelaySeconds),
        slipBasisPoints: estimate.slipBasisPoints,
        canSwap: estimate.canSwap,
        errors: estimate.errors,
        warning: estimate.warning,
        fees: {
          affiliateFee: estimate.fees.affiliateFee,
          outboundFee: estimate.fees.outboundFee,
        },
      })
    } catch (e) {
      console.error('[SwapService] MAYAChain estimate failed:', e)
    }

    // Try Chainflip (only if both chains are supported)
    if (isChainflipCompatible(params.fromAsset.chain) && isChainflipCompatible(params.destinationAsset.chain)) {
      try {
        console.log('[SwapService] Getting Chainflip quote...')
        const { bestQuote } = await fetchBestChainflipQuote(params)

        if (bestQuote) {
          // Chainflip egressAmount is in base units with native decimals per chain
          const CF_DECIMALS: Record<string, number> = { BTC: 8, ETH: 18, ARB: 18, SOL: 9 }
          const destDecimals = CF_DECIMALS[params.destinationAsset.chain] || 18
          const expectedCrypto = new CryptoAmountClass(
            baseAmountFn(bestQuote.egressAmount, destDecimals),
            params.destinationAsset,
          )

          // Zero-value amount for fee placeholders (Chainflip fees are included in the quote)
          const zeroFee = new CryptoAmountClass(
            baseAmountFn(0, destDecimals),
            params.destinationAsset,
          )

          // Use recommended slippage tolerance as the price impact estimate
          const slipBps = Math.round((bestQuote.recommendedSlippageTolerancePercent || 0) * 100)

          quotes.push({
            protocol: 'Chainflip',
            toAddress: '',
            memo: '',
            expectedAmount: expectedCrypto,
            totalSwapSeconds: bestQuote.estimatedDurationSeconds || 0,
            slipBasisPoints: Math.max(0, slipBps),
            canSwap: true,
            errors: [],
            warning: bestQuote.lowLiquidityWarning ? 'Low liquidity - price impact may be high' : '',
            fees: {
              affiliateFee: zeroFee,
              outboundFee: zeroFee,
            },
          })
        }
      } catch (e) {
        console.error('[SwapService] Chainflip estimate failed:', e)
      }
    }

    // Try 1Click / NEAR Intents (only if both chains are supported)
    if (isOneClickCompatible(params.fromAsset.chain) && isOneClickCompatible(params.destinationAsset.chain)) {
      try {
        console.log('[SwapService] Getting 1Click quote...')
        const tokens = await getOneClickTokens()
        const srcToken = findOneClickToken(params.fromAsset, tokens)
        const destToken = findOneClickToken(params.destinationAsset, tokens)

        if (srcToken && destToken) {
          const apiKey = import.meta.env.VITE_ONECLICK_API_KEY
          const headers: Record<string, string> = { 'Content-Type': 'application/json' }
          if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

          const quoteResp = await fetch(`${ONECLICK_BASE_URL}/v0/quote`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              dry: false,
              swapType: 'EXACT_INPUT',
              depositType: 'ORIGIN_CHAIN',
              recipientType: 'DESTINATION_CHAIN',
              refundType: 'ORIGIN_CHAIN',
              originAsset: srcToken.assetId,
              destinationAsset: destToken.assetId,
              amount: params.amount.baseAmount.amount().toFixed(0),
              refundTo: params.fromAddress,
              recipient: params.destinationAddress,
              slippageTolerance: params.slippageToleranceBps ?? 100,
              deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            }),
          })

          if (!quoteResp.ok) throw new Error(`1Click quote failed: ${quoteResp.status}`)
          const resp = await quoteResp.json()

          if (!resp.error && !resp.message && resp.quote) {
            const depositAddress = resp.quote.depositAddress || ''
            const zeroFee = new CryptoAmountClass(baseAmountFn(0), params.destinationAsset)

            quotes.push({
              protocol: 'OneClick',
              toAddress: depositAddress,
              memo: '',
              expectedAmount: new CryptoAmountClass(
                baseAmountFn(resp.quote.amountOut, destToken.decimals),
                params.destinationAsset,
              ),
              totalSwapSeconds: resp.quote.timeEstimate || 0,
              slipBasisPoints: 0,
              canSwap: depositAddress !== '',
              errors: [],
              warning: '',
              fees: {
                affiliateFee: zeroFee,
                outboundFee: zeroFee,
              },
            })
          }
        }
      } catch (e) {
        console.error('[SwapService] 1Click estimate failed:', e)
      }
    }

    console.log('[SwapService] Returning quotes:', quotes.length)
    return quotes
  }

  async doSwap(params: SwapParams & { protocol: 'Thorchain' | 'Mayachain' | 'Chainflip' | 'OneClick' }): Promise<SwapResult> {
    console.log('[SwapService] doSwap called with:', {
      protocol: params.protocol,
      fromAsset: params.fromAsset,
      destinationAsset: params.destinationAsset,
      amount: params.amount.assetAmount.amount().toString(),
      fromAddress: params.fromAddress,
      destinationAddress: params.destinationAddress,
    })

    try {
      if (params.protocol === 'Chainflip') {
        console.log('[SwapService] Requesting Chainflip deposit channel...')
        const { sdk, bestQuote, affiliateBrokers } = await fetchBestChainflipQuote(params)
        if (!bestQuote) throw new Error('No Chainflip quote available')

        // Use user-provided slippage tolerance, fall back to quote recommendation or 2%
        const slippagePercent = params.slippageToleranceBps !== undefined
          ? params.slippageToleranceBps / 100
          : bestQuote.recommendedSlippageTolerancePercent || 2

        const depositResponse = await sdk.requestDepositAddressV2({
          quote: bestQuote,
          destAddress: params.destinationAddress,
          fillOrKillParams: {
            slippageTolerancePercent: slippagePercent,
            refundAddress: params.fromAddress,
            retryDurationBlocks: 100,
          },
          ...(affiliateBrokers && { affiliateBrokers }),
        })

        console.log('[SwapService] Chainflip deposit response:', depositResponse)

        const result = await this.wallet.transfer({
          asset: params.fromAsset,
          amount: params.amount.baseAmount,
          recipient: depositResponse.depositAddress,
        })
        console.log('[SwapService] Chainflip transfer result:', result)

        return {
          hash: result,
          url: `https://scan.chainflip.io/channels/${depositResponse.depositChannelId}`,
          depositChannelId: depositResponse.depositChannelId,
        }
      } else if (params.protocol === 'OneClick') {
        console.log('[SwapService] Executing 1Click swap...')
        // Re-estimate to get deposit address
        const tokens = await getOneClickTokens()
        const srcToken = findOneClickToken(params.fromAsset, tokens)
        const destToken = findOneClickToken(params.destinationAsset, tokens)
        if (!srcToken || !destToken) throw new Error('1Click: asset not supported')

        const apiKey = import.meta.env.VITE_ONECLICK_API_KEY
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

        const quoteResp = await fetch(`${ONECLICK_BASE_URL}/v0/quote`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            dry: false,
            swapType: 'EXACT_INPUT',
            depositType: 'ORIGIN_CHAIN',
            recipientType: 'DESTINATION_CHAIN',
            refundType: 'ORIGIN_CHAIN',
            originAsset: srcToken.assetId,
            destinationAsset: destToken.assetId,
            amount: params.amount.baseAmount.amount().toFixed(0),
            refundTo: params.fromAddress,
            recipient: params.destinationAddress,
            slippageTolerance: params.slippageToleranceBps ?? 100,
            deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          }),
        })
        if (!quoteResp.ok) throw new Error(`1Click quote failed: ${quoteResp.status}`)
        const resp = await quoteResp.json()
        if (resp.error || resp.message) throw new Error(`1Click: ${resp.error || resp.message}`)
        if (!resp.quote?.depositAddress) throw new Error('1Click: no deposit address returned')

        const hash = await this.wallet.transfer({
          asset: params.fromAsset,
          amount: params.amount.baseAmount,
          recipient: resp.quote.depositAddress,
        })
        console.log('[SwapService] 1Click transfer result:', hash)

        // Fire-and-forget: notify 1Click about the deposit
        fetch(`${ONECLICK_BASE_URL}/v0/deposit/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ txHash: hash, depositAddress: resp.quote.depositAddress }),
        }).catch(() => {})

        const explorerUrl = await this.wallet.getExplorerTxUrl(params.fromAsset.chain, hash)
        return { hash, url: explorerUrl }
      } else if (params.protocol === 'Thorchain') {
        console.log('[SwapService] Executing THORChain swap...')
        const thorchainAmm = await getThorchainAmm(this.wallet)
        const result = await thorchainAmm.doSwap({
          fromAsset: params.fromAsset,
          destinationAsset: params.destinationAsset,
          amount: params.amount,
          fromAddress: params.fromAddress,
          destinationAddress: params.destinationAddress,
          affiliateAddress: 'xc',
          affiliateBps: 0,
          // Streaming swap parameters
          ...(params.streamingInterval !== undefined && { streamingInterval: params.streamingInterval }),
          ...(params.streamingQuantity !== undefined && { streamingQuantity: params.streamingQuantity }),
        })
        console.log('[SwapService] THORChain swap result:', result)
        return result
      } else {
        console.log('[SwapService] Executing MAYAChain swap...')
        const mayachainAmm = await getMayachainAmm(this.wallet)
        const result = await mayachainAmm.doSwap({
          fromAsset: params.fromAsset,
          destinationAsset: params.destinationAsset,
          amount: params.amount,
          fromAddress: params.fromAddress,
          destinationAddress: params.destinationAddress,
          affiliateAddress: 'dx',
          affiliateBps: 0,
          // Streaming swap parameters
          ...(params.streamingInterval !== undefined && { streamingInterval: params.streamingInterval }),
          ...(params.streamingQuantity !== undefined && { streamingQuantity: params.streamingQuantity }),
        })
        console.log('[SwapService] MAYAChain swap result:', result)
        return result
      }
    } catch (e) {
      console.error('[SwapService] doSwap failed:', e)
      throw e
    }
  }
}
