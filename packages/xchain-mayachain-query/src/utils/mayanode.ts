import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  InboundAddress,
  LastBlock,
  MimirApi,
  MimirResponse,
  NetworkApi,
  QuoteApi,
  QuoteSwapResponse,
} from '@xchainjs/xchain-mayanode'
import axios from 'axios'
import axiosRetry from 'axios-retry'

export type MayanodeConfig = {
  apiRetries: number
  mayanodeBaseUrls: string[]
}

const defaultMayanodeConfig: Record<Network, MayanodeConfig> = {
  mainnet: {
    apiRetries: 3,
    mayanodeBaseUrls: ['https://mayanode.mayachain.info', 'https://api-maya.liquify.com'],
  },
  stagenet: {
    apiRetries: 3,
    mayanodeBaseUrls: ['https://stagenet.mayanode.mayachain.info'],
  },
  testnet: {
    apiRetries: 3,
    // There is no testnet for mayanode
    mayanodeBaseUrls: ['https://stagenet.mayanode.mayachain.info'],
  },
}

export class Mayanode {
  private config: MayanodeConfig
  private network: Network
  private quoteApis: QuoteApi[]
  private mimirApis: MimirApi[]
  private networkApis: NetworkApi[]

  constructor(network: Network = Network.Mainnet, config?: MayanodeConfig) {
    this.network = network
    this.config = config ?? defaultMayanodeConfig[this.network]
    this.quoteApis = this.config.mayanodeBaseUrls.map((url) => new QuoteApi(new Configuration({ basePath: url })))
    this.mimirApis = this.config.mayanodeBaseUrls.map((url) => new MimirApi(new Configuration({ basePath: url })))
    this.networkApis = this.config.mayanodeBaseUrls.map((url) => new NetworkApi(new Configuration({ basePath: url })))

    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
  }

  /**
   * TODO
   * @param fromAsset - input asset
   * @param toAsset - output asset
   * @param amount - amount to swap
   * @param destinationAddress - destination address for the swap
   * @param streamingInterval - the interval in which streaming swaps are swapped
   * @param streamingQuantity - the quantity of swaps within a streaming swap
   * @param toleranceBps - slip percent
   * @param affiliateBps - affiliate percent
   * @param affiliate - affiliate address
   * @param height - block height
   * @returns quotes swap object response
   */
  public async getSwapQuote(
    fromAsset: string,
    toAsset: string,
    amount: number,
    destinationAddress?: string,
    streamingInterval?: number,
    streamingQuantity?: number,
    toleranceBps?: number,
    affiliateBps?: number,
    affiliate?: string,
    height?: number,
  ): Promise<QuoteSwapResponse> {
    for (const api of this.quoteApis) {
      try {
        return (
          await api.quoteswap(
            height,
            fromAsset,
            toAsset,
            amount,
            destinationAddress,
            streamingInterval,
            streamingQuantity,
            toleranceBps,
            affiliateBps,
            affiliate,
          )
        ).data
      } catch (e) {}
    }
    throw new Error(`MAYANode not responding`)
  }

  /**
   * Get current active mimir configuration.
   * @returns mimir configuration
   */
  public async getMimir(): Promise<MimirResponse> {
    for (const api of this.mimirApis) {
      try {
        return (await api.mimir()).data
      } catch (e) {}
    }
    throw Error(`MAYANode not responding`)
  }

  /**
   * Get the set of asgard addresses that should be used for inbound transactions.
   * @returns MAYA inbound addresses
   */
  public async getInboundAddresses(): Promise<InboundAddress[]> {
    for (const api of this.networkApis) {
      try {
        const resp = (await api.inboundAddresses()).data
        return resp
      } catch (e) {}
    }
    throw new Error(`MAYANode not responding`)
  }

  /**
   * Return the last block of every chain at a certain MAYAChain height
   * @param height - optional MAYAChain height, default, latest block
   * @returns - last block data or block data pertaining to that height number
   */
  public async getLatestBlock(height?: number): Promise<LastBlock[]> {
    for (const api of this.networkApis) {
      try {
        return (await api.lastblock(height)).data
      } catch (e) {}
    }
    throw Error(`MAYANode not responding`)
  }
}
