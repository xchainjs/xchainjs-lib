import { AssetData, SwapSDK } from '@chainflip/sdk/swap'
import {
  AnyAsset,
  Asset,
  CachedValue,
  Chain,
  CryptoAmount,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  baseAmount,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { IProtocol, ProtocolConfig, QuoteSwap, QuoteSwapParams, SwapHistory, TxSubmitted } from '../../types'

import { CompatibleAsset } from './types'
import { cChainToXChain, xAssetToCAsset } from './utils'

/**
 * Chainflip protocol
 */
export class ChainflipProtocol implements IProtocol {
  public readonly name = 'Chainflip'
  private sdk: SwapSDK
  private wallet?: Wallet
  private assetsData: CachedValue<AssetData[]>

  constructor(configuration?: ProtocolConfig) {
    this.sdk = new SwapSDK({
      network: 'mainnet',
    })
    this.wallet = configuration?.wallet
    this.assetsData = new CachedValue(() => {
      return this.sdk.getAssets()
    }, 24 * 60 * 60 * 1000)
  }

  /**
   * Check if an asset is supported in the protocol
   * @param {Asset} asset Asset to check if it is supported
   * @returns {boolean} True if the asset is supported, otherwise false
   */
  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (isSynthAsset(asset) || isTradeAsset(asset)) return false
    try {
      await this.getAssetData(asset)
      return true
    } catch {
      return false
    }
  }

  /**
   * Retrieve the supported chains by the protocol
   * @returns {Chain[]} the supported chains by the protocol
   */
  public async getSupportedChains(): Promise<Chain[]> {
    const chains = await this.sdk.getChains()
    return chains.map((chain) => cChainToXChain(chain.chain)).filter((chain) => chain !== null) as Chain[]
  }

  /**
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const srcAssetData = await this.getAssetData(params.fromAsset)
    const destAssetData = await this.getAssetData(params.destinationAsset)

    try {
      let toAddress = ''
      if (params.destinationAddress) {
        const { depositAddress } = await this.sdk.requestDepositAddress({
          srcChain: srcAssetData.chain,
          srcAsset: srcAssetData.asset,
          destChain: destAssetData.chain,
          destAsset: destAssetData.asset,
          destAddress: params.destinationAddress,
          amount: params.amount.baseAmount.amount().toString(),
        })

        toAddress = depositAddress
      }

      const { quote } = await this.sdk.getQuote({
        srcChain: srcAssetData.chain,
        srcAsset: srcAssetData.asset,
        destChain: destAssetData.chain,
        destAsset: destAssetData.asset,
        amount: params.amount.baseAmount.amount().toString(),
      })

      const outboundFee = quote.includedFees.find((fee) => fee.type === 'EGRESS')
      const brokerFee = quote.includedFees.find((fee) => fee.type === 'BROKER')

      return {
        protocol: this.name,
        toAddress,
        memo: '',
        expectedAmount: new CryptoAmount(
          baseAmount(quote.egressAmount, destAssetData.decimals),
          params.destinationAsset,
        ),
        dustThreshold: new CryptoAmount(
          baseAmount(srcAssetData.minimumSwapAmount, srcAssetData.decimals),
          params.fromAsset,
        ),
        totalSwapSeconds: quote.estimatedDurationSeconds,
        canSwap: toAddress !== '',
        warning: quote.lowLiquidityWarning
          ? 'Do not cache this response. Do not send funds after the expiry. The difference in the chainflip swap rate (excluding fees) is lower than the global index rate of the swap by more than a certain threshold (currently set to 5%)'
          : 'Do not cache this response. Do not send funds after the expiry.',
        errors: [],
        slipBasisPoints: 0,
        fees: {
          asset: params.destinationAsset,
          outboundFee: new CryptoAmount(
            baseAmount(outboundFee ? outboundFee.amount : 0, destAssetData.decimals),
            params.destinationAsset,
          ),
          affiliateFee: new CryptoAmount(
            baseAmount(brokerFee ? brokerFee.amount : 0, destAssetData.decimals),
            params.destinationAsset,
          ),
        },
      }
    } catch (e) {
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
        canSwap: false,
        warning: '',
        errors: [e instanceof Error ? e.message : 'Unknown error'],
        slipBasisPoints: 0,
        fees: {
          asset: params.destinationAsset,
          outboundFee: new CryptoAmount(baseAmount(0, destAssetData.decimals), params.destinationAsset),
          affiliateFee: new CryptoAmount(baseAmount(0, destAssetData.decimals), params.destinationAsset),
        },
      }
    }
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    const quoteSwap = await this.estimateSwap(params)
    if (!quoteSwap.canSwap) {
      throw Error(`Can not make swap. ${quoteSwap.errors.join('\n')}`)
    }

    if (!this.wallet) throw Error('Wallet not configured. Can not do swap')

    const hash = await this.wallet.transfer({
      recipient: quoteSwap.toAddress,
      amount: params.amount.baseAmount,
      asset: params.fromAsset as CompatibleAsset,
      memo: quoteSwap.memo,
    })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(params.fromAsset.chain, hash),
    }
  }

  /**
   * Get historical swaps
   * @throws {Error} - Method not implemented.
   * @returns the swap history
   */
  public async getSwapHistory(): Promise<SwapHistory> {
    throw new Error('Method not implemented.')
  }

  /**
   * Get asset data
   * @param {Asset} asset - Asset of which return data
   * @throws {Error} - If asset is not supported in Chainflip
   * @returns the asset data
   */
  private async getAssetData(asset: Asset | TokenAsset | SynthAsset | TradeAsset): Promise<AssetData> {
    if (isSynthAsset(asset)) {
      throw Error('Synth asset not supported in Chainflip protocol')
    }
    if (isTradeAsset(asset)) {
      throw Error('Trade asset not supported in Chainflip protocol')
    }
    const chainAssets = await this.assetsData.getValue()
    const assetData = chainAssets.find((chainAsset) => {
      const contractAddress = asset.symbol.split('-').length > 1 ? asset.symbol.split('-')[1] : undefined
      return (
        chainAsset.asset === xAssetToCAsset(asset) &&
        chainAsset.contractAddress?.toLowerCase() === contractAddress?.toLowerCase()
      )
    })
    if (!assetData) throw Error(`${asset.ticker} asset not supported in ${asset.chain} chain`)
    return assetData
  }
}
