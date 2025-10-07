import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  InboundAddress,
  LastBlock,
  MimirApi,
  MimirResponse,
  NetworkApi,
  PoolsApi,
  PoolsResponse,
  QuoteApi,
  QuoteSwapResponse,
  TradeAccountApi,
  TradeAccountsApi,
  TradeAccountsResponse,
  TradeUnitApi,
  TradeUnitResponse,
  TradeUnitsApi,
  TradeUnitsResponse,
} from '@xchainjs/xchain-mayanode'
import { Address } from '@xchainjs/xchain-util'
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
  private poolsApis: PoolsApi[]
  private tradeUnitApis: TradeUnitApi[]
  private tradeUnitsApis: TradeUnitsApi[]
  private tradeAccountApis: TradeAccountApi[]
  private tradeAccountsApis: TradeAccountsApi[]

  constructor(network: Network = Network.Mainnet, config?: MayanodeConfig) {
    this.network = network
    this.config = config ?? defaultMayanodeConfig[this.network]
    this.quoteApis = this.config.mayanodeBaseUrls.map((url) => new QuoteApi(new Configuration({ basePath: url })))
    this.mimirApis = this.config.mayanodeBaseUrls.map((url) => new MimirApi(new Configuration({ basePath: url })))
    this.networkApis = this.config.mayanodeBaseUrls.map((url) => new NetworkApi(new Configuration({ basePath: url })))
    this.poolsApis = this.config.mayanodeBaseUrls.map((url) => new PoolsApi(new Configuration({ basePath: url })))
    this.tradeUnitApis = this.config.mayanodeBaseUrls.map(
      (url) => new TradeUnitApi(new Configuration({ basePath: url })),
    )
    this.tradeUnitsApis = this.config.mayanodeBaseUrls.map(
      (url) => new TradeUnitsApi(new Configuration({ basePath: url })),
    )
    this.tradeAccountApis = this.config.mayanodeBaseUrls.map(
      (url) => new TradeAccountApi(new Configuration({ basePath: url })),
    )
    this.tradeAccountsApis = this.config.mayanodeBaseUrls.map(
      (url) => new TradeAccountsApi(new Configuration({ basePath: url })),
    )

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
            undefined, // refundAddress
            streamingInterval,
            streamingQuantity,
            toleranceBps,
            undefined, // liquidityToleranceBps
            affiliateBps?.toString(),
            affiliate,
          )
        ).data
      } catch (_e) {}
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
      } catch (_e) {}
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
      } catch (_e) {}
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
      } catch (_e) {}
    }
    throw Error(`MAYANode not responding`)
  }

  /**
   * Returns the total units and depth of a trade asset
   * @param {string} asset Trade asset (e.g., ETH~ETH)
   * @param {number} height Optional - Block height
   * @returns Returns the total units and depth of a trade asset
   */
  public async getTradeAssetUnits(asset: string, height?: number): Promise<TradeUnitResponse> {
    for (const api of this.tradeUnitApis) {
      try {
        const resp = (await api.tradeUnit(asset, height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`MAYANode not responding. Can not get asset trade units`)
  }

  /**
   * Returns the total units and depth for each trade asset
   * @param {number} height Block height
   * @returns Returns the total units and depth for each trade asset
   */
  public async getTradeAssetsUnits(height?: number): Promise<TradeUnitsResponse> {
    for (const api of this.tradeUnitsApis) {
      try {
        const resp = (await api.tradeUnits(height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`MAYANode not responding. Can not get trade units`)
  }

  /**
   * Returns the units and depth of a trade account address
   * @param {Address} address Maya address
   * @param {number} height Optional - Block height
   * @returns Returns the units and depth of a trade account
   */
  public async getTradeAssetAccount(address: Address, height?: number): Promise<TradeAccountsResponse> {
    for (const api of this.tradeAccountApis) {
      try {
        const resp = (await api.tradeAccount(address, height)).data
        return resp as unknown as TradeAccountsResponse
      } catch (_e) {}
    }
    throw new Error(`MAYANode not responding. Can not get trade asset account`)
  }

  /**
   * Returns all trade accounts for an asset
   * @param {string} asset Trade asset (e.g., ETH~ETH)
   * @param {number} height Optional - Block height
   * @returns Returns all trade accounts for an asset
   */
  public async getTradeAssetAccounts(asset: string, height?: number): Promise<TradeAccountsResponse> {
    for (const api of this.tradeAccountsApis) {
      try {
        const resp = (await api.tradeAccounts(asset, height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`MAYANode not responding. Can not get trade asset accounts`)
  }

  /**
   * Get all available pools.
   * @param height - optional MAYAChain height, default, latest block
   * @returns pool data
   */
  public async getPools(height?: number): Promise<PoolsResponse> {
    for (const api of this.poolsApis) {
      try {
        return (await api.pools(height)).data
      } catch (_e) {}
    }
    throw new Error(`MAYANode not responding`)
  }
}
