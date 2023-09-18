import {
  Balance,
  FeeOption,
  FeeType,
  Fees,
  OnlineDataProvider,
  Tx,
  TxFrom,
  TxHistoryParams,
  TxTo,
  TxType,
  TxsPage,
} from '@xchainjs/xchain-client'
import { Address, Asset, Chain, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  GetBalanceResponse,
  GetTransactionResponse,
  GetTransactionsItem,
  GetTransactionsResponse,
  getTxsParams,
} from './types'

const AVAXChain: Chain = 'AVAX'
const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false }

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

    let finalBalances = balances

    if (assets) {
      finalBalances = balances.filter((balance) => {
        return assets.some((asset) => asset.symbol === balance.asset.symbol)
      })
    }

    return finalBalances
  }

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
  private buildNonNativeTx(item: GetTransactionsItem): Tx | null {
    const transferEvent = item.log_events.find((i) => i.decoded?.name.toLowerCase() === 'transfer')

    if (!transferEvent || !transferEvent.decoded || !transferEvent.decoded.params) {
      return null
    }

    const from: TxFrom[] = [
      {
        from: transferEvent.decoded.params[0].value,
        amount: baseAmount(transferEvent.decoded.params[2].value, transferEvent.sender_contract_decimals),
      },
    ]

    const to: TxTo[] = [
      {
        to: transferEvent.decoded.params[1].value,
        amount: baseAmount(transferEvent.decoded.params[2].value, transferEvent.sender_contract_decimals),
      },
    ]

    const symbol = `${transferEvent.sender_contract_ticker_symbol}-${transferEvent.sender_address}`

    return {
      asset: {
        chain: this.chain,
        symbol,
        ticker: transferEvent.sender_contract_ticker_symbol as string,
        synth: false,
      },
      from,
      to,
      date: new Date(item.block_signed_at),
      type: TxType.Transfer,
      hash: item.tx_hash,
    }
  }
  private async getTxsPage(params: getTxsParams): Promise<Tx[]> {
    const txs: Tx[] = []
    const response = (
      await axios.get<GetTransactionsResponse>(
        `${this.baseUrl}/v1/${this.chainId}/address/${params.address}/transactions_v2/?key=${this.apiKey}`,
      )
    ).data

    for (const item of response.data.items) {
      if (!item.log_events || item.log_events.length === 0) {
        //native tx
        txs.push(this.buildNativeTx(item))
      } else {
        const tx = this.buildNonNativeTx(item)
        if (tx) {
          txs.push(tx)
        }
      }
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
        //non native txs
        const tx = this.buildNonNativeTx(item)
        if (!tx) {
          throw new Error('Non transfer transaction')
        }
        return tx
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
