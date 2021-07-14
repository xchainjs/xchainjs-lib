/* eslint-disable ordered-imports/ordered-imports */
import { Asset, AssetBTC, AssetLTC, Chain } from '@xchainjs/xchain-util/lib'

import { Balance, Network, Tx, TxHistoryParams, TxsPage } from '../types'

import { SochainAPI } from '../thirdparty-apis/sochain/sochain-api'

import { BaseProvider, CanGetBalance, CanGetTransactionData, CanGetTransactions } from './Provider'

const BTC_DECIMALS = 8
const LTC_DECIMALS = 8

export class SochainProvider extends BaseProvider implements CanGetBalance, CanGetTransactions, CanGetTransactionData {
  private sochainApi: SochainAPI

  constructor(chain: Chain) {
    if (chain !== Chain.Bitcoin && chain !== Chain.Litecoin)
      throw new Error('Sochain provider only supports bitcoin and litecoin')
    super(chain)
    this.sochainApi = new SochainAPI(this.chain)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBalance(network: Network, address: string, assets?: Asset[]): Promise<Balance[]> {
    const decimals = this.chain === Chain.Bitcoin ? BTC_DECIMALS : LTC_DECIMALS
    const asset = this.chain === Chain.Bitcoin ? AssetBTC : AssetLTC
    return [
      {
        asset: asset,
        amount: await this.sochainApi.getBalance(address, network, decimals),
      },
    ]
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTransactions(network: Network, params?: TxHistoryParams): Promise<TxsPage> {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTransactionData(network: Network, txId: string, assetAddress?: string): Promise<Tx> {
    throw new Error('not implemented')
  }
}
