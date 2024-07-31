import { Provider } from '@ethersproject/abstract-provider'
import { TxHistoryParams } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

import { Tx, TxsPage } from '../../types'
import * as etherscanAPI from '../etherscan/etherscan-api'
import { EtherscanProvider } from '../etherscan/etherscan-data-provider'

export class RoutescanProvider extends EtherscanProvider {
  constructor(
    provider: Provider,
    baseUrl: string,
    chainId: number,
    nativeAsset: Asset,
    nativeAssetDecimals: number,
    isTesnet = false,
  ) {
    super(
      provider,
      `${baseUrl}/v2/network/${isTesnet ? 'testnet' : 'mainnet'}/evm/${chainId}/etherscan`,
      '',
      nativeAsset.chain,
      nativeAsset,
      nativeAssetDecimals,
    )
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset || 0
    const limit = params?.limit || 10

    const maxCount = 10000

    const transactions: Tx[] = []

    if (params.asset) {
      const txs = await etherscanAPI.getTokenTransactionHistory({
        baseUrl: this.baseUrl,
        address: params.address,
        assetAddress: params.asset,
        gasDecimals: this.nativeAssetDecimals,
        page: 1,
        offset: maxCount,
        chain: this.chain,
      })
      transactions.push(...txs)
    } else {
      /**
       * Due to endpoint constrains, a single request can not query more than 100 txs per page, with this approach,
       * etherscan approach can be simulate, but there is no form to get the total number of transactions
       * */
      const maxTxsPerPage = 100
      const startPage =
        Number((offset / maxTxsPerPage).toFixed(0)) !== 0 ? Number((offset / maxTxsPerPage).toFixed(0)) : 1
      const endPage = Number((limit / maxTxsPerPage).toFixed(0)) !== 0 ? Number((limit / maxTxsPerPage).toFixed(0)) : 1

      const getPageTxs = (page: number): Promise<Tx[]> => {
        return etherscanAPI.getGasAssetTransactionHistory({
          baseUrl: this.baseUrl,
          address: params.address,
          gasAsset: this.nativeAsset,
          gasDecimals: this.nativeAssetDecimals,
          page,
          offset: maxTxsPerPage,
        })
      }

      const tasks: Promise<Tx[]>[] = []
      for (let page = startPage; page <= endPage; page++) {
        tasks.push(getPageTxs(page))
      }

      const txsPerPages = await Promise.all(tasks)
      for (const txsPerPage of txsPerPages) transactions.push(...txsPerPage)
    }

    return {
      total: transactions.length,
      txs: transactions.filter((_, index) => index >= offset && index < offset + limit),
    }
  }
}
