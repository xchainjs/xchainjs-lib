import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  LastBlock,
  LiquidityProvider,
  LiquidityProvidersApi,
  NetworkApi,
  Pool,
  PoolsApi,
  QueueApi,
  TransactionsApi,
  TxOutItem,
  TxResponse,
} from '@xchainjs/xchain-thornode'
import axios from 'axios'
import axiosRetry from 'axios-retry'

export type ThornodeConfig = {
  apiRetries: number
  thornodeBaseUrls: string[]
}

const defaultThornodeConfig: Record<Network, ThornodeConfig> = {
  mainnet: {
    apiRetries: 3,
    thornodeBaseUrls: [
      `https://thornode.ninerealms.com`,
      `https://thornode.thorswap.net`,
      `https://thornode.thorchain.info`,
    ],
  },
  stagenet: {
    apiRetries: 3,
    thornodeBaseUrls: ['https://stagenet-thornode.ninerealms.com'],
  },
  testnet: {
    apiRetries: 3,
    thornodeBaseUrls: ['https://testnet.thornode.thorchain.info'],
  },
}

export class Thornode {
  private config: ThornodeConfig
  private network: Network
  private transactionsApi: TransactionsApi[]
  private queueApi: QueueApi[]
  private networkApi: NetworkApi[]
  private poolsApi: PoolsApi[]
  private liquidityProvidersApi: LiquidityProvidersApi[]

  constructor(network: Network = Network.Mainnet, config?: ThornodeConfig) {
    this.network = network
    this.config = config ?? defaultThornodeConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.transactionsApi = this.config.thornodeBaseUrls.map(
      (url) => new TransactionsApi(new Configuration({ basePath: url })),
    )
    this.queueApi = this.config.thornodeBaseUrls.map((url) => new QueueApi(new Configuration({ basePath: url })))
    this.networkApi = this.config.thornodeBaseUrls.map((url) => new NetworkApi(new Configuration({ basePath: url })))
    this.poolsApi = this.config.thornodeBaseUrls.map((url) => new PoolsApi(new Configuration({ basePath: url })))
    this.liquidityProvidersApi = this.config.thornodeBaseUrls.map(
      (url) => new LiquidityProvidersApi(new Configuration({ basePath: url })),
    )
  }

  /**
   * Returns the oubound transactions held by THORChain due to outbound delay
   * May be empty if there are no transactions
   *
   * @returns {ScheduledQueueItem} Array
   *
   */
  async getscheduledQueue(): Promise<TxOutItem[]> {
    for (const api of this.queueApi) {
      try {
        const queueScheduled = await api.queueScheduled()
        return queueScheduled.data
      } catch (e) {
        console.error(e)
        throw new Error(`THORNode not responding`)
      }
    }
    throw Error(`THORNode not responding`)
  }
  /**
   *
   * @param txHash - transaction hash
   * @returns - transaction object
   */
  async getTxData(txHash: string): Promise<TxResponse> {
    for (const api of this.transactionsApi) {
      try {
        const txResponse = await api.tx(txHash)
        return txResponse.data
      } catch (e) {
        const txR: TxResponse = {
          observed_tx: undefined,
          keysign_metric: undefined,
        }
        return txR
      }
    }
    throw new Error(`THORNode not responding`)
  }
  /**
   *
   * @param height - optional thorchain height only
   * @returns - last block data || or block data pertaining to that height number
   */
  async getLastBlock(height?: number): Promise<LastBlock[]> {
    for (const api of this.networkApi) {
      try {
        const lastBlock = await api.lastblock(height)
        return lastBlock.data
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
  /**
   *
   * @returns - thorchain pool
   */
  async getPools(): Promise<Pool[]> {
    for (const api of this.poolsApi) {
      try {
        const pools = await api.pools()
        return pools.data
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  /**
   *
   * @param asset - asset string
   * @param address - address
   * @param height - optional block height, defaults to current tip
   * @returns
   */
  async getLiquidityProvider(asset: string, address: string, height?: number): Promise<LiquidityProvider[]> {
    for (const api of this.liquidityProvidersApi) {
      try {
        const lp = await api.liquidityProvider(asset, address, height)
        return lp.data
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
}
