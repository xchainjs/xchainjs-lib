import { assetToString, isTokenAsset } from '@xchainjs/xchain-util'

import { DEFAULT_CONFIG } from './const'
import { ProtocolFactory } from './protocols'
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

// Class definition for an Aggregator
export class Aggregator {
  private protocols: IProtocol[]
  private config: Config & { protocols: Protocol[] }

  constructor(config?: Config) {
    const fConfig = { ...DEFAULT_CONFIG, ...config }

    this.verifyConfig(fConfig)

    this.protocols = fConfig.protocols.map((protocol) => ProtocolFactory.getProtocol(protocol, fConfig))
    this.config = { ...fConfig, protocols: this.protocols.map((protocol) => protocol.name) }
  }

  /**
   * Get the current Aggregator configuration
   * @returns {Omit<Config, 'wallet'>} the current Aggregator configuration
   */
  public getConfiguration(): Omit<Config & { protocols: Protocol[] }, 'wallet'> {
    return { protocols: this.config.protocols, affiliate: this.config.affiliate }
  }

  /**
   * Update the Aggregator configuration
   * @param {Configuration} config
   */
  public setConfiguration(config: Config) {
    const fConfig = { ...DEFAULT_CONFIG, ...config }

    this.verifyConfig(fConfig)

    this.protocols = fConfig.protocols.map((protocol) => ProtocolFactory.getProtocol(protocol, fConfig))
    this.config = { ...fConfig, protocols: this.protocols.map((protocol) => protocol.name) }
  }

  /**
   * Estimate swap
   * @param {QuoteSwapParams} params Swap parameters
   * @returns the swap with the greatest expected amount estimated in the supported protocols
   */
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

    if (!successfulQuotes)
      throw Error(
        `Can not estimate swap from ${assetToString(params.fromAsset)} to ${assetToString(params.destinationAsset)}`,
      )

    return successfulQuotes
  }

  /**
   * Do swap
   * @param {QuoteSwapParams & { protocol?: Protocol }} params Swap parameters. If protocol is not set,
   * estimateSwap will be call and swap will be done in protocol with the greatest expected amount
   * Approve the tx if needed
   * @returns the swap with the greatest expected amount estimated in the supported protocols
   */
  public async doSwap(params: QuoteSwapParams & { protocol?: Protocol }): Promise<TxSubmitted> {
    let successfulQuotes: QuoteSwap[] = []

    if (params.protocol) {
      // Use the specified protocol
      const protocol = this.protocols.find((protocol) => protocol.name === params.protocol)
      if (!protocol) {
        throw Error(`${params.protocol} protocol is not supported`)
      }
      successfulQuotes = [await protocol.estimateSwap(params)]
    } else {
      // Fetch quotes from all protocols
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

    // Select the quote with the highest expected amount
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

  /**
   * Get historical swaps
   * @param {Address[]} addresses Addresses of which return their swap history
   * @returns the swap history
   */
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
