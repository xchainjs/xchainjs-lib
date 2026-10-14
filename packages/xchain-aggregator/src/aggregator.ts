import { Network } from '@xchainjs/xchain-client'
import { assetToString, isTokenAsset } from '@xchainjs/xchain-util'

import { DEFAULT_CONFIG } from './const'
import { ProtocolFactory } from './protocols'
import { ChainflipDepositChannel, ChainflipProtocol } from './protocols/chainflip'
import { OneClickDepositQuote, OneClickProtocol } from './protocols/oneclick'
import {
  Config,
  IProtocol,
  Protocol,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistory,
  SwapHistoryParams,
  SwapResume,
  TxSubmitted,
} from './types'

export class Aggregator {
  private protocols: IProtocol[]
  private config: Config & { protocols: Protocol[] }

  constructor(config?: Config) {
    const fConfig = { ...DEFAULT_CONFIG, ...config }

    let network = config?.network || Network.Mainnet
    if (!config?.network && config?.wallet) {
      network = config.wallet.getNetwork()
    }
    const configWithNetwork = { ...fConfig, network }

    this.verifyConfig(configWithNetwork)

    this.protocols = configWithNetwork.protocols.map((protocol) =>
      ProtocolFactory.getProtocol(protocol, configWithNetwork),
    )
    this.config = { ...configWithNetwork, protocols: this.protocols.map((protocol) => protocol.name) }
  }

  public getConfiguration(): Omit<Config & { protocols: Protocol[] }, 'wallet'> {
    return { protocols: this.config.protocols, affiliate: this.config.affiliate, network: this.config.network }
  }

  public setConfiguration(config: Config) {
    const fConfig = { ...DEFAULT_CONFIG, ...config }

    let network = config.network || Network.Mainnet
    if (!config.network && config.wallet) {
      network = config.wallet.getNetwork()
    }
    const configWithNetwork = { ...fConfig, network }

    this.verifyConfig(configWithNetwork)

    this.protocols = configWithNetwork.protocols.map((protocol) =>
      ProtocolFactory.getProtocol(protocol, configWithNetwork),
    )
    this.config = { ...configWithNetwork, protocols: this.protocols.map((protocol) => protocol.name) }
  }

  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap[]> {
    const estimateTask = async (protocol: IProtocol, params: QuoteSwapParams) => {
      const [isFromAssetSupported, isDestinationAssetSupported] = await Promise.all([
        protocol.isAssetSupported(params.fromAsset),
        protocol.isAssetSupported(params.destinationAsset),
      ])
      if (!isFromAssetSupported) throw Error(`${assetToString(params.fromAsset)} not supported in ${protocol.name}`)
      if (!isDestinationAssetSupported)
        throw Error(`${assetToString(params.destinationAsset)} not supported in ${protocol.name}`)

      return protocol.estimateSwap(params)
    }

    const results = await Promise.allSettled(this.protocols.map((protocol) => estimateTask(protocol, params)))

    const successfulQuotes: QuoteSwap[] = []

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        successfulQuotes.push(result.value)
      }
    })

    if (successfulQuotes.length === 0)
      throw Error(
        `Can not estimate swap from ${assetToString(params.fromAsset)} to ${assetToString(params.destinationAsset)}`,
      )

    return successfulQuotes
  }

  /**
   * Call immediately before broadcast; do not cache across expiry.
   * Chainflip `estimateSwap` is quote-only and does not open a channel.
   * `params` must include fromAddress and destinationAddress.
   */
  public async requestChainflipDepositAddress(params: QuoteSwapParams): Promise<ChainflipDepositChannel> {
    const protocol = this.protocols.find((p) => p.name === 'Chainflip')
    if (!protocol || !(protocol instanceof ChainflipProtocol)) {
      throw Error('Chainflip protocol is not enabled')
    }
    return protocol.openDepositChannel(params)
  }

  /**
   * Wet quote for the deposit address. Call immediately before sending funds.
   * OneClick `estimateSwap` is quote-only (`dry: true`).
   * `params` must include fromAddress and destinationAddress.
   */
  public async requestOneClickDepositAddress(params: QuoteSwapParams): Promise<OneClickDepositQuote> {
    const protocol = this.protocols.find((p) => p.name === 'OneClick')
    if (!protocol || !(protocol instanceof OneClickProtocol)) {
      throw Error('OneClick protocol is not enabled')
    }
    return protocol.requestDepositAddress(params)
  }

  /**
   * Call after transferring to the wet-quote deposit address.
   * Also the retry when registration fails after broadcast. Do not transfer again.
   */
  public async submitOneClickDeposit(txHash: string, depositAddress: string): Promise<void> {
    const protocol = this.protocols.find((p) => p.name === 'OneClick')
    if (!protocol || !(protocol instanceof OneClickProtocol)) {
      throw Error('OneClick protocol is not enabled')
    }
    return protocol.submitDeposit(txHash, depositAddress)
  }

  /**
   * If `protocol` is unset, swap on the quote with the greatest expected amount.
   * Approves the router when a token spend is not yet approved.
   */
  public async doSwap(params: QuoteSwapParams & { protocol?: Protocol }): Promise<TxSubmitted> {
    let successfulQuotes: QuoteSwap[] = []

    if (params.protocol) {
      const protocol = this.protocols.find((protocol) => protocol.name === params.protocol)
      if (!protocol) {
        throw Error(`${params.protocol} protocol is not supported`)
      }
      successfulQuotes = [await protocol.estimateSwap(params)]
    } else {
      const results = await Promise.allSettled(this.protocols.map((protocol) => protocol.estimateSwap(params)))

      successfulQuotes = results
        .filter((result): result is PromiseFulfilledResult<QuoteSwap> => result.status === 'fulfilled')
        .map((result) => result.value)
    }

    if (successfulQuotes.length === 0) {
      throw Error(
        `Cannot estimate swap from ${assetToString(params.fromAsset)} to ${assetToString(params.destinationAsset)}`,
      )
    }

    const bestQuote = successfulQuotes.reduce((best, current) =>
      current.expectedAmount.gt(best.expectedAmount) ? current : best,
    )

    const protocol = this.protocols.find((protocol) => protocol.name === bestQuote.protocol)
    if (!protocol) {
      throw Error(`${bestQuote.protocol} protocol is not supported`)
    }

    if (isTokenAsset(params.fromAsset)) {
      const approvalNeeded = await protocol.shouldBeApproved({
        asset: params.fromAsset,
        amount: params.amount,
        address: params.fromAddress || '',
      })

      if (approvalNeeded) {
        await protocol.approveRouterToSpend({ asset: params.fromAsset, amount: params.amount })
      }
    }

    return protocol.doSwap(params)
  }

  public async getSwapHistory(params: SwapHistoryParams): Promise<SwapHistory> {
    const getProtocolSwapHistory = async (protocol: IProtocol, params: SwapHistoryParams): Promise<SwapHistory> => {
      const supportedChains = await protocol.getSupportedChains()
      const compatibleChainAddresses = params.chainAddresses.filter(
        (chainAddress) => supportedChains.findIndex((supportedChain) => supportedChain === chainAddress.chain) !== -1,
      )
      return compatibleChainAddresses.length === 0
        ? {
            swaps: [],
            count: 0,
          }
        : protocol.getSwapHistory({
            chainAddresses: compatibleChainAddresses,
          })
    }

    const results = await Promise.allSettled(
      this.protocols.map((protocol) => {
        return getProtocolSwapHistory(protocol, params)
      }),
    )

    const swaps: SwapResume[] = []

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        swaps.push(...result.value.swaps)
      }
    })

    return {
      count: swaps.length,
      swaps: swaps.sort((swapA, swapB) => swapB.date.getTime() - swapA.date.getTime()),
    }
  }

  private verifyConfig(config: Config & { protocols: Protocol[] }) {
    if (config.affiliate && (config.affiliate.basisPoints < 0 || config.affiliate.basisPoints > 10_000))
      throw Error('Invalid affiliate basis point due to it is out of bound. It must be between [0 - 10000]')

    if (config.protocols.length === 0) throw Error('No protocols enabled')
  }
}
