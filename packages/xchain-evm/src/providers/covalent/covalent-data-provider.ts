import {
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
import { Address, Asset, AssetAVAX, Chain, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { GasPrices } from '../../types'
import { OnlineDataProvider } from '../../types/provider-types'

import {
  GetBalanceResponse,
  GetTransactionResponse,
  GetTransactionsItem,
  GetTransactionsResponse,
  getTxsParams,
} from './types'

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

  private buildNativeTx(item: GetTransactionsItem): Tx {
    const amount = baseAmount(item.value, this.nativeAssetDecimals)

    const from: TxFrom[] = [{ from: item.from_address, amount }]
    const to: TxTo[] = [{ to: item.to_address, amount }]

    return {
      asset: this.nativeAsset,
      from,
      to,
      date: new Date(item.block_signed_at),
      type: TxType.Transfer,
      hash: item.tx_hash,
    }
  }
  private buildNonNativeTx(item: GetTransactionsItem): Tx {
    const amount = baseAmount(item.value, this.nativeAssetDecimals)
    console.log(item.log_events, null, 2)
    const transferEvents = item.log_events.filter((i) => i.decoded?.name.toLowerCase() === 'transfer')
    console.log(transferEvents, null, 2)
    const from: TxFrom[] = [{ from: item.from_address, amount }]
    const to: TxTo[] = [{ to: item.to_address, amount }]

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
        txs.push(this.buildNativeTx(item))
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
  async getTransactionData(txHash: string, assetAddress?: Address): Promise<Tx> {
    assetAddress
    const response = (
      await axios.get<GetTransactionResponse>(
        `${this.baseUrl}/v1/${this.chainId}/transaction_v2/${txHash}/?key=${this.apiKey}`,
      )
    ).data
    for (const item of response.data.items) {
      if (!item.log_events || item.log_events.length === 0) {
        //native tx
        return this.buildNativeTx(item)
      } else {
        //TODO non native txs
        return this.buildNonNativeTx(item)
      }
    }
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
// curl 'https://api.covalenthq.com/v1/43114/transaction_v2/0xd51ce4ff4833a0bd750c9d08d680ab285656fbbc1864ee23845819919a836bd8/?&key=ckey_4e17b519e504427586fc93c5b33'
