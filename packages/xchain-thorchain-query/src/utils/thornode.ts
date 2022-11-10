import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  InboundAddress,
  LastBlock,
  LiquidityProvider,
  LiquidityProviderResponse,
  LiquidityProvidersApi,
  NetworkApi,
  Pool,
  PoolsApi,
  QueueApi,
  QuoteApi,
  QuoteSaverDepositResponse,
  QuoteSaverWithdrawResponse,
  QuoteSwapResponse,
  SaversApi,
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
  private saversApi: SaversApi[]
  private quoteApi: QuoteApi[]

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
    this.saversApi = this.config.thornodeBaseUrls.map((url) => new SaversApi(new Configuration({ basePath: url })))
    this.quoteApi = this.config.thornodeBaseUrls.map((url) => new QuoteApi(new Configuration({ basePath: url })))
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
        //console.error(e)
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
        //console.error(e)
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
        //console.error(e)
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
  async getLiquidityProvider(asset: string, address: string, height?: number): Promise<LiquidityProvider | undefined> {
    for (const api of this.liquidityProvidersApi) {
      try {
        const lps = (await api.liquidityProviders(asset, height)).data
        return lps.find((lp) => lp.asset_address === address || lp.rune_address === address)
      } catch (e) {
        //console.error(e)
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
  async getInboundAddresses(): Promise<InboundAddress[]> {
    for (const api of this.networkApi) {
      try {
        const resp = (await api.inboundAddresses()).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
  /**
   *
   * @param asset - asset string
   * @param height - optional thorchain block height parameter
   * @returns - Liquidity Provider Object
   */
  async getSavers(asset: string, height?: number): Promise<LiquidityProviderResponse> {
    for (const api of this.saversApi) {
      try {
        const resp = (await api.savers(asset, height)).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
  /**
   *
   * @param asset - asset string
   * @param height - optional thorchain block height parameter
   * @returns - Liquidity Provider Object
   */
  async getSaver(asset: string, address: string, height?: number): Promise<LiquidityProviderResponse> {
    for (const api of this.saversApi) {
      try {
        const resp = (await api.saver(asset, address, height)).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  /**
   *
   * @param asset - asset to add to savers
   * @param amount - amount to deposit
   * @param height - block height
   * @returns quotes deposit object response
   */
  async getSaversDepositQuote(asset: string, amount: number, height?: number): Promise<QuoteSaverDepositResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = (await api.quotesaverdeposit(height, asset, amount)).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  /**
   *
   * @param asset - asset to withdraw
   * @param address - savers address
   * @param height - block height
   * @param withdrawBps - withddraw percent
   * @returns quotes withdraw object response
   */
  async getSaversWithdrawQuote(
    asset: string,
    address: string,
    height?: number,
    withdrawBps?: number,
  ): Promise<QuoteSaverWithdrawResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = (await api.quotesaverwithdraw(height, asset, address, withdrawBps)).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  /**
   *
   * @param fromAsset - input asset
   * @param toAsset - output asset
   * @param amount - amount to swap
   * @param destination - vault address
   * @param toleranceBps - slip percent
   * @param affiliateBps - affiliate percent
   * @param affiliate - affiliate address
   * @param height - block height
   * @returns quotes swap object response
   */
  async getSwapQuote(
    fromAsset: string,
    toAsset: string,
    amount: number,
    destination: string,
    toleranceBps: number,
    affiliateBps: number,
    affiliate: string,
    height?: number,
  ): Promise<QuoteSwapResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = (
          await api.quoteswap(height, fromAsset, toAsset, amount, destination, toleranceBps, affiliateBps, affiliate)
        ).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
}
