import { assetToString } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ChainflipProtocol, MayachainProtocol, ThorchainProtocol } from './protocols'
import {
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

  constructor(wallet?: Wallet) {
    this.protocols = [new ThorchainProtocol(wallet), new MayachainProtocol(wallet), new ChainflipProtocol(wallet)]
  }

  /**
   * Estimate swap
   * @param {QuoteSwapParams} params Swap parameters
   * @returns the swap with the greatest expected amount estimated in the supported protocols
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
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

    let optimalSwap: QuoteSwap | undefined

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (!optimalSwap || result.value.expectedAmount.assetAmount.gte(optimalSwap.expectedAmount.assetAmount))
          optimalSwap = result.value
      }
    })

    if (!optimalSwap)
      throw Error(`Can not estimate swap from ${assetToString(params.fromAsset)} to ${assetToString(params.fromAsset)}`)

    return optimalSwap
  }

  /**
   * Do swap
   * @param {QuoteSwapParams & { protocol?: Protocol }} params Swap parameters. If protocol is not set,
   * estimateSwap will be call and swap will be done in protocol with the greatest expected amount
   * @returns the swap with the greatest expected amount estimated in the supported protocols
   */
  public async doSwap(params: QuoteSwapParams & { protocol?: Protocol }): Promise<TxSubmitted> {
    const protocolName = params.protocol ? params.protocol : (await this.estimateSwap(params)).protocol
    const protocol = this.protocols.find((protocol) => protocol.name === protocolName)

    if (!protocol) throw Error(`${protocolName} protocol is not supported`)
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
}
