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

import { Balance, PreparedTx, Tx, TxParams, TxsPage, UTXO, UtxoClientParams } from './types'
import { UtxoError } from './errors'
import { UtxoTransactionValidator } from './validators'
import { UtxoSelector } from './utxo-selector'
import { UtxoSelectionPreferences, UtxoSelectionResult } from './strategies'
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
      address: params?.address || (await this.getAddressAsync()),
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
  async getBalance(address: Address, _assets?: Asset[] /* not used */, _confirmedOnly?: boolean): Promise<Balance[]> {
    // The actual logic for getting balances
    // TODO: Use confirmedOnly parameter to filter balances
    void _confirmedOnly
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
      } catch {
        console.warn('Can not retrieve fee rates from provider')
      }
    }

    if (!protocol || protocol === Protocol.THORCHAIN) {
      try {
        const feeRate = await this.getFeeRateFromThorchain()
        return standardFeeRates(feeRate)
      } catch {
        console.warn(`Can not retrieve fee rates from Thorchain`)
      }
    }

    if (protocol === Protocol.MAYACHAIN) {
      try {
        const feeRate = await this.getFeeRateFromMayachain()
        return standardFeeRates(feeRate)
      } catch (_error) {
        console.warn(`Can not retrieve fee rates from Mayachain`)
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
  // ==================== Enhanced UTXO Selection Methods ====================

  /**
   * Enhanced UTXO selection using the UtxoSelector with multiple strategies.
   * This method is available to all UTXO chain implementations.
   *
   * @param utxos Available UTXOs to select from
   * @param targetValue Target amount in satoshis
   * @param feeRate Fee rate in satoshis per byte
   * @param extraOutputs Number of extra outputs (default: 2 for recipient + change)
   * @param preferences Selection preferences
   * @returns Selection result with inputs, change, and fee
   */
  protected selectUtxosForTransaction(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number = 2,
    preferences?: UtxoSelectionPreferences,
  ): UtxoSelectionResult {
    const selector = new UtxoSelector()

    const defaultPreferences: UtxoSelectionPreferences = {
      minimizeFee: true,
      minimizeInputs: true,
      avoidDust: true,
      ...preferences,
    }

    try {
      return selector.selectOptimal(utxos, targetValue, feeRate, defaultPreferences, extraOutputs)
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'UTXO selection')
    }
  }

  /**
   * Validate transaction inputs using comprehensive validation.
   * Chain implementations can override to add chain-specific validation.
   *
   * @param params Transaction parameters including sender and feeRate
   */
  protected validateTransactionInputs(
    params: TxParams & {
      sender: Address
      feeRate: FeeRate
    },
  ): void {
    // Use comprehensive validator
    UtxoTransactionValidator.validateTransferParams(params, this.feeBounds)

    // Chain-specific address validation (uses abstract validateAddress)
    if (!this.validateAddress(params.recipient)) {
      throw UtxoError.invalidAddress(params.recipient, this.network)
    }
    if (params.sender && !this.validateAddress(params.sender)) {
      throw UtxoError.invalidAddress(params.sender, this.network)
    }
  }

  /**
   * Calculate maximum sendable amount by using ALL available UTXOs.
   *
   * For a true sweep operation, we use all UTXOs to maximize the sent amount.
   * This is simpler and more correct than binary search with UTXO selection.
   *
   * @param utxos Available UTXOs
   * @param feeRate Fee rate in satoshis per byte
   * @param hasMemo Whether transaction has a memo
   * @param preferences UTXO selection preferences
   * @returns Maximum sendable amount, fee, and selected inputs
   */
  protected calculateMaxSendableAmount(
    utxos: UTXO[],
    feeRate: number,
    hasMemo: boolean,
    preferences?: UtxoSelectionPreferences,
  ): { amount: number; fee: number; inputs: UTXO[] } {
    // For sweep, use ALL UTXOs (optionally filter dust if preference set)
    const inputUtxos = preferences?.avoidDust
      ? utxos.filter((utxo) => utxo.value >= UtxoSelector.DUST_THRESHOLD)
      : utxos

    if (inputUtxos.length === 0) {
      throw UtxoError.insufficientBalance('max', '0', this.chain)
    }

    // Calculate total value of all inputs
    const totalValue = inputUtxos.reduce((sum, utxo) => sum + utxo.value, 0)

    // For max send: 1 output (recipient) + optional memo output, NO change output
    const outputCount = hasMemo ? 2 : 1

    // Calculate fee for using all inputs
    const fee = UtxoSelector.calculateFee(inputUtxos.length, outputCount, feeRate)

    // Maximum sendable is total minus fee
    const maxAmount = totalValue - fee

    if (maxAmount <= 0) {
      throw UtxoError.insufficientBalance('max', totalValue.toString(), this.chain)
    }

    // Verify amount is above dust threshold
    if (maxAmount < UtxoSelector.DUST_THRESHOLD) {
      throw UtxoError.invalidAmount(maxAmount, `below dust threshold of ${UtxoSelector.DUST_THRESHOLD} satoshis`)
    }

    return {
      amount: maxAmount,
      fee,
      inputs: inputUtxos,
    }
  }

  /**
   * Get and validate UTXOs for transaction building.
   *
   * @param sender Sender address
   * @param confirmedOnly Whether to only use confirmed UTXOs
   * @returns Validated UTXO array
   */
  protected async getValidatedUtxos(sender: Address, confirmedOnly: boolean): Promise<UTXO[]> {
    const utxos = await this.scanUTXOs(sender, confirmedOnly)

    if (utxos.length === 0) {
      throw UtxoError.insufficientBalance('any', '0', this.chain)
    }

    // Validate UTXO set integrity
    UtxoTransactionValidator.validateUtxoSet(utxos)

    return utxos
  }

  /**
   * Prepare transaction with enhanced UTXO selection.
   * Chain implementations should override buildTxPsbt to provide chain-specific PSBT construction.
   *
   * @param params Transaction parameters
   * @returns Prepared transaction with UTXO details
   */
  async prepareTxEnhanced({
    sender,
    memo,
    amount,
    recipient,
    spendPendingUTXO = true,
    feeRate,
    utxoSelectionPreferences,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    spendPendingUTXO?: boolean
    utxoSelectionPreferences?: UtxoSelectionPreferences
  }): Promise<PreparedTx> {
    try {
      // Comprehensive input validation
      this.validateTransactionInputs({
        amount,
        recipient,
        memo,
        sender,
        feeRate,
      })

      // Get validated UTXOs
      const confirmedOnly = !spendPendingUTXO
      const utxos = await this.getValidatedUtxos(sender, confirmedOnly)

      const compiledMemo = memo ? this.compileMemo(memo) : null
      const targetValue = amount.amount().toNumber()
      // Output count: recipient + change + optional memo
      const extraOutputs = 2 + (compiledMemo ? 1 : 0)

      // Enhanced UTXO selection
      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        extraOutputs,
        utxoSelectionPreferences,
      )

      // Build PSBT using chain-specific implementation
      const rawUnsignedTx = await this.buildTxPsbt({
        inputs: selectionResult.inputs,
        recipient,
        amount: targetValue,
        changeAmount: selectionResult.changeAmount,
        changeAddress: sender,
        memo: compiledMemo,
      })

      return { rawUnsignedTx, utxos, inputs: selectionResult.inputs }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareTxEnhanced')
    }
  }

  /**
   * Prepare maximum amount transfer (sweep transaction).
   *
   * @param params Send max parameters
   * @returns Prepared transaction with maximum sendable amount
   */
  async prepareMaxTx({
    sender,
    recipient,
    memo,
    feeRate,
    spendPendingUTXO = true,
    utxoSelectionPreferences,
  }: {
    sender: Address
    recipient: Address
    memo?: string
    feeRate: FeeRate
    spendPendingUTXO?: boolean
    utxoSelectionPreferences?: UtxoSelectionPreferences
  }): Promise<PreparedTx & { maxAmount: number; fee: number }> {
    try {
      // Basic validation
      if (!recipient?.trim()) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(recipient)) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(sender)) {
        throw UtxoError.invalidAddress(sender, this.network)
      }

      // Validate fee rate
      if (typeof feeRate !== 'number' || !isFinite(feeRate) || feeRate <= 0) {
        throw UtxoError.invalidFeeRate(feeRate, 'Fee rate must be a positive finite number')
      }
      const validatedFeeRate = Math.ceil(feeRate)

      // Get validated UTXOs
      const confirmedOnly = !spendPendingUTXO
      const utxos = await this.getValidatedUtxos(sender, confirmedOnly)

      // Calculate maximum sendable amount
      const maxCalc = this.calculateMaxSendableAmount(utxos, validatedFeeRate, !!memo, utxoSelectionPreferences)

      const compiledMemo = memo ? this.compileMemo(memo) : null

      // Build PSBT using chain-specific implementation (no change for max send)
      const rawUnsignedTx = await this.buildTxPsbt({
        inputs: maxCalc.inputs,
        recipient,
        amount: maxCalc.amount,
        changeAmount: 0,
        changeAddress: sender,
        memo: compiledMemo,
      })

      return {
        rawUnsignedTx,
        utxos,
        inputs: maxCalc.inputs,
        maxAmount: maxCalc.amount,
        fee: maxCalc.fee,
      }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareMaxTx')
    }
  }

  // ==================== Abstract Methods ====================

  /**
   * Abstract method to validate an address for this chain.
   * @param address The address to validate
   * @returns true if valid, false otherwise
   */
  abstract validateAddress(address: string): boolean

  /**
   * Abstract method to compile a memo.
   * @param memo The memo string to compile.
   * @returns The compiled memo.
   */
  protected abstract compileMemo(memo: string): Buffer

  /**
   * Build a PSBT for this chain.
   * Chain implementations should override this to provide chain-specific PSBT construction.
   * Default implementation throws - override in chain client to enable enhanced methods.
   *
   * @param params PSBT build parameters
   * @returns Base64-encoded PSBT string
   */
  protected buildTxPsbt(_params: {
    inputs: UTXO[]
    recipient: Address
    amount: number
    changeAmount: number
    changeAddress: Address
    memo: Buffer | null
  }): Promise<string> {
    throw new Error(`buildTxPsbt not implemented for ${this.chain}. Override in chain client to use enhanced methods.`)
  }

  /**
   * Abstract method to calculate the fee from a list of UTXOs.
   * @param inputs The list of UTXOs.
   * @param feeRate The fee rate.
   * @param data Optional data buffer.
   * @returns The calculated fee.
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
