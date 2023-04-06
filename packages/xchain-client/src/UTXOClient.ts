import { Address, Asset, Chain } from '@xchainjs/xchain-util'

import { BaseXChainClient as Client } from './BaseXChainClient'
import { standardFeeRates } from './feeRates'
import { calcFeesAsync } from './fees'
import { ExplorerProviders, UTXO, UtxoOnlineDataProviders } from './provider-types'
import {
  Balance,
  Fee,
  FeeRate,
  FeeRates,
  Fees,
  FeesWithRates,
  Tx,
  TxHash,
  TxHistoryParams,
  TxsPage,
  XChainClientParams,
} from './types'

export type UtxoClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  dataProviders: UtxoOnlineDataProviders[]
}
export abstract class UTXOClient extends Client {
  protected explorerProviders: ExplorerProviders
  protected dataProviders: UtxoOnlineDataProviders[]

  protected abstract getSuggestedFeeRate(): Promise<FeeRate>
  protected abstract calcFee(feeRate: FeeRate, memo?: string): Promise<Fee>

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {UtxoClientParams} params
   */
  constructor(chain: Chain, params: UtxoClientParams) {
    super(chain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
    })
    this.explorerProviders = params.explorerProviders
    this.dataProviders = params.dataProviders
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    return this.explorerProviders[this.network].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: string): string {
    return this.explorerProviders[this.network].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    return this.explorerProviders[this.network].getExplorerTxUrl(txID)
  }
  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const filteredParams: TxHistoryParams = {
      address: params?.address || this.getAddress(),
      offset: params?.offset,
      limit: params?.limit,
      startTime: params?.startTime,
      asset: params?.asset,
    }

    return await this.roundRobinGetTransactions(filteredParams)
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    return await this.roundRobinGetTransactionData(txId)
  }

  /**
   * Gets BTC balances of a given address.
   *
   * @param {Address} BTC address to get balances from
   * @param {undefined} Needed for legacy only to be in common with `XChainClient` interface - will be removed by a next version
   * @param {confirmedOnly} Flag to get balances of confirmed txs only
   *
   * @returns {Balance[]} BTC balances
   */
  // TODO (@xchain-team|@veado) Change params to be an object to be extendable more easily
  // see changes for `xchain-bitcoin` https://github.com/xchainjs/xchainjs-lib/pull/490
  async getBalance(address: Address, _assets?: Asset[] /* not used */, confirmedOnly?: boolean): Promise<Balance[]> {
    // TODO figure this out ---> !!confirmedOnly)
    confirmedOnly
    return await this.roundRobinGetBalance(address)
  }

  protected async scanUTXOs(
    address: string,
    confirmedOnly = true, // default: scan only confirmed UTXOs
  ): Promise<UTXO[]> {
    return this.roundRobinGetUnspentTxs(address, confirmedOnly)
  }
  async getFeesWithRates(memo?: string): Promise<FeesWithRates> {
    const rates = await this.getFeeRates()
    return {
      fees: await calcFeesAsync(rates, this.calcFee.bind(this), memo),
      rates,
    }
  }

  async getFees(memo?: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  /**
   * @deprecated Use getFees(memo) instead
   */
  async getFeesWithMemo(memo: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  async getFeeRates(): Promise<FeeRates> {
    const feeRate: FeeRate = await (async () => {
      try {
        return await this.getFeeRateFromThorchain()
      } catch (error) {
        console.warn(`Rate lookup via Thorchain failed: ${error}`)
      }
      return await this.getSuggestedFeeRate()
    })()

    return standardFeeRates(feeRate)
  }
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await this.roundRobinBroadcastTx(txHex)
  }

  protected async roundRobinGetBalance(address: Address) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getBalance(address, undefined)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to get balance')
  }
  protected async roundRobinGetUnspentTxs(address: Address, confirmed: boolean) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) {
          return confirmed ? await prov.getConfirmedUnspentTxs(address) : await prov.getUnspentTxs(address)
        }
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to GetUnspentTxs')
  }
  protected async roundRobinGetTransactionData(txid: string) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getTransactionData(txid)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to GetTransactionData')
  }
  protected async roundRobinGetTransactions(params: TxHistoryParams) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getTransactions(params)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to GetTransactions')
  }
  protected async roundRobinBroadcastTx(txHex: string) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.broadcastTx(txHex)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to BroadcastTx')
  }
}
