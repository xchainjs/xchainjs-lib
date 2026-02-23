/**
 * Simplified Swap Service for Testing GUI
 *
 * Uses THORChain AMM, MAYAChain AMM, and Chainflip SDK directly.
 */

import type { Network } from '@xchainjs/xchain-client'
import { type Asset, type CryptoAmount, type Chain, CryptoAmount as CryptoAmountClass, baseAmount as baseAmountFn } from '@xchainjs/xchain-util'

// Types for swap quotes
export interface SwapQuote {
  protocol: 'Thorchain' | 'Mayachain' | 'Chainflip'
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
  fromAsset: Asset
  destinationAsset: Asset
  amount: CryptoAmount
  fromAddress: string
  destinationAddress: string
  // Streaming swap parameters (THORChain only)
  streamingInterval?: number // Interval in blocks between sub-swaps
  streamingQuantity?: number // Number of sub-swaps (0 = automatic)
}

export interface SwapResult {
  hash: string
  url: string
  depositChannelId?: string
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
        affiliateAddress: 'dx',
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

    console.log('[SwapService] Returning quotes:', quotes.length)
    return quotes
  }

  async doSwap(params: SwapParams & { protocol: 'Thorchain' | 'Mayachain' | 'Chainflip' }): Promise<SwapResult> {
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

        const depositResponse = await sdk.requestDepositAddressV2({
          quote: bestQuote,
          destAddress: params.destinationAddress,
          fillOrKillParams: {
            slippageTolerancePercent: bestQuote.recommendedSlippageTolerancePercent || 2,
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
      } else if (params.protocol === 'Thorchain') {
        console.log('[SwapService] Executing THORChain swap...')
        const thorchainAmm = await getThorchainAmm(this.wallet)
        const result = await thorchainAmm.doSwap({
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
