import { AssetData, SwapSDK, Quote } from '@chainflip/sdk/swap'
import { Network } from '@xchainjs/xchain-client'
import {
  AnyAsset,
  Asset,
  CachedValue,
  Chain,
  CryptoAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  baseAmount,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, ProtocolConfig, QuoteSwap, QuoteSwapParams, SwapHistory, TxSubmitted } from '../../types'

import { ChainflipDepositChannel, CompatibleAsset } from './types'
import { cChainToXChain, isSameBscAsset, xAssetToCAsset } from './utils'
import { assetUSDC } from '@xchainjs/xchain-thorchain-query'

const networkToChainflip = (network?: Network): 'mainnet' | 'perseverance' => {
  switch (network) {
    case Network.Stagenet:
      return 'perseverance'
    case Network.Testnet:
      throw new Error('Chainflip has no testnet. Use mainnet or stagenet')
    case Network.Mainnet:
    default:
      return 'mainnet'
  }
}

type ChainflipNetwork = ReturnType<typeof networkToChainflip>

/**
 * BSC through Chainflip is mainnet only. Chainflip perseverance (xchainjs stagenet) runs on BSC
 * testnet (chain id 97), while the xchainjs BSC client on stagenet uses BSC mainnet, so a stagenet
 * deposit would go to a testnet channel address on mainnet. xchainjs testnet has no Chainflip network.
 */
export const CHAINFLIP_BSC_SUPPORTED_NETWORK: ChainflipNetwork = 'mainnet'

export class ChainflipUnsupportedNetworkError extends Error {
  constructor(chain: Chain, network: ChainflipNetwork, walletNetwork?: Network) {
    super(
      walletNetwork
        ? `${chain} is not supported by the Chainflip protocol with a "${walletNetwork}" wallet. ${chain} is supported on mainnet only`
        : `${chain} is not supported by the Chainflip protocol on Chainflip network "${network}". ${chain} is supported on mainnet only`,
    )
    this.name = 'ChainflipUnsupportedNetworkError'
  }
}

const isBscSwap = (params: QuoteSwapParams): boolean =>
  params.fromAsset.chain === 'BSC' || params.destinationAsset.chain === 'BSC'

/**
 * Broker-mode `requestDepositAddressV2` omits `estimatedDepositChannelExpiryTime`.
 * Chainflip deposit channels expire after ~24h; use that for TTL guards when the
 * SDK leaves expiry undefined (channel is already open — do not throw).
 */
export const CHAINFLIP_BROKER_CHANNEL_TTL_FALLBACK_SECONDS = 24 * 60 * 60

type SelectedQuoteContext = {
  srcAssetData: AssetData
  destAssetData: AssetData
  selectedQuote: Quote
  actualQuote: Quote
  isUsingBoost: boolean
}

export class ChainflipProtocol implements IProtocol {
  public readonly name = 'Chainflip'
  private sdk: SwapSDK
  private network: ChainflipNetwork
  private wallet?: Wallet
  private assetsData: CachedValue<AssetData[]>
  private affiliateBrokers?: {
    account: `cF${string}` | `0x${string}`
    commissionBps: number
  }[]

  constructor(configuration?: ProtocolConfig) {
    this.network = networkToChainflip(configuration?.network)
    this.sdk = new SwapSDK({
      network: this.network,
      broker: configuration?.brokerUrl ? { url: configuration.brokerUrl } : undefined,
    })
    this.wallet = configuration?.wallet
    this.affiliateBrokers = configuration?.affiliateBrokers
    this.assetsData = new CachedValue(() => {
      return this.sdk.getAssets()
    }, 24 * 60 * 60 * 1000)
  }
  public approveRouterToSpend(_params: { asset: TokenAsset; amount?: CryptoAmount }): Promise<TxSubmitted> {
    throw new Error('Not implemented')
  }
  public async shouldBeApproved(_params: {
    asset: TokenAsset
    amount: CryptoAmount
    address: string
  }): Promise<boolean> {
    return Promise.resolve(false)
  }

  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (isSynthAsset(asset) || isTradeAsset(asset)) return false
    try {
      await this.getAssetData(asset)
      return true
    } catch {
      return false
    }
  }

  public async getSupportedChains(): Promise<Chain[]> {
    const chains = await this.sdk.getChains()
    return chains
      .map((chain) => cChainToXChain(chain.chain))
      .filter((chain) => chain !== null && this.isChainAllowedOnNetwork(chain)) as Chain[]
  }

  /**
   * Quote only. Does not open a deposit channel.
   * Call openDepositChannel or doSwap immediately before broadcast.
   * `toAddress` and `depositChannelId` stay empty until a channel is opened.
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    this.assertNetworkSupported(params)
    const srcAssetData = await this.getAssetData(params.fromAsset)
    const destAssetData = await this.getAssetData(params.destinationAsset)

    try {
      const selected = await this.getSelectedQuote(params, srcAssetData, destAssetData)
      if (!selected) {
        return this.emptyQuoteSwap(params, srcAssetData, destAssetData, ['No suitable quote found'])
      }
      return this.mapQuoteToQuoteSwap(params, selected)
    } catch (e) {
      return this.emptyQuoteSwap(params, srcAssetData, destAssetData, [
        e instanceof Error ? e.message : 'Unknown error',
      ])
    }
  }

  /**
   * Open immediately before broadcast; do not cache across `expiresAt`.
   * `params` must include `fromAddress` and `destinationAddress`.
   */
  public async openDepositChannel(params: QuoteSwapParams): Promise<ChainflipDepositChannel> {
    this.assertNetworkSupported(params)
    if (!params.fromAddress) throw Error('fromAddress is required to open a Chainflip deposit channel')
    if (!params.destinationAddress) throw Error('destinationAddress is required to open a Chainflip deposit channel')

    const srcAssetData = await this.getAssetData(params.fromAsset)
    const destAssetData = await this.getAssetData(params.destinationAsset)
    const selected = await this.getSelectedQuote(params, srcAssetData, destAssetData)
    if (!selected) throw Error('No suitable Chainflip quote found')

    const quoteToUse = selected.actualQuote

    const resp = await this.sdk.requestDepositAddressV2({
      quote: quoteToUse,
      destAddress: params.destinationAddress,
      srcAddress: params.fromAddress,
      fillOrKillParams: {
        // Must match the effective quote (boost vs regular), not the parent wrapper.
        slippageTolerancePercent: quoteToUse.recommendedSlippageTolerancePercent,
        refundAddress: params.fromAddress,
        retryDurationBlocks: 100,
      },
      affiliateBrokers: this.affiliateBrokers,
    })

    // Backend API path returns estimatedDepositChannelExpiryTime. Broker RPC path
    // (@chainflip/sdk requestDepositAddressV2 with brokerUrl) only returns
    // sourceChainExpiryBlock and leaves estimatedExpiryTime undefined — do not fail
    // the open after the channel already exists. Chainflip channels live ~24h.
    const expiresAtSeconds =
      resp.estimatedDepositChannelExpiryTime ??
      Math.floor(Date.now() / 1000) + CHAINFLIP_BROKER_CHANNEL_TTL_FALLBACK_SECONDS

    return {
      depositAddress: resp.depositAddress,
      depositChannelId: resp.depositChannelId,
      expiresAt: new Date(expiresAtSeconds * 1000),
      depositChannelExpiryBlock: resp.depositChannelExpiryBlock,
      expectedAmount: new CryptoAmount(
        baseAmount(quoteToUse.egressAmount, destAssetData.decimals),
        params.destinationAsset,
      ),
      slipBasisPoints: quoteToUse.recommendedSlippageTolerancePercent
        ? quoteToUse.recommendedSlippageTolerancePercent * 100
        : 0,
    }
  }

  /**
   * Prefer openDepositChannel when the UI must track `expiresAt` and `depositChannelId`
   * around slow signing (for example Ledger) or post-broadcast monitoring.
   * `doSwap` does not return channel metadata.
   */
  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    this.assertNetworkSupported(params)
    if (!this.wallet) throw Error('Wallet not configured. Can not do swap')
    const walletNetwork = this.wallet.getNetwork()
    if (isBscSwap(params) && walletNetwork !== Network.Mainnet) {
      throw new ChainflipUnsupportedNetworkError('BSC', this.network, walletNetwork)
    }

    const channel = await this.openDepositChannel(params)

    const hash = await this.wallet.transfer({
      recipient: channel.depositAddress,
      amount: params.amount.baseAmount,
      asset: params.fromAsset as CompatibleAsset,
      memo: '',
    })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(params.fromAsset.chain, hash),
    }
  }

  public async getSwapHistory(): Promise<SwapHistory> {
    throw new Error('Method not implemented.')
  }

  private isChainAllowedOnNetwork(chain: Chain): boolean {
    return chain !== 'BSC' || this.network === CHAINFLIP_BSC_SUPPORTED_NETWORK
  }

  /** Runs before any SDK, backend, broker or wallet call. */
  private assertNetworkSupported(params: QuoteSwapParams): void {
    for (const asset of [params.fromAsset, params.destinationAsset]) {
      if (!this.isChainAllowedOnNetwork(asset.chain))
        throw new ChainflipUnsupportedNetworkError(asset.chain, this.network)
    }
  }

  private async getAssetData(asset: Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset): Promise<AssetData> {
    if (isSynthAsset(asset)) {
      throw Error('Synth asset not supported in Chainflip protocol')
    }
    if (isTradeAsset(asset)) {
      throw Error('Trade asset not supported in Chainflip protocol')
    }
    if (isSecuredAsset(asset)) {
      throw Error('Secured asset not supported in Chainflip protocol')
    }
    if (!this.isChainAllowedOnNetwork(asset.chain))
      throw new ChainflipUnsupportedNetworkError(asset.chain, this.network)
    const chainAssets = await this.assetsData.getValue()
    const assetData = chainAssets.find((chainAsset) => {
      return (
        chainAsset.asset === xAssetToCAsset(asset) &&
        asset.chain === cChainToXChain(chainAsset.chain) &&
        isSameBscAsset(asset, chainAsset)
      )
    })
    if (!assetData) throw Error(`${asset.ticker} asset not supported in ${asset.chain} chain`)
    return assetData
  }

  private async getSelectedQuote(
    params: QuoteSwapParams,
    srcAssetData: AssetData,
    destAssetData: AssetData,
  ): Promise<SelectedQuoteContext | undefined> {
    const { quotes } = await this.sdk.getQuoteV2({
      srcChain: srcAssetData.chain,
      srcAsset: srcAssetData.asset,
      destChain: destAssetData.chain,
      destAsset: destAssetData.asset,
      amount: params.amount.baseAmount.amount().toFixed(0),
      affiliateBrokers: this.affiliateBrokers,
    })

    let selectedQuote: Quote | undefined

    if (params.enableBoost) {
      selectedQuote =
        quotes.find((quote) => quote.type === 'DCA' && quote.boostQuote) ||
        quotes.find((quote) => quote.type === 'REGULAR' && quote.boostQuote) ||
        quotes.find((quote) => quote.type === 'DCA') ||
        quotes.find((quote) => quote.type === 'REGULAR')
    } else {
      selectedQuote = quotes.find((quote) => quote.type === 'DCA') || quotes.find((quote) => quote.type === 'REGULAR')
    }

    if (!selectedQuote) return undefined

    const isUsingBoost = Boolean(params.enableBoost && selectedQuote.boostQuote)
    const actualQuote = isUsingBoost && selectedQuote.boostQuote ? selectedQuote.boostQuote : selectedQuote

    return {
      srcAssetData,
      destAssetData,
      selectedQuote,
      actualQuote,
      isUsingBoost,
    }
  }

  private mapQuoteToQuoteSwap(params: QuoteSwapParams, selected: SelectedQuoteContext): QuoteSwap {
    const { destAssetData, srcAssetData, actualQuote, isUsingBoost } = selected

    const outboundFee = actualQuote.includedFees.find((fee) => fee.type === 'EGRESS')
    const brokerFee = actualQuote.includedFees.find((fee) => fee.type === 'BROKER')
    // Prefer USDC NETWORK fee; never overload networkFee with BOOST (different asset, no Fees.boostFee field).
    const networkFee =
      actualQuote.includedFees.find((fee) => fee.type === 'NETWORK' && fee.asset === 'USDC') ||
      actualQuote.includedFees.find((fee) => fee.type === 'NETWORK')
    const reportedNetworkFee = new CryptoAmount(baseAmount(networkFee ? networkFee.amount : 0, 6), assetUSDC)

    const baseWarning =
      'Do not cache this response. Open a deposit channel immediately before broadcast; do not send funds after channel expiry. Deposit must be observed by Chainflip before expiry (broadcast-before-expiry is not enough for slow EVM inclusion).'

    return {
      protocol: this.name,
      // Quote-only: channel is opened via openDepositChannel / doSwap
      toAddress: '',
      memo: '',
      expectedAmount: new CryptoAmount(
        baseAmount(actualQuote.egressAmount, destAssetData.decimals),
        params.destinationAsset,
      ),
      dustThreshold: new CryptoAmount(
        baseAmount(srcAssetData.minimumSwapAmount, srcAssetData.decimals),
        params.fromAsset,
      ),
      totalSwapSeconds: actualQuote.estimatedDurationSeconds ? actualQuote.estimatedDurationSeconds : 0,
      maxStreamingQuantity: undefined,
      // Usable quote exists — NOT "channel already open". Callers must open a channel before send.
      canSwap: true,
      warning: actualQuote.lowLiquidityWarning
        ? `${baseWarning} The difference in the chainflip swap rate (excluding fees) is lower than the global index rate of the swap by more than a certain threshold (currently set to 5%)`
        : isUsingBoost
        ? `${baseWarning} Boost enabled for faster processing.`
        : baseWarning,
      errors: [],
      slipBasisPoints: actualQuote.recommendedSlippageTolerancePercent
        ? actualQuote.recommendedSlippageTolerancePercent * 100
        : 0,
      fees: {
        asset: assetUSDC,
        networkFee: reportedNetworkFee,
        outboundFee: new CryptoAmount(
          baseAmount(outboundFee ? outboundFee.amount : 0, destAssetData.decimals),
          params.destinationAsset,
        ),
        affiliateFee: new CryptoAmount(baseAmount(brokerFee ? brokerFee.amount : 0, 6), assetUSDC),
      },
      depositChannelId: undefined,
    }
  }

  private emptyQuoteSwap(
    params: QuoteSwapParams,
    srcAssetData: AssetData,
    destAssetData: AssetData,
    errors: string[],
  ): QuoteSwap {
    return {
      protocol: this.name,
      toAddress: '',
      memo: '',
      expectedAmount: new CryptoAmount(baseAmount(0, destAssetData.decimals), params.destinationAsset),
      dustThreshold: new CryptoAmount(
        baseAmount(srcAssetData.minimumSwapAmount, srcAssetData.decimals),
        params.fromAsset,
      ),
      totalSwapSeconds: 0,
      maxStreamingQuantity: 0,
      canSwap: false,
      warning: '',
      errors,
      slipBasisPoints: 0,
      fees: {
        asset: params.destinationAsset,
        outboundFee: new CryptoAmount(baseAmount(0, destAssetData.decimals), params.destinationAsset),
        networkFee: new CryptoAmount(baseAmount(0, 6), assetUSDC),
        affiliateFee: new CryptoAmount(baseAmount(0, 6), assetUSDC),
      },
      depositChannelId: undefined,
    }
  }
}
