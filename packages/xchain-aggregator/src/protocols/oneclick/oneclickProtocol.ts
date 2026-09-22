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

import {
  ApproveParams,
  IProtocol,
  IsApprovedParams,
  ProtocolConfig,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistory,
  SwapHistoryParams,
  TxSubmitted,
} from '../../types'

import { OneClickApi } from './api'
import {
  CompatibleAsset,
  OneClickDepositQuote,
  OneClickQuoteRequest,
  OneClickQuoteResponse,
  OneClickToken,
} from './types'
import { ONECLICK_PREVIEW_ADDRESS, findOneClickToken, oneClickBlockchainToXChain } from './utils'

export class OneClickProtocol implements IProtocol {
  public readonly name = 'OneClick' as const

  private api: OneClickApi
  private wallet?: Wallet
  private affiliateAddress?: string
  private affiliateBps?: number
  private tokensCache: CachedValue<OneClickToken[]>

  constructor(configuration?: ProtocolConfig) {
    this.api = new OneClickApi(configuration?.oneClickApiKey, configuration?.oneClickReferral)
    this.wallet = configuration?.wallet
    this.affiliateAddress = configuration?.affiliateAddress
    this.affiliateBps = configuration?.affiliateBps
    this.tokensCache = new CachedValue(() => this.api.getTokens(), 24 * 60 * 60 * 1000)
  }

  public async approveRouterToSpend(_params: ApproveParams): Promise<TxSubmitted> {
    throw new Error('Not implemented')
  }

  public async shouldBeApproved(_params: IsApprovedParams): Promise<boolean> {
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

  /**
   * Estimate swap (quote only). Always requests a dry 1Click quote.
   *
   * A dry quote prices the route and often has `depositAddress: null`.
   * `canSwap` means `amountOut` is present — call {@link requestDepositAddress}
   * (or {@link doSwap}) immediately before broadcast to obtain a deposit address.
   *
   * @param {QuoteSwapParams} params Swap parameters.
   * @returns {QuoteSwap} Quote result. `toAddress` is empty unless the dry response includes one.
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const pair = await this.resolvePair(params)
    if ('error' in pair) return this.errorQuote(params, pair.error)

    try {
      const resp = await this.api.getQuote(this.buildQuoteRequest(params, pair.srcToken, pair.destToken, true))

      if (resp.error || resp.message || !resp.quote) {
        return this.errorQuote(params, resp.error || resp.message || 'Unknown error')
      }

      const quote = resp.quote
      const amountOut = quote.amountOut
      const hasAmountOut = amountOut != null && String(amountOut) !== '' && String(amountOut) !== '0'

      return {
        protocol: this.name,
        toAddress: quote.depositAddress ?? '',
        memo: '',
        expectedAmount: new CryptoAmount(baseAmount(amountOut, pair.destToken.decimals), params.destinationAsset),
        dustThreshold: new CryptoAmount(baseAmount(0), params.fromAsset),
        totalSwapSeconds: quote.timeEstimate ?? 0,
        maxStreamingQuantity: undefined,
        canSwap: hasAmountOut,
        warning: '',
        errors: [],
        slipBasisPoints: 0,
        fees: {
          asset: params.fromAsset,
          affiliateFee: this.buildAffiliateFee(params, resp),
          outboundFee: new CryptoAmount(baseAmount(0), params.destinationAsset),
        },
      }
    } catch (e) {
      return this.errorQuote(params, e instanceof Error ? e.message : 'Unknown error')
    }
  }

  /**
   * Request a wet 1Click quote and return the deposit address for broadcast.
   * Call immediately before sending funds. Requires real refund and recipient addresses.
   *
   * @param {QuoteSwapParams} params Must include `fromAddress` and `destinationAddress`
   * @returns {OneClickDepositQuote} Deposit address and the egress amount bound to it
   */
  public async requestDepositAddress(params: QuoteSwapParams): Promise<OneClickDepositQuote> {
    if (!params.fromAddress) throw new Error('fromAddress is required to request a OneClick deposit address')
    if (!params.destinationAddress) {
      throw new Error('destinationAddress is required to request a OneClick deposit address')
    }

    const pair = await this.resolvePair(params)
    if ('error' in pair) throw new Error(`Can not make swap. ${pair.error}`)

    const resp = await this.api.getQuote(this.buildQuoteRequest(params, pair.srcToken, pair.destToken, false))
    if (resp.error || resp.message || !resp.quote) {
      throw new Error(`Can not make swap. ${resp.error || resp.message || 'Unknown error'}`)
    }

    const depositAddress = resp.quote.depositAddress
    if (!depositAddress) throw new Error('Can not make swap. OneClick quote returned no deposit address')

    return {
      depositAddress,
      expectedAmount: new CryptoAmount(
        baseAmount(resp.quote.amountOut, pair.destToken.decimals),
        params.destinationAsset,
      ),
      correlationId: resp.correlationId,
    }
  }

  /**
   * Resolve affiliate bps from echoed quoteRequest.appFees (matching our recipient),
   * falling back to the configured affiliateBps when appFees were sent.
   * Fee is charged from the input asset: amountIn * bps / 10000.
   */
  private resolveAffiliateFeeBps(resp: OneClickQuoteResponse): number | undefined {
    const echoed = resp.quoteRequest?.appFees?.find((fee) => fee.recipient === this.affiliateAddress)
    if (echoed != null && Number.isFinite(echoed.fee)) return echoed.fee
    if (this.affiliateAddress && this.affiliateBps) return this.affiliateBps
    return undefined
  }

  private buildAffiliateFee(params: QuoteSwapParams, resp: OneClickQuoteResponse): CryptoAmount {
    const decimals = params.amount.baseAmount.decimal
    const feeBps = this.resolveAffiliateFeeBps(resp)
    if (!feeBps) {
      return new CryptoAmount(baseAmount(0, decimals), params.fromAsset)
    }
    const feeAmount = params.amount.baseAmount.amount().multipliedBy(feeBps).dividedToIntegerBy(10000)
    return new CryptoAmount(baseAmount(feeAmount, decimals), params.fromAsset)
  }

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    if (!this.wallet) throw new Error('Wallet not configured. Can not do swap')

    const deposit = await this.requestDepositAddress(params)

    const hash = await this.wallet.transfer({
      recipient: deposit.depositAddress,
      amount: params.amount.baseAmount,
      asset: params.fromAsset as CompatibleAsset,
      memo: '',
    })

    // Funds are already on the wire. Registration failure must not look like success,
    // and the retry is submitDeposit with this hash and deposit address — not another transfer.
    try {
      await this.submitDeposit(hash, deposit.depositAddress)
    } catch (e) {
      throw new Error(
        `1Click deposit tx ${hash} was broadcast to ${deposit.depositAddress}, but submitDeposit failed: ${
          e instanceof Error ? e.message : 'unknown error'
        }. Retry submitOneClickDeposit with this hash and deposit address; do not transfer again.`,
      )
    }

    // Explorer URL is best-effort; the hash is what callers actually need for tracking.
    let url = ''
    try {
      url = await this.wallet.getExplorerTxUrl(params.fromAsset.chain, hash)
    } catch {
      // swallow: explorer URL lookup must not reject a successful swap
    }

    return { hash, url }
  }

  /**
   * Register an already-broadcast origin tx with 1Click.
   * Wallets that sign outside `doSwap` call this after transferring to the wet quote's deposit address.
   * Also the retry when registration fails after broadcast. Do not transfer again.
   */
  public async submitDeposit(txHash: string, depositAddress: string): Promise<void> {
    if (!txHash) throw new Error('txHash is required to submit a OneClick deposit')
    if (!depositAddress) throw new Error('depositAddress is required to submit a OneClick deposit')
    await this.api.submitDeposit(txHash, depositAddress)
  }

  private async resolvePair(
    params: QuoteSwapParams,
  ): Promise<{ srcToken: OneClickToken; destToken: OneClickToken } | { error: string }> {
    const tokens = await this.tokensCache.getValue()
    const srcToken = findOneClickToken(params.fromAsset, tokens)
    const destToken = findOneClickToken(params.destinationAsset, tokens)
    if (!srcToken) return { error: 'Source asset not supported' }
    if (!destToken) return { error: 'Destination asset not supported' }
    return { srcToken, destToken }
  }

  private buildQuoteRequest(
    params: QuoteSwapParams,
    srcToken: OneClickToken,
    destToken: OneClickToken,
    dry: boolean,
  ): OneClickQuoteRequest {
    // 1Click rejects empty refundTo/recipient even on dry quotes.
    // recipientType is DESTINATION_CHAIN, so a missing destination uses the preview
    // placeholder rather than the origin-chain fromAddress.
    const refundTo = params.fromAddress || (dry ? ONECLICK_PREVIEW_ADDRESS : '')
    const recipient = params.destinationAddress || (dry ? ONECLICK_PREVIEW_ADDRESS : '')

    return {
      dry,
      swapType: 'EXACT_INPUT',
      depositType: 'ORIGIN_CHAIN',
      recipientType: 'DESTINATION_CHAIN',
      refundType: 'ORIGIN_CHAIN',
      originAsset: srcToken.assetId,
      destinationAsset: destToken.assetId,
      amount: params.amount.baseAmount.amount().toFixed(0),
      refundTo,
      recipient,
      slippageTolerance: params.toleranceBps ?? 100,
      deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      appFees:
        this.affiliateAddress && this.affiliateBps
          ? [{ recipient: this.affiliateAddress, fee: this.affiliateBps }]
          : undefined,
    }
  }

  public async getSwapHistory(_params: SwapHistoryParams): Promise<SwapHistory> {
    return { count: 0, swaps: [] }
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
