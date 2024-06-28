import {
  BaseXChainClient,
  ExplorerProviders,
  FeeEstimateOptions,
  FeeRate,
  FeeRates,
  FeeType,
  Fees,
  FeesWithRates,
  Protocol,
  TxHash,
  TxHistoryParams,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, Asset, Chain, baseAmount } from '@xchainjs/xchain-util'
import { UtxoOnlineDataProviders } from '@xchainjs/xchain-utxo-providers'

import { Balance, Tx, TxParams, TxsPage, UTXO, UtxoClientParams } from './types'
/**
 * Abstract base class for creating blockchain clients in the UTXO model.
 */
export abstract class Client extends BaseXChainClient {
  protected explorerProviders: ExplorerProviders
  protected dataProviders: UtxoOnlineDataProviders[]

  /**
   * Constructor for creating a UTXO client instance.
   *
   * @param {Chain} chain The blockchain chain type.
   * @param {UtxoClientParams} params The parameters required for client initialization.
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
   * Get the explorer URL based on the network.
   *
   * @returns {string} The explorer URL.
   */
  getExplorerUrl(): string {
    return this.explorerProviders[this.network].getExplorerUrl()
  }

  /**
   * Get the explorer URL for a given address based on the network.
   *
   * @param {string} address The address to query.
   * @returns {string} The explorer URL for the address.
   */
  getExplorerAddressUrl(address: string): string {
    return this.explorerProviders[this.network].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer URL for a given transaction ID based on the network.
   *
   * @param {string} txID The transaction ID.
   * @returns {string} The explorer URL for the transaction.
   */
  getExplorerTxUrl(txID: string): string {
    return this.explorerProviders[this.network].getExplorerTxUrl(txID)
  }

  /**
   * Get the transaction history of a given address with pagination options.
   *
   * @param {TxHistoryParams} params The options to get transaction history.
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    // Filter the parameters for transaction history
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
   * Get the transaction details of a given transaction ID.
   *
   * @param {string} txId The transaction ID.
   * @returns {Tx} The transaction details.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    return await this.roundRobinGetTransactionData(txId)
  }

  /**
   * Gets balance of a given address.
   *
   * @param {Address} address The address to get balances from
   * @param {undefined} Needed for legacy only to be in common with `XChainClient` interface - will be removed by a next version
   * @param {confirmedOnly} Flag to get balances of confirmed txs only
   *
   * @returns {Balance[]} BTC balances
   */
  // TODO (@xchain-team|@veado) Change params to be an object to be extendable more easily
  // see changes for `xchain-bitcoin` https://github.com/xchainjs/xchainjs-lib/pull/490
  async getBalance(address: Address, _assets?: Asset[] /* not used */, confirmedOnly?: boolean): Promise<Balance[]> {
    // The actual logic for getting balances
    confirmedOnly
    return await this.roundRobinGetBalance(address)
  }
  /**
   * Scan UTXOs for a given address.
   *
   * @param {string} address The address to scan.
   * @param {boolean} confirmedOnly Flag to scan only confirmed UTXOs.
   * @returns {UTXO[]} The UTXOs found.
   */
  protected async scanUTXOs(
    address: string,
    confirmedOnly = true, // default: scan only confirmed UTXOs
  ): Promise<UTXO[]> {
    return this.roundRobinGetUnspentTxs(address, confirmedOnly)
  }
  /**
   * Get estimated fees with fee rates.
   *
   * @param {FeeEstimateOptions} options Options for fee estimation.
   * @returns {Promise<FeesWithRates>} Estimated fees along with fee rates.
   */
  async getFeesWithRates(options?: FeeEstimateOptions): Promise<FeesWithRates> {
    // Scan UTXOs if sender address is provided
    const utxos = options?.sender ? await this.scanUTXOs(options.sender, false) : []
    // Compile memo if memo is provided
    const compiledMemo = options?.memo ? this.compileMemo(options.memo) : null
    // Get fee rates
    const rates = await this.getFeeRates()

    return {
      fees: {
        average: baseAmount(this.getFeeFromUtxos(utxos, rates.average, compiledMemo)),
        fast: baseAmount(this.getFeeFromUtxos(utxos, rates.fast, compiledMemo)),
        fastest: baseAmount(this.getFeeFromUtxos(utxos, rates.fastest, compiledMemo)),
        type: FeeType.PerByte,
      },
      rates,
    }
  }
  /**
   * Get estimated fees.
   *
   * @param {FeeEstimateOptions} options Options for fee estimation.
   * @returns {Promise<Fees>} Estimated fees.
   */
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
  /**
   * Broadcast a transaction.
   *
   * @param {string} txHex The transaction hex string.
   * @returns {Promise<TxHash>} The transaction hash.
   */
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await this.roundRobinBroadcastTx(txHex)
  }
  /**
   * Round-robin method to get balance from data providers.
   * Throws error if no provider can get balance.
   *
   * @param {Address} address The address to get balance for.
   * @returns {Promise<Balance[]>} The balances.
   * @throws Error If no provider is able to get balance.
   */

  protected async roundRobinGetBalance(address: Address) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getBalance(address)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to get balance')
  }
  /**
   * Round-robin method to get unspent transactions from data providers.
   * Throws error if no provider can get unspent transactions.
   *
   * @param {Address} address The address to get unspent transactions for.
   * @param {boolean} confirmed Flag to indicate whether to get confirmed transactions only.
   * @returns {Promise<UTXO[]>} The unspent transactions.
   * @throws Error If no provider is able to get unspent transactions.
   */
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
  /**
   * Round-robin method to get transaction data from data providers.
   * Throws error if no provider can get transaction data.
   *
   * @param {string} txid The transaction ID to get data for.
   * @returns {Promise<Tx>} The transaction data.
   * @throws Error If no provider is able to get transaction data.
   */
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
  /**
   * Round-robin method to get transactions from data providers.
   * Throws error if no provider can get transactions.
   *
   * @param {TxHistoryParams} params The parameters for fetching transactions.
   * @returns {Promise<TxsPage>} The transaction history.
   * @throws Error If no provider is able to get transactions.
   */
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
  /**
   * Broadcasts a transaction hex using a round-robin approach across multiple data providers.
   * @param {string} txHex The transaction hex to broadcast.
   * @returns {Promise<TxHash>} The hash of the broadcasted transaction.
   * @throws {Error} Throws an error if no provider is able to broadcast the transaction.
   */
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
  /**
   * Abstract method to compile a memo.
   * @param {string} memo The memo string to compile.
   * @returns {Buffer} The compiled memo.
   */
  protected abstract compileMemo(memo: string): Buffer
  /**
   * Abstract method to calculate the fee from a list of UTXOs.
   * @param {UTXO[]} inputs The list of UTXOs.
   * @param {FeeRate} feeRate The fee rate.
   * @param {Buffer | null} data Optional data buffer.
   * @returns {number} The calculated fee.
   */
  protected abstract getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null): number
  /**
   * Retrieves fee rates using a round-robin approach across multiple data providers.
   * @returns {Promise<FeeRates>} The fee rates (average, fast, fastest) in `Satoshis/byte`.
   * @throws {Error} Throws an error if no provider is able to retrieve fee rates.
   */
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
  public abstract transfer(params: TxParams & { feeRate?: number }): Promise<string>
}
