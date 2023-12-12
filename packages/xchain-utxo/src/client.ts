import {
  Balance,
  BaseXChainClient,
  ExplorerProviders,
  Fee,
  FeeEstimateOptions,
  FeeRate,
  FeeRates,
  Fees,
  FeesWithRates,
  Protocol,
  Tx,
  TxHash,
  TxHistoryParams,
  TxsPage,
  calcFeesAsync,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, Asset, Chain, baseAmount } from '@xchainjs/xchain-util'
import { UTXO, UtxoOnlineDataProviders } from '@xchainjs/xchain-utxo-providers'

import { UtxoClientParams } from './types'

export abstract class Client extends BaseXChainClient {
  protected explorerProviders: ExplorerProviders
  protected dataProviders: UtxoOnlineDataProviders[]

  /**
   * Constructor
   * Client is initialized with network type
   *
   * @param {Chain} chain Chain to instantiate the client with
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

  protected async calcFee(feeRate: FeeRate, options?: FeeEstimateOptions): Promise<Fee> {
    let utxos: UTXO[] = []
    if (options?.sender) {
      utxos = await this.scanUTXOs(options.sender, false)
    }
    const compiledMemo = options?.memo ? this.compileMemo(options.memo) : null
    const fee = this.getFeeFromUtxos(utxos, feeRate, compiledMemo)
    return baseAmount(fee)
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
      address: params?.address || (await this.getAddress()),
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
   * Gets balance of a given address.
   *
   * @param {Address} address to get balances from
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

  async getFeesWithRates(options?: FeeEstimateOptions): Promise<FeesWithRates> {
    const rates = await this.getFeeRates()
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fees: await calcFeesAsync(rates, this.calcFee.bind(this), options),
      rates,
    }
  }

  async getFees(options?: FeeEstimateOptions): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(options)
    return fees
  }

  /**
   * Get fee rates
   * @param {Protocol} protocol Protocol to interact with. If there's no protocol provided, fee rates are retrieved from chain data providers
   *
   * @returns {FeeRates} The fee rates (average, fast, fastest) in `Satoshis/byte`
   */
  async getFeeRates(protocol?: Protocol): Promise<FeeRates> {
    if (!protocol) {
      try {
        const feeRates = await this.roundRobinGetFeeRates()
        return feeRates
      } catch (error) {
        console.warn('Can not retrieve fee rates from provider')
      }
    }

    if (!protocol || Protocol.THORCHAIN) {
      try {
        const feeRate = await this.getFeeRateFromThorchain()
        return standardFeeRates(feeRate)
      } catch (error) {
        console.warn(`Can not retrieve fee rates from Thorchain`)
      }
    }
    // TODO: Return default value
    throw Error('Can not retrieve fee rates')
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

  protected abstract compileMemo(memo: string): Buffer
  protected abstract getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null): number
  protected async roundRobinGetFeeRates(): Promise<FeeRates> {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getFeeRates()
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to get fee rates')
  }
}
