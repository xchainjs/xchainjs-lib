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

export type ThornodeConfig = {
  apiRetries: number
  thornodeBaseUrls: string[]
}

const defaultThornodeConfig: Record<Network, ThornodeConfig> = {
  mainnet: {
    apiRetries: 3,
    thornodeBaseUrls: [`https://gateway.liquify.com/chain/thorchain_api`],
  },
  stagenet: {
    apiRetries: 3,
    thornodeBaseUrls: [],
  },
  testnet: {
    apiRetries: 3,
    thornodeBaseUrls: ['deprecated'],
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

  async getscheduledQueue(): Promise<TxOutItem[]> {
    for (const api of this.queueApi) {
      try {
        const queueScheduled = await api.queueScheduled()
        return queueScheduled.data
      } catch (_e) {
        // try the next THORNode
      }
    }
    throw Error(`THORNode not responding`)
  }
  async getQueue(): Promise<QueueResponse> {
    for (const api of this.queueApi) {
      try {
        const queue = await api.queue()
        return queue.data
      } catch (_e) {
        // try the next THORNode
      }
    }
    throw Error(`THORNode not responding`)
  }
  async getMimir(): Promise<MimirResponse> {
    for (const api of this.mimirApi) {
      try {
        const queue = await api.mimir()
        return queue.data
      } catch (_e) {
        // try the next THORNode
      }
    }
    throw Error(`THORNode not responding`)
  }
  async getTxData(txHash: string): Promise<TxResponse> {
    for (const api of this.transactionsApi) {
      try {
        const txResponse = await api.tx(txHash)
        return txResponse.data
      } catch (_e) {
        // A failed node is not "tx not found". Try the next URL.
      }
    }
    throw new Error(`THORNode not responding`)
  }
  async getTxDetail(txHash: string): Promise<TxDetailsResponse> {
    for (const api of this.transactionsApi) {
      try {
        const txResponse = await api.txSigners(txHash)
        return txResponse.data
      } catch (_e) {
        // try the next THORNode
      }
    }
    throw new Error(`THORNode not responding`)
  }
  async getLastBlock(height?: number): Promise<LastBlock[]> {
    for (const api of this.networkApi) {
      try {
        const lastBlock = await api.lastblock(height)
        return lastBlock.data
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
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
  async getPool(asset: string): Promise<Pool> {
    for (const api of this.poolsApi) {
      try {
        const pools = await api.pool(asset)
        return pools.data
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  async getTcConstants(): Promise<Record<string, string>> {
    for (const api of this.networkApi) {
      try {
        const constants = await api.constants()
        if (constants.data.int_64_values) {
          return constants.data.int_64_values
        }
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  async getNetworkValues(): Promise<Record<string, number>> {
    const [mimirDetails, constantDetails] = await Promise.all([this.getMimir(), this.getTcConstants()])
    const retVal: Record<string, number> = {}

    for (const [key, value] of Object.entries(constantDetails)) {
      retVal[key.toUpperCase()] = parseInt(value)
    }
    // // mimir will overwrite any dupe constants
    for (const [key, value] of Object.entries(mimirDetails)) {
      retVal[key] = parseInt(value)
    }
    return retVal
  }
  async getLiquidityProvider(
    asset: string,
    address: string,
    height?: number,
  ): Promise<LiquidityProviderSummary | undefined> {
    for (const api of this.liquidityProvidersApi) {
      try {
        const lps = (await api.liquidityProviders(asset, height)).data
        return lps.find((lp) => lp.asset_address === address || lp.rune_address === address)
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
  async getInboundAddresses(): Promise<InboundAddress[]> {
    for (const api of this.networkApi) {
      try {
        const resp = (await api.inboundAddresses()).data
        return resp
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
  async getSavers(asset: string, height?: number): Promise<SaversResponse> {
    for (const api of this.saversApi) {
      try {
        const resp = (await api.savers(asset, height)).data
        return resp
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }
  async getSaver(asset: string, address: string, height?: number): Promise<Saver> {
    for (const api of this.saversApi) {
      try {
        const resp = (await api.saver(asset, address, height)).data
        return resp
      } catch (_e) {
        //console.error(_e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  async getSwapQuote(
    fromAsset: string,
    toAsset: string,
    amount: number,
    destinationAddress?: string,
    streamingInterval?: number,
    streamingQuantity?: number,
    toleranceBps?: number,
    liquidityToleranceBps?: number,
    // `string` is accepted to carry the slash-delimited per-affiliate form (e.g. "10/20/30")
    // used when multiple affiliates are passed. Single-affiliate callers pass a number as before.
    affiliateBps?: number | string,
    affiliate?: string,
    height?: number,
    refundAddress?: string,
  ): Promise<QuoteSwapResponse> {
    // BPS without an affiliate name is rejected: "bad affiliate params".
    // A name with 0 bps is kept so the affiliate can still be tracked.
    const affiliateName = affiliate?.trim() ?? ''
    const quoteAffiliate = affiliateName.length > 0 ? affiliateName : undefined
    const quoteAffiliateBps = quoteAffiliate !== undefined ? affiliateBps : undefined

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
            liquidityToleranceBps,
            // Generated client types this as `number`; axios serializes either number or string
            // identically into the query string, so the runtime accepts both.
            quoteAffiliateBps as number | undefined,
            quoteAffiliate,
          )
        ).data
        return resp
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  async getThornameDetails(thorname: string, height?: number): Promise<Thorname> {
    for (const api of this.thornamesApi) {
      try {
        const resp = (await api.thorname(thorname, height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding`)
  }

  public async getTradeAssetUnits(asset: string, height?: number): Promise<TradeUnitResponse> {
    for (const api of this.tradeUnitApi) {
      try {
        const resp = (await api.tradeUnit(asset, height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get asset trade units`)
  }

  public async getTradeAssetsUnits(height?: number): Promise<TradeUnitsResponse> {
    for (const api of this.tradeUnitsApi) {
      try {
        const resp = (await api.tradeUnits(height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get trade units`)
  }

  public async getTradeAssetAccount(address: Address, height?: number): Promise<TradeAccountsResponse> {
    for (const api of this.tradeAccountApi) {
      try {
        const resp = (await api.tradeAccount(address, height)).data
        return resp as unknown as TradeAccountsResponse
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get trade asset account`)
  }

  public async getTradeAssetAccounts(asset: string, height?: number): Promise<TradeAccountsResponse> {
    for (const api of this.tradeAccountsApi) {
      try {
        const resp = (await api.tradeAccounts(asset, height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get trade asset accounts`)
  }

  async getRunePool(height?: number): Promise<RUNEPoolResponse> {
    for (const api of this.runePoolApi) {
      try {
        const resp = (await api.runePool(height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get Rune pool`)
  }

  async getRunePoolProvider(address: string, height?: number): Promise<RUNEProvider> {
    for (const api of this.runePoolApi) {
      try {
        const resp = (await api.runeProvider(address, height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get Rune pool provider info`)
  }

  async getRunePoolProviders(height?: number): Promise<RUNEProvidersResponse> {
    for (const api of this.runePoolApi) {
      try {
        const resp = (await api.runeProviders(height)).data
        return resp
      } catch (_e) {}
    }
    throw new Error(`THORNode is not responding. Can not get all Rune providers info`)
  }
}
