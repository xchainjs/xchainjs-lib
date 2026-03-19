import {
  AnyAsset,
  CachedValue,
  Chain,
  CryptoAmount,
  baseAmount,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, ProtocolConfig, QuoteSwap, QuoteSwapParams, SwapHistory, TxSubmitted } from '../../types'

import { OneClickApi } from './api'
import { CompatibleAsset, OneClickToken } from './types'
import { findOneClickToken, oneClickBlockchainToXChain } from './utils'

export class OneClickProtocol implements IProtocol {
  public readonly name = 'OneClick' as const

  private api: OneClickApi
  private wallet?: Wallet
  private affiliateAddress?: string
  private affiliateBps?: number
  private tokensCache: CachedValue<OneClickToken[]>

  constructor(configuration?: ProtocolConfig) {
    this.api = new OneClickApi(configuration?.oneClickApiKey)
    this.wallet = configuration?.wallet
    this.affiliateAddress = configuration?.affiliateAddress
    this.affiliateBps = configuration?.affiliateBps
    this.tokensCache = new CachedValue(() => this.api.getTokens(), 24 * 60 * 60 * 1000)
  }

  public approveRouterToSpend(): Promise<TxSubmitted> {
    throw new Error('Not implemented')
  }

  public async shouldBeApproved(): Promise<boolean> {
    return false
  }

  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (isSynthAsset(asset) || isTradeAsset(asset) || isSecuredAsset(asset)) return false
    const tokens = await this.tokensCache.getValue()
    return findOneClickToken(asset, tokens) !== undefined
  }

  public async getSupportedChains(): Promise<Chain[]> {
    const tokens = await this.tokensCache.getValue()
    const chains = new Set<Chain>()
    for (const token of tokens) {
      const chain = oneClickBlockchainToXChain(token.blockchain)
      if (chain) chains.add(chain)
    }
    return Array.from(chains)
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const tokens = await this.tokensCache.getValue()

    const srcToken = findOneClickToken(params.fromAsset, tokens)
    const destToken = findOneClickToken(params.destinationAsset, tokens)

    if (!srcToken || !destToken) {
      return this.errorQuote(params, srcToken ? 'Destination asset not supported' : 'Source asset not supported')
    }

    try {
      const isDry = !(params.fromAddress && params.destinationAddress)
      const deadline = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      const appFees =
        this.affiliateAddress && this.affiliateBps
          ? [{ recipient: this.affiliateAddress, fee: this.affiliateBps }]
          : undefined

      const resp = await this.api.getQuote({
        dry: isDry,
        swapType: 'EXACT_INPUT',
        depositType: 'ORIGIN_CHAIN',
        recipientType: 'DESTINATION_CHAIN',
        refundType: 'ORIGIN_CHAIN',
        originAsset: srcToken.assetId,
        destinationAsset: destToken.assetId,
        amount: params.amount.baseAmount.amount().toString(),
        refundTo: params.fromAddress || '',
        recipient: params.destinationAddress || '',
        slippageTolerance: params.toleranceBps ?? 100,
        deadline,
        appFees,
      })

      if (resp.error || resp.message) {
        return this.errorQuote(params, resp.error || resp.message || 'Unknown error')
      }

      const quote = resp.quote
      const toAddress = quote.depositAddress ?? ''

      return {
        protocol: this.name,
        toAddress,
        memo: '',
        expectedAmount: new CryptoAmount(baseAmount(quote.amountOut, destToken.decimals), params.destinationAsset),
        dustThreshold: new CryptoAmount(baseAmount(0), params.fromAsset),
        totalSwapSeconds: quote.timeEstimate ?? 0,
        maxStreamingQuantity: undefined,
        canSwap: toAddress !== '',
        warning: '',
        errors: [],
        slipBasisPoints: 0,
        fees: {
          asset: params.fromAsset,
          affiliateFee: new CryptoAmount(baseAmount(0), params.fromAsset),
          outboundFee: new CryptoAmount(baseAmount(0), params.destinationAsset),
        },
      }
    } catch (e) {
      return this.errorQuote(params, e instanceof Error ? e.message : 'Unknown error')
    }
  }

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    const quoteSwap = await this.estimateSwap(params)
    if (!quoteSwap.canSwap) {
      throw new Error(`Can not make swap. ${quoteSwap.errors.join('\n')}`)
    }

    if (!this.wallet) throw new Error('Wallet not configured. Can not do swap')

    const hash = await this.wallet.transfer({
      recipient: quoteSwap.toAddress,
      amount: params.amount.baseAmount,
      asset: params.fromAsset as CompatibleAsset,
      memo: quoteSwap.memo,
    })

    // Fire-and-forget: notify 1Click about the deposit
    void this.api.submitDeposit(hash, quoteSwap.toAddress)

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(params.fromAsset.chain, hash),
    }
  }

  public async getSwapHistory(): Promise<SwapHistory> {
    throw new Error('Not implemented')
  }

  private errorQuote(params: QuoteSwapParams, error: string): QuoteSwap {
    return {
      protocol: this.name,
      toAddress: '',
      memo: '',
      expectedAmount: new CryptoAmount(baseAmount(0), params.destinationAsset),
      dustThreshold: new CryptoAmount(baseAmount(0), params.fromAsset),
      totalSwapSeconds: 0,
      maxStreamingQuantity: undefined,
      canSwap: false,
      warning: '',
      errors: [error],
      slipBasisPoints: 0,
      fees: {
        asset: params.fromAsset,
        affiliateFee: new CryptoAmount(baseAmount(0), params.fromAsset),
        outboundFee: new CryptoAmount(baseAmount(0), params.destinationAsset),
      },
    }
  }
}
