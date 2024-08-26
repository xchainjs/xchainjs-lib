import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  InboundAddress,
  LastBlock,
  LiquidityProviderSummary,
  LiquidityProvidersApi,
  MimirApi,
  MimirResponse,
  NetworkApi,
  Pool,
  PoolsApi,
  QueueApi,
  QueueResponse,
  QuoteApi,
  QuoteLoanCloseResponse,
  QuoteLoanOpenResponse,
  QuoteSaverDepositResponse,
  QuoteSaverWithdrawResponse,
  QuoteSwapResponse,
  RUNEPoolApi,
  RUNEPoolResponse,
  RUNEProvider,
  RUNEProvidersResponse,
  Saver,
  SaversApi,
  SaversResponse,
  Thorname,
  ThornamesApi,
  TradeAccountApi,
  TradeAccountsApi,
  TradeAccountsResponse,
  TradeUnitApi,
  TradeUnitResponse,
  TradeUnitsApi,
  TradeUnitsResponse,
  TransactionsApi,
  TxDetailsResponse,
  TxOutItem,
  TxResponse,
} from '@xchainjs/xchain-thornode'
import { Address } from '@xchainjs/xchain-util'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { SaversWithdraw } from '../types'

export type ThornodeConfig = {
  apiRetries: number
  thornodeBaseUrls: string[]
}

const defaultThornodeConfig: Record<Network, ThornodeConfig> = {
  mainnet: {
    apiRetries: 3,
    thornodeBaseUrls: [`https://thornode.ninerealms.com`],
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
  private mimirApi: MimirApi[]
  private tradeUnitApi: TradeUnitApi[]
  private tradeUnitsApi: TradeUnitsApi[]
  private tradeAccountApi: TradeAccountApi[]
  private tradeAccountsApi: TradeAccountsApi[]
  private thornamesApi: ThornamesApi[]
  private runePoolApi: RUNEPoolApi[]

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
    this.mimirApi = this.config.thornodeBaseUrls.map((url) => new MimirApi(new Configuration({ basePath: url })))
    this.thornamesApi = this.config.thornodeBaseUrls.map(
      (url) => new ThornamesApi(new Configuration({ basePath: url })),
    )
    this.tradeUnitApi = this.config.thornodeBaseUrls.map(
      (url) => new TradeUnitApi(new Configuration({ basePath: url })),
    )
    this.tradeUnitsApi = this.config.thornodeBaseUrls.map(
      (url) => new TradeUnitsApi(new Configuration({ basePath: url })),
    )
    this.tradeAccountApi = this.config.thornodeBaseUrls.map(
      (url) => new TradeAccountApi(new Configuration({ basePath: url })),
    )
    this.tradeAccountsApi = this.config.thornodeBaseUrls.map(
      (url) => new TradeAccountsApi(new Configuration({ basePath: url })),
    )
    this.runePoolApi = this.config.thornodeBaseUrls.map((url) => new RUNEPoolApi(new Configuration({ basePath: url })))
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
        throw new Error(`THORNode not responding`)
      }
    }
    throw Error(`THORNode not responding`)
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
   * @param txHash - transaction hash
   * @returns - transaction object
   */
  async getTxDetail(txHash: string): Promise<TxDetailsResponse> {
    for (const api of this.transactionsApi) {
      try {
        const txResponse = await api.txSigners(txHash)
        return txResponse.data
      } catch (e) {
        throw new Error(`THORNode not responding`)
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
   * @returns - thorchain pools
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
    throw new Error(`THORNode not responding`)
  }

  /**
   *
   * @returns  Thorchain constants
   */
  async getTcConstants(): Promise<Record<string, string>> {
    for (const api of this.networkApi) {
      try {
        const constants = await api.constants()
        if (constants.data.int_64_values) {
          return constants.data.int_64_values
        }
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
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
  async getLiquidityProvider(
    asset: string,
    address: string,
    height?: number,
  ): Promise<LiquidityProviderSummary | undefined> {
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
  async getSavers(asset: string, height?: number): Promise<SaversResponse> {
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
  async getSaver(asset: string, address: string, height?: number): Promise<Saver> {
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
  async getSaversWithdrawQuote(withdrawParams: SaversWithdraw): Promise<QuoteSaverWithdrawResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = await api.quotesaverwithdraw(
          withdrawParams.height,
          `${withdrawParams.asset.chain}.${withdrawParams.asset.symbol}`,
          withdrawParams.address,
          withdrawParams.withdrawBps,
        )
        return resp.data
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
    destinationAddress?: string,
    streamingInterval?: number,
    streamingQuantity?: number,
    toleranceBps?: number,
    affiliateBps?: number,
    affiliate?: string,
    height?: number,
    refundAddress?: string,
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
            refundAddress,
            streamingInterval,
            streamingQuantity,
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
    throw new Error(`THORNode not responding`)
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
  async getLoanQuoteOpen(
    asset: string,
    amount: number,
    targetAsset: string,
    destination: string,
    minOut?: string,
    affiliateBps?: number,
    affiliate?: string,
    height?: number,
  ): Promise<QuoteLoanOpenResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = (
          await api.quoteloanopen(height, asset, amount, targetAsset, destination, minOut, affiliateBps, affiliate)
        ).data
        return resp
      } catch (e) {
        //console.log(e)
      }
    }
    throw new Error(`THORNode is not responding`)
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
  async getLoanQuoteClose(
    asset: string,
    amount: number,
    loanAsset: string,
    loanOwner: string,
    minOut?: string,
    height?: number,
  ): Promise<QuoteLoanCloseResponse> {
    for (const api of this.quoteApi) {
      try {
        const resp = (await api.quoteloanclose(height, asset, amount, loanAsset, loanOwner, minOut)).data
        return resp
      } catch (e) {
        // console.log(e)
      }
    }
    throw new Error(`THORNode is not responding`)
  }

  async getThornameDetails(thorname: string, height?: number): Promise<Thorname> {
    for (const api of this.thornamesApi) {
      try {
        const resp = (await api.thorname(thorname, height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding`)
  }

  /*
   * Returns the total units and depth of a trade asset
   * @param {string} asset Trade asset
   * @param {number} height Optional - Block height
   * @returns Returns the total units and depth of a trade asset
   */
  public async getTradeAssetUnits(asset: string, height?: number): Promise<TradeUnitResponse> {
    for (const api of this.tradeUnitApi) {
      try {
        const resp = (await api.tradeUnit(asset, height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get asset trade units`)
  }

  /**
   * Returns the total units and depth for each trade asset
   * @param {number} height Block height
   * @returns Returns the total units and depth for each trade asset
   */
  public async getTradeAssetsUnits(height?: number): Promise<TradeUnitsResponse> {
    for (const api of this.tradeUnitsApi) {
      try {
        const resp = (await api.tradeUnits(height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get trade units`)
  }

  /**
   * Returns the units and depth of a trade account address
   * @param {Address} address Thorchain address
   * @param {number} height Optional - Block height
   * @returns Returns the units and depth of a trade account
   */
  public async getTradeAssetAccount(address: Address, height?: number): Promise<TradeAccountsResponse> {
    for (const api of this.tradeAccountApi) {
      try {
        const resp = (await api.tradeAccount(address, height)).data
        return resp as unknown as TradeAccountsResponse
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get trade asset account`)
  }

  /**
   * Returns all trade accounts for an asset
   * @param {Address} address Thorchain address
   * @param {number} height Optional - Block height
   * @returns Returns all trade accounts for an asset
   */
  public async getTradeAssetAccounts(asset: string, height?: number): Promise<TradeAccountsResponse> {
    for (const api of this.tradeAccountsApi) {
      try {
        const resp = (await api.tradeAccounts(asset, height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get trade asset accounts`)
  }

  /**
   * Get rune pool information
   * @param {number} height block height
   * @returns {RUNEPoolResponse} the pool information for the RUNE pool.
   */
  async getRunePool(height?: number): Promise<RUNEPoolResponse> {
    for (const api of this.runePoolApi) {
      try {
        const resp = (await api.runePool(height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get Rune pool`)
  }

  /**
   * Get Rune pool provider information
   * @param {string} address of which return the info
   * @param {number} height block height
   * @returns {RUNEProvider} the RUNE Provider information for an address.
   */
  async getRunePoolProvider(address: string, height?: number): Promise<RUNEProvider> {
    for (const api of this.runePoolApi) {
      try {
        const resp = (await api.runeProvider(address, height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get Rune pool provider info`)
  }

  /**
   * Get all Rune pool providers information
   * @param {number} height block height
   * @returns {RUNEProvidersResponse} all Rune Providers.
   */
  async getRunePoolProviders(height?: number): Promise<RUNEProvidersResponse> {
    for (const api of this.runePoolApi) {
      try {
        const resp = (await api.runeProviders(height)).data
        return resp
      } catch (e) {}
    }
    throw new Error(`THORNode is not responding. Can not get all Rune providers info`)
  }
}
