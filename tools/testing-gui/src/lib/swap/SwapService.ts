/**
 * Simplified Swap Service for Testing GUI
 *
 * Uses THORChain and MAYAChain AMM directly, bypassing the aggregator
 * to avoid Chainflip SDK browser compatibility issues.
 */

import type { Network } from '@xchainjs/xchain-client'
import type { Asset, CryptoAmount, Chain } from '@xchainjs/xchain-util'

// Types for swap quotes
export interface SwapQuote {
  protocol: 'Thorchain' | 'Mayachain'
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
}

// Lazy-loaded AMM instances
let thorchainAmmPromise: Promise<any> | null = null
let mayachainAmmPromise: Promise<any> | null = null

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
      })
      console.log('[SwapService] MAYAChain estimate:', estimate)

      quotes.push({
        protocol: 'Mayachain',
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
      console.error('[SwapService] MAYAChain estimate failed:', e)
    }

    console.log('[SwapService] Returning quotes:', quotes.length)
    return quotes
  }

  async doSwap(params: SwapParams & { protocol: 'Thorchain' | 'Mayachain' }): Promise<SwapResult> {
    console.log('[SwapService] doSwap called with:', {
      protocol: params.protocol,
      fromAsset: params.fromAsset,
      destinationAsset: params.destinationAsset,
      amount: params.amount.assetAmount.amount().toString(),
      fromAddress: params.fromAddress,
      destinationAddress: params.destinationAddress,
    })

    try {
      if (params.protocol === 'Thorchain') {
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
