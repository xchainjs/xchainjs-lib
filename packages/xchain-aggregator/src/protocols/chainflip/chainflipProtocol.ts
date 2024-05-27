import { AssetData, SwapSDK } from '@chainflip/sdk/swap'
import { Asset, CachedValue, Chain, CryptoAmount, baseAmount, isSynthAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
// import { Fees } from '@xchainjs/xchain-client'

import { IProtocol, QuoteSwap, QuoteSwapParams, SwapHistory, TxSubmitted } from '../../types'

import { cChainToXChain, xAssetToCAsset } from './utils'

export class ChainflipProtocol implements IProtocol {
  public readonly name = 'Chainflip'
  private sdk: SwapSDK
  private wallet: Wallet
  private assetsData: CachedValue<AssetData[]>

  constructor(wallet: Wallet = new Wallet({})) {
    this.sdk = new SwapSDK({
      network: 'mainnet',
    })
    this.wallet = wallet
    this.assetsData = new CachedValue(() => {
      return this.sdk.getAssets()
    }, 24 * 60 * 60 * 1000)
  }

  public async isAssetSupported(asset: Asset): Promise<boolean> {
    if (isSynthAsset(asset)) return false
    try {
      await this.getAssetData(asset)
      return true
    } catch {
      return false
    }
  }

  public async getSupportedChains(): Promise<Chain[]> {
    const chains = await this.sdk.getChains()
    return chains.map((chain) => cChainToXChain(chain.chain)).filter((chain) => chain !== null) as Chain[]
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const srcAssetData = await this.getAssetData(params.fromAsset)
    const destAssetData = await this.getAssetData(params.destinationAsset)

    try {
      let toAddress = ''
      if (params.destinationAddress) {
        const depositAddressResponse = await this.sdk.requestDepositAddress({
          srcChain: srcAssetData.chain,
          srcAsset: srcAssetData.asset,
          destChain: destAssetData.chain,
          destAsset: destAssetData.asset,
          destAddress: params.destinationAddress,
          amount: params.amount.baseAmount.amount().toString(),
        })

        toAddress = depositAddressResponse.depositAddress
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
        slipBasisPoints: quote.boostQuote?.estimatedBoostFeeBps || 0,
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

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    const quoteSwap = await this.estimateSwap(params)
    if (!quoteSwap.canSwap) {
      throw Error(`Can not make swap. ${quoteSwap.errors.join('\n')}`)
    }

    const hash = await this.wallet.transfer({
      recipient: quoteSwap.toAddress,
      amount: params.amount.baseAmount,
      asset: params.fromAsset,
      memo: quoteSwap.memo,
    })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(params.fromAsset.chain, hash),
    }
  }

  getSwapHistory(): Promise<SwapHistory> {
    throw new Error('Method not implemented.')
  }

  private async getAssetData(asset: Asset): Promise<AssetData> {
    const chainAssets = await this.assetsData.getValue()
    const assetData = chainAssets.find((chainAsset) => {
      const contractAddress = asset.symbol.split('-').length > 1 ? asset.symbol.split('-')[1] : undefined
      return chainAsset.asset === xAssetToCAsset(asset) && chainAsset.contractAddress === contractAddress
    })
    if (!assetData) throw Error(`${asset.ticker} asset not supported in ${asset.chain} chain`)
    return assetData
  }
}
