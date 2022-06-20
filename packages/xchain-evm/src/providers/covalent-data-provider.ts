import {
  Address,
  Balance,
  FeeOption,
  FeeType,
  Fees,
  Tx,
  TxHistoryParams,
  TxType,
  TxsPage,
} from '@xchainjs/xchain-client'
import { Asset, AssetAVAX, Chain, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

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

export class CovalentProvider implements OnlineDataProvider {
  private baseUrl = 'https://api.covalenthq.com'
  private apiKey: string
  private chainId: number
  private chain: Chain

  constructor(apiKey: string, chain: Chain, chainId: number) {
    this.apiKey = apiKey
    this.chain = chain
    this.chainId = chainId
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
      console.log(JSON.stringify(balance, null, 2))
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
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    params
    return {
      total: 0,
      txs: [],
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
