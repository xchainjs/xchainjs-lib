import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  InboundAddress,
  LastBlock,
  LiquidityProvider,
  LiquidityProvidersApi,
  MimirApi,
  MimirResponse,
  NetworkApi,
  Pool,
  PoolsApi,
  QueueApi,
  QueueResponse,
  QuoteApi,
  QuoteSaverDepositResponse,
  QuoteSaverWithdrawResponse,
  QuoteSwapResponse,
  TransactionsApi,
  TxOutItem,
  TxResponse,
} from '@xchainjs/xchain-mayanode'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { SaversWithdraw } from '../types'

export type MayanodeConfig = {
  apiRetries: number
  mayanodeBaseUrls: string[]
}

const defaultMayanodeConfig: Record<Network, MayanodeConfig> = {
  mainnet: {
    apiRetries: 3,
    mayanodeBaseUrls: ['https://mayanode.mayachain.info'],
  },
  stagenet: {
    apiRetries: 3,
    mayanodeBaseUrls: ['https://stagenet.mayanode.mayachain.info'],
  },
  testnet: {
    apiRetries: 3,
    // @@@ There is no testnet for mayanode
    mayanodeBaseUrls: ['https://stagenet.mayanode.mayachain.info'],
  },
}

export class Mayanode {
  private config: MayanodeConfig
  private network: Network
  private transactionsApi: TransactionsApi[]
  private queueApi: QueueApi[]
  private networkApi: NetworkApi[]
  private poolsApi: PoolsApi[]
  private liquidityProvidersApi: LiquidityProvidersApi[]
  private quoteApi: QuoteApi[]
  private mimirApi: MimirApi[]

  constructor(network: Network = Network.Mainnet, config?: MayanodeConfig) {
    this.network = network
    this.config = config ?? defaultMayanodeConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.transactionsApi = this.config.mayanodeBaseUrls.map(
      (url) => new TransactionsApi(new Configuration({ basePath: url })),
    )
    this.queueApi = this.config.mayanodeBaseUrls.map((url) => new QueueApi(new Configuration({ basePath: url })))
    this.networkApi = this.config.mayanodeBaseUrls.map((url) => new NetworkApi(new Configuration({ basePath: url })))
    this.poolsApi = this.config.mayanodeBaseUrls.map((url) => new PoolsApi(new Configuration({ basePath: url })))
    this.liquidityProvidersApi = this.config.mayanodeBaseUrls.map(
      (url) => new LiquidityProvidersApi(new Configuration({ basePath: url })),
    )
    this.quoteApi = this.config.mayanodeBaseUrls.map((url) => new QuoteApi(new Configuration({ basePath: url })))
    this.mimirApi = this.config.mayanodeBaseUrls.map((url) => new MimirApi(new Configuration({ basePath: url })))
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
        throw new Error(`MAYANode not responding`)
      }
    }
    throw Error(`MAYANode not responding`)
  }
  /**
   * Returns queue
   * May be empty if there are no transactions
   *
   * @returns {ScheduledQueueItem} Array
   *
   */
  async getQueue(): Promise<QueueResponse> {
    for (const api of this.queueApi) {
      try {
        const queue = await api.queue()
        return queue.data
      } catch (e) {
        //console.error(e)
        throw new Error(`MAYANode not responding`)
      }
    }
    throw Error(`MAYANode not responding`)
  }
  /**
   * Returns Mimir
   * May be empty if there are no transactions
   *
   * @returns {ScheduledQueueItem} Array
   *
   */
  async getMimir(): Promise<MimirResponse> {
    for (const api of this.mimirApi) {
      try {
        const queue = await api.mimir()
        return queue.data
      } catch (e) {
        //console.error(e)
        throw new Error(`MAYANode not responding`)
      }
    }
    throw Error(`MAYANode not responding`)
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
    throw new Error(`MAYANode not responding`)
  }
  /**
   *
   * @param txHash - transaction hash
   * @returns - transaction object
   */
  // async getTxDetail(txHash: string): Promise<TxDetailsResponse> {
  //   for (const api of this.transactionsApi) {
  //     try {
  //       const txResponse = await api.txSigners(txHash)
  //       return txResponse.data
  //     } catch (e) {
  //       throw new Error(`MAYANode not responding`)
  //     }
  //   }
  //   throw new Error(`MAYANode not responding`)
  // }
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
    throw new Error(`MAYANode not responding`)
  }
  /**
   *
   * @returns - thorchain pools
   */
  async getPools(): Promise<Pool[]> {
    for (const api of this.poolsApi) {
      try {
        const pools = await api.pools()
        return pools.data
      } catch (e) {
        // console.error(e)
      }
    }
    throw new Error(`MAYANode not responding`)
  }

  /**
   *
   * @returns - thorchain pool
   */
  async getPool(asset: string): Promise<Pool> {
    for (const api of this.poolsApi) {
      try {
        const pools = await api.pool(asset)
        return pools.data
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`MAYANode not responding`)
  }

  /**
   *
   * @returns  Mayachain constants
   */
  async getTcConstants(): Promise<Record<string, string>> {
    for (const api of this.networkApi) {
      try {
        const constants = await api.constants()
        if (constants.data.int64_values) {
          return constants.data.int64_values
        }
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`MAYANode not responding`)
  }

  /**
   * Function that wraps Mimir and Constants to return the value from a given constant name. Searchs Mimir first.
   *
   * @param networkValueName the network value to be used to search the contsants
   * @returns the mimir or constants value
   */
  async getNetworkValues(): Promise<Record<string, number>> {
    const [mimirDetails, constantDetails] = await Promise.all([this.getMimir(), this.getTcConstants()])
    const retVal: Record<string, number> = {}
    // insert constants first

    for (const [key, value] of Object.entries(constantDetails)) {
      retVal[key.toUpperCase()] = parseInt(value)
    }
    // // mimir will overwrite any dupe constants
    for (const [key, value] of Object.entries(mimirDetails)) {
      retVal[key] = parseInt(value)
    }
    return retVal
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
        return lps.find((lp) => lp.asset_address === address || lp.cacao_address === address)
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`MAYANode not responding`)
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
    throw new Error(`MAYANode not responding`)
  }

  /**
   *
   * @param asset - asset string
   * @param height - optional thorchain block height parameter
   * @returns - Liquidity Provider Object
   */
  // async getSavers(asset: string, height?: number): Promise<SaversResponse> {
  //   for (const api of this.saversApi) {
  //     try {
  //       const resp = (await api.savers(asset, height)).data
  //       return resp
  //     } catch (e) {
  //       //console.error(e)
  //     }
  //   }
  //   throw new Error(`THORNode not responding`)
  // }

  /**
   *
   * @param asset - asset string
   * @param height - optional thorchain block height parameter
   * @returns - Liquidity Provider Object
   */
  // async getSaver(asset: string, address: string, height?: number): Promise<Saver> {
  //   for (const api of this.saversApi) {
  //     try {
  //       const resp = (await api.saver(asset, address, height)).data
  //       return resp
  //     } catch (e) {
  //       //console.error(e)
  //     }
  //   }
  //   throw new Error(`THORNode not responding`)
  // }

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
    throw new Error(`MAYANode not responding`)
  }

  /**
   *
   * @param asset - asset to withdraw
   * @param address - savers address
   * @param height - block height
   * @param withdrawBps - withddraw percent
   * @returns quotes withdraw object response
   */
  async getSaversWithdrawQuote(withdrawParams: SaversWithdraw): Promise<QuoteSaverWithdrawResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = await api.quotesaverwithdraw(
          withdrawParams.height,
          `${withdrawParams.asset.chain}.${withdrawParams.asset.ticker}`,
          withdrawParams.address,
          withdrawParams.withdrawBps,
        )
        return resp.data
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`MAYANode not responding`)
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
    destinationAddress?: string,
    toleranceBps?: number,
    affiliateBps?: number,
    affiliate?: string,
    height?: number,
  ): Promise<QuoteSwapResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = (
          await api.quoteswap(
            height,
            fromAsset,
            toAsset,
            amount,
            destinationAddress,
            toleranceBps,
            affiliateBps,
            affiliate,
          )
        ).data
        return resp
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`MAYANode not responding`)
  }

  /**
   *
   * @param height
   * @param asset
   * @param amount
   * @param targetAsset
   * @param destination
   * @param minOut
   * @param affiliateBps
   * @param affiliate
   * @returns
   */
  // async getLoanQuoteOpen(
  //   asset: string,
  //   amount: number,
  //   targetAsset: string,
  //   destination: string,
  //   minOut?: string,
  //   affiliateBps?: number,
  //   affiliate?: string,
  //   height?: number,
  // ): Promise<QuoteLoanOpenResponse> {
  //   for (const api of this.quoteApi) {
  //     try {
  //       const resp = (
  //         await api.quoteloanopen(height, asset, amount, targetAsset, destination, minOut, affiliateBps, affiliate)
  //       ).data
  //       return resp
  //     } catch (e) {
  //       //console.log(e)
  //     }
  //   }
  //   throw new Error(`MAYANode is not responding`)
  // }

  /**
   *
   * @param height
   * @param asset
   * @param amount
   * @param targetAsset
   * @param destination
   * @param minOut
   * @param affiliateBps
   * @param affiliate
   * @returns
   */
  // async getLoanQuoteClose(
  //   asset: string,
  //   amount: number,
  //   loanAsset: string,
  //   loanOwner: string,
  //   minOut?: string,
  //   height?: number,
  // ): Promise<QuoteLoanCloseResponse> {
  //   for (const api of this.quoteApi) {
  //     try {
  //       const resp = (await api.quoteloanclose(height, asset, amount, loanAsset, loanOwner, minOut)).data
  //       return resp
  //     } catch (e) {
  //       // console.log(e)
  //     }
  //   }
  //   throw new Error(`MAYANode is not responding`)
  // }
}
