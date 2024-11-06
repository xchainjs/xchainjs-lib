import { assetToString, eqAsset, isTokenAsset } from '@xchainjs/xchain-util'

import { DEFAULT_CONFIG } from './const'
import { ProtocolFactory } from './protocols'
import {
  Config,
  EarnPosition,
  EarnProduct,
  IProtocol,
  ListEarnPositionParams,
  Protocol,
  QuoteAddToEarn,
  QuoteAddToEarnParams,
  QuoteSwap,
  QuoteSwapParams,
  QuoteWithdrawFromEarn,
  SwapHistory,
  SwapHistoryParams,
  SwapResume,
  TxSubmitted,
  WithdrawFromEarnParams,
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
      throw Error(
        `Can not estimate swap from ${assetToString(params.fromAsset)} to ${assetToString(params.destinationAsset)}`,
      )

    return optimalSwap
  }

  /**
   * Do swap
   * @param {QuoteSwapParams & { protocol?: Protocol }} params Swap parameters. If protocol is not set,
   * estimateSwap will be call and swap will be done in protocol with the greatest expected amount
   * Approve the tx if needed
   * @returns the swap with the greatest expected amount estimated in the supported protocols
   */
  public async doSwap(params: QuoteSwapParams & { protocol?: Protocol }): Promise<TxSubmitted> {
    const protocolName = params.protocol ? params.protocol : (await this.estimateSwap(params)).protocol
    const protocol = this.getProtocol(protocolName)

    if (isTokenAsset(params.fromAsset)) {
      if (
        await protocol.shouldBeApproved({
          asset: params.fromAsset,
          amount: params.amount,
          address: params.fromAddress || '',
        })
      ) {
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

  /**
   * List supported earn products by each protocol
   * @returns the earn products the protocol supports
   */
  public async listEarnProducts(): Promise<Record<Protocol, EarnProduct[]>> {
    const listTask = async (protocol: IProtocol) => {
      return protocol.listEarnProducts()
    }

    const products: Record<Protocol, EarnProduct[]> = {
      Thorchain: [],
      Mayachain: [],
      Chainflip: [],
    }

    const results = await Promise.allSettled(this.protocols.map((protocol) => listTask(protocol)))

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        products[this.protocols[index].name] = result.value
      }
    })

    return products
  }

  /**
   * List supported earn products by each protocol
   * @returns the earn products the protocol supports
   */
  public async listEarnPositions(params: ListEarnPositionParams): Promise<Record<Protocol, EarnPosition[]>> {
    const listTask = async (protocol: IProtocol) => {
      return protocol.listEarnPositions(params)
    }

    const products: Record<Protocol, EarnPosition[]> = {
      Thorchain: [],
      Mayachain: [],
      Chainflip: [],
    }

    const results = await Promise.allSettled(this.protocols.map((protocol) => listTask(protocol)))

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        products[this.protocols[index].name] = result.value
      }
    })

    return products
  }

  /**
   *
   * @param config
   */
  public async estimateAddToEarnProduct(params: QuoteAddToEarnParams): Promise<QuoteAddToEarn> {
    const estimateTask = async (protocol: IProtocol, params: QuoteAddToEarnParams): Promise<EarnProduct> => {
      const isAssetSupported = await protocol.isAssetSupported(params.amount.asset)
      if (!isAssetSupported) throw Error(`${assetToString(params.amount.asset)} not supported in ${protocol.name}`)

      const products = await protocol.listEarnProducts()

      const product = products.find((product) => eqAsset(product.asset, params.amount.asset))

      if (!product) throw Error(`${assetToString(params.amount.asset)} product not supported in ${protocol.name}`)

      return product
    }

    const results = await Promise.allSettled(this.protocols.map((protocol) => estimateTask(protocol, params)))

    let optimalProduct: EarnProduct | undefined

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (!optimalProduct || result.value.apr > optimalProduct.apr) optimalProduct = result.value
      }
    })

    if (!optimalProduct) throw Error(`Can not find earn product from ${assetToString(params.amount.asset)}`)

    return this.getProtocol(optimalProduct.protocol).estimateAddToEarnProduct(params)
  }

  public async addToEarnProduct(params: QuoteAddToEarnParams & { protocol?: Protocol }): Promise<TxSubmitted> {
    const protocolName = params.protocol ? params.protocol : (await this.estimateAddToEarnProduct(params)).protocol
    const protocol = this.getProtocol(protocolName)

    if (isTokenAsset(params.amount.asset)) {
      if (
        await protocol.shouldBeApproved({
          asset: params.amount.asset,
          amount: params.amount,
          address: params.fromAddress || '',
        })
      ) {
        await protocol.approveRouterToSpend({ asset: params.amount.asset, amount: params.amount })
      }
    }

    return protocol.addToEarnProduct({ amount: params.amount })
  }

  public async estimateWithdrawFromEarnProduct(
    params: WithdrawFromEarnParams & { protocol: Protocol },
  ): Promise<QuoteWithdrawFromEarn> {
    const protocol = this.getProtocol(params.protocol)
    if (params.withdrawBps <= 0 || params.withdrawBps > 10000) {
      throw Error('Withdraw bps out of range')
    }
    return protocol.estimateWithdrawFromEarnProduct(params)
  }

  public async withdrawFromEarnProduct(params: WithdrawFromEarnParams & { protocol: Protocol }): Promise<TxSubmitted> {
    const protocol = this.getProtocol(params.protocol)
    return protocol.withdrawFromEarnProduct(params)
  }

  private verifyConfig(config: Config & { protocols: Protocol[] }) {
    if (config.affiliate && (config.affiliate.basisPoints < 0 || config.affiliate.basisPoints > 10_000))
      throw Error('Invalid affiliate basis point due to it is out of bound. It must be between [0 - 10000]')

    if (config.protocols.length === 0) throw Error('No protocols enabled')
  }

  private getProtocol(name: Protocol): IProtocol {
    const protocol = this.protocols.find((protocol) => protocol.name === name)
    if (!protocol) throw Error('Protocol not found')
    return protocol
  }
}
