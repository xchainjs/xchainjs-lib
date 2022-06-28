import {
  Address,
  Balance,
  FeeOption,
  FeeType,
  Fees,
  Tx,
  TxFrom,
  TxHistoryParams,
  TxTo,
  TxType,
  TxsPage,
} from '@xchainjs/xchain-client'
import { Asset, AssetAVAX, Chain, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { GasPrices } from '../types'
import { OnlineDataProvider } from '../types/provider-types'

type GetBalanceResponse = {
  data: {
    items: [
      {
        contract_decimals: number
        contract_name: string
        contract_ticker_symbol: string
        contract_address: string
        // supports_erc: ['erc20']
        // logo_url: 'https://logos.covalenthq.com/tokens/43114/0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7.png'
        // last_transferred_at: '2022-06-14T09:00:38Z'
        // type: 'cryptocurrency'
        balance: string
        // balance_24h: null
        // quote_rate: 1.0006042
        // quote_rate_24h: 0.963379
        // quote: 2.70515808e8
        // quote_24h: null
        // nft_data: null
      },
    ]
  }
}
// asset: Asset;
//     from: TxFrom[];
//     to: TxTo[];
//     date: Date;
//     type: TxType;
//     hash: string;
type LogEventParam = {
  name: string //to or from or value
  type: string //address or contract
  value: string
}

type LogEvent = {
  sender_contract_decimals: number
  sender_contract_ticker_symbol: string | null | undefined
  sender_address: string | null | undefined //ERC-20 contract address
  decoded: DecodedEvent | null | undefined
}
type DecodedEvent = {
  name: string //Transfer or Approval etc
  params: LogEventParam[] | null | undefined
}
type GetTransactionsItem = {
  tx_hash: string
  block_signed_at: string
  from_address: string
  to_address: string
  value: string
  log_events: LogEvent[]
}
type GetTransactionsResponse = {
  data: {
    address: string
    items: GetTransactionsItem[]
    pagination: {
      has_more: boolean
      page_number: number
      page_size: number
      total_count: number | null
    }
  }
}
type getTxsParams = {
  address: Address
  offset: number
  limit: number
  assetAddress: string | undefined
}
export class CovalentProvider implements OnlineDataProvider {
  private baseUrl = 'https://api.covalenthq.com'
  private apiKey: string
  private chainId: number
  private chain: Chain
  private nativeAsset: Asset
  private nativeAssetDecimals: number

  constructor(apiKey: string, chain: Chain, chainId: number, nativeAsset: Asset, nativeAssetDecimals: number) {
    this.apiKey = apiKey
    this.chain = chain
    this.chainId = chainId
    this.nativeAsset = nativeAsset
    this.nativeAssetDecimals = nativeAssetDecimals
    this.nativeAsset
  }
  async estimateGasPrices(): Promise<GasPrices> {
    // TODO get gas prices
    // try {
    //   return await this.estimateGasPricesFromEtherscan()
    // } catch (error) {
    //   return Promise.reject(new Error(`Failed to estimate gas price: ${error}`))
    // }
    throw Error('not implemented')
  }
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const balances: Balance[] = []
    const response = (
      await axios.get<GetBalanceResponse>(
        `${this.baseUrl}/v1/${this.chainId}/address/${address}/balances_v2/?key=${this.apiKey}`,
      )
    ).data
    for (const balance of response.data.items) {
      let symbol: string
      // console.log(JSON.stringify(balance, null, 2))
      if (balance.contract_address === '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        //gas token, no contract associated
        symbol = balance.contract_ticker_symbol
      } else {
        //different token
        symbol = `${balance.contract_ticker_symbol}-${balance.contract_address}`
      }
      balances.push({
        asset: {
          chain: this.chain,
          symbol,
          ticker: balance.contract_ticker_symbol,
          synth: false,
        },
        amount: baseAmount(balance.balance, balance.contract_decimals),
      })
    }
    //TODO filter out assets
    assets

    return balances
  }
  // private isFromTx(decodedEvent: DecodedEvent, myAddress: Address): boolean {
  //   const params = decodedEvent.params
  //   const from = params?.find((item) => item.name === 'from')
  //   return from?.value.toLowerCase() === myAddress.toLowerCase()
  // }
  // private buildFromTx(decodedEvent: DecodedEvent, asset: Asset): TxFrom {
  //   const params = decodedEvent.params || []
  //   const from = params.find((item) => item.name === 'from')
  //   // const to = params.find((item) => item.name === 'to')
  //   const value = params.find((item) => item.name === 'value')
  //   const amount = baseAmount(value?.value, 1)

  //   return {
  //     from: from?.value as Address | '',
  //     amount,
  //     asset,
  //   }
  // }
  // private buildTxFromLogEvent(logEvent: LogEvent, myAddress: Address): Tx | undefined {
  //   if (logEvent.decoded && logEvent.decoded.params !== null) {
  //     if (logEvent.decoded.name.toLowerCase() === 'transfer') {
  //       //transfer
  //       if (this.isFromTx(logEvent.decoded, myAddress)) {
  //         // from.push()
  //       } else {
  //         // to.push()
  //       }
  //     }
  //   }
  //   return undefined
  // }
  // private buildAsset(logEvent: LogEvent): Asset {
  //   const ticker = logEvent.sender_contract_ticker_symbol
  //   // if(){

  //   // }
  //   return {
  //     chain: Chain.Avalanche,
  //     symbol: 'string',
  //     ticker: 'string',
  //     synth: false,
  //   }
  // }
  // private buildTX(decodedEvent: DecodedEvent, myAddress: Address, hash: string, date: Date): Tx {
  //   const from: TxFrom[] = []
  //   const to: TxTo[] = []
  //   if (decodedEvent.params && decodedEvent.params !== null) {
  //     if (decodedEvent.name.toLowerCase() === 'transfer') {
  //       //transfer
  //       if (this.isFromTx(decodedEvent, myAddress)) {
  //         from.push()
  //       } else {
  //         to.push()
  //       }
  //     } else {
  //       //unknown
  //     }
  //     // for (const eventParam of decodedEvent.params) {
  //     //   console.log(`${decodedEvent.name} ${decodedEvent.type} ${decodedEvent.value}`)
  //     // }
  //   }

  //   return {
  //     asset: {
  //       chain: Chain.Avalanche,
  //       symbol: 'string',
  //       ticker: 'string',
  //       synth: false,
  //     },
  //     from,
  //     to,
  //     date,
  //     type: TxType.Transfer,
  //     hash,
  //   }
  // }

  private buildNativeTx(item: GetTransactionsItem, myAddress: Address): Tx {
    let from: TxFrom[]
    let to: TxTo[]
    const amount = baseAmount(item.value, this.nativeAssetDecimals)
    if (myAddress === item.from_address) {
      from = []
      to = [{ to: item.to_address, amount }]
    } else {
      from = [{ from: item.from_address, amount }]
      to = []
    }

    return {
      asset: AssetAVAX,
      from,
      to,
      date: new Date(item.block_signed_at),
      type: TxType.Transfer,
      hash: item.tx_hash,
    }
  }
  private buildNonNativeTx(item: GetTransactionsItem, myAddress: Address): Tx {
    let from: TxFrom[]
    let to: TxTo[]
    const amount = baseAmount(item.value, this.nativeAssetDecimals)
    if (myAddress === item.from_address) {
      from = []
      to = [{ to: item.to_address, amount }]
    } else {
      from = [{ from: item.from_address, amount }]
      to = []
    }

    return {
      asset: AssetAVAX,
      from,
      to,
      date: new Date(item.block_signed_at),
      type: TxType.Transfer,
      hash: item.tx_hash,
    }
  }
  private async getTxsPage(params: getTxsParams): Promise<Tx[]> {
    // curl -X GET https://api.covalenthq.com/v1/:chain_id/address/:address/transactions_v2/?&key=ckey_4e17b519e504427586fc93c5b33
    const txs: Tx[] = []
    const response = (
      await axios.get<GetTransactionsResponse>(
        `${this.baseUrl}/v1/${this.chainId}/address/${params.address}/transactions_v2/?key=${this.apiKey}`,
      )
    ).data
    // console.log(JSON.stringify(response))

    for (const item of response.data.items) {
      if (!item.log_events || item.log_events.length === 0) {
        //native tx
        txs.push(this.buildNativeTx(item, params.address))
      } else {
        //TODO non native txs
      }
      // for (const logEvent of tx.log_events) {
      //   if (logEvent.decoded?.params && logEvent.decoded.params !== null) {
      //     for (const decodedEvent of logEvent.decoded.params) {
      //       console.log(`${decodedEvent.name} ${decodedEvent.type} ${decodedEvent.value}`)
      //     }
      //   }
      // }
    }
    return txs
  }
  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset || 0
    const limit = params?.limit || 10
    const assetAddress = params?.asset
    const address = params.address

    const transactions = await this.getTxsPage({
      address,
      offset,
      limit,
      assetAddress,
    })

    return {
      total: transactions.length,
      txs: transactions.filter((_, index) => index >= offset && index < offset + limit),
    }
  }
  async getTransactionData(txId: string, assetAddress?: Address): Promise<Tx> {
    txId
    assetAddress
    return {
      asset: AssetAVAX,
      from: [],
      to: [],
      date: new Date(),
      type: TxType.Unknown,
      hash: '',
    }
  }
  async getFees(): Promise<Fees> {
    return {
      [FeeOption.Average]: baseAmount(1),
      [FeeOption.Fast]: baseAmount(1),
      [FeeOption.Fastest]: baseAmount(1),
      type: FeeType.PerByte,
    }
  }
}
//
// curl -X GET https://api.covalenthq.com/v1/:chain_id/address/:address/balances_v2/?&key=ckey_4e17b519e504427586fc93c5b33
//  \ -H "Accept: application/json"

// curl 'https://api.covalenthq.com/v1/43114/address/0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8/balances_v2/?&key=ckey_4e17b519e504427586fc93c5b33'
