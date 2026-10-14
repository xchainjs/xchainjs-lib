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
export abstract class Client extends BaseXChainClient {
  protected explorerProviders: ExplorerProviders
  protected dataProviders: UtxoOnlineDataProviders[]

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

  getExplorerUrl(): string {
    return this.explorerProviders[this.network].getExplorerUrl()
  }

  getExplorerAddressUrl(address: string): string {
    return this.explorerProviders[this.network].getExplorerAddressUrl(address)
  }

  getExplorerTxUrl(txID: string): string {
    return this.explorerProviders[this.network].getExplorerTxUrl(txID)
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const filteredParams: TxHistoryParams = {
      address: params?.address || (await this.getAddressAsync()),
      offset: params?.offset,
      limit: params?.limit,
      startTime: params?.startTime,
      asset: params?.asset,
    }

    return await this.roundRobinGetTransactions(filteredParams)
  }

  async getTransactionData(txId: string): Promise<Tx> {
    return await this.roundRobinGetTransactionData(txId)
  }

  // `_assets` is unused; kept so this matches `XChainClient` until that param is removed.
  // TODO (@xchain-team|@veado) Change params to be an object to be extendable more easily
  // see changes for `xchain-bitcoin` https://github.com/xchainjs/xchainjs-lib/pull/490
  async getBalance(address: Address, _assets?: Asset[] /* not used */, _confirmedOnly?: boolean): Promise<Balance[]> {
    // TODO: Use confirmedOnly parameter to filter balances
    void _confirmedOnly
    return await this.roundRobinGetBalance(address)
  }
  protected async scanUTXOs(address: string, confirmedOnly = true): Promise<UTXO[]> {
    return this.roundRobinGetUnspentTxs(address, confirmedOnly)
  }

  /** Public wrapper around scanUTXOs so callers can do coin control. */
  async getUTXOs(address: string, confirmedOnly = true): Promise<UTXO[]> {
    return this.scanUTXOs(address, confirmedOnly)
  }
  async getFeesWithRates(options?: FeeEstimateOptions): Promise<FeesWithRates> {
    const utxos = options?.sender ? await this.scanUTXOs(options.sender, false) : []
    const compiledMemo = options?.memo ? this.compileMemo(options.memo) : null
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
  async getFees(options?: FeeEstimateOptions): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(options)
    return fees
  }

  /** Satoshis/byte. With no protocol, rates come from the chain data providers. */
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
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await this.roundRobinBroadcastTx(txHex)
  }
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
  /** `targetValue` is satoshis, `feeRate` is sat/byte. `extraOutputs` defaults to recipient + change. */
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

  /** Chain clients can override this to add chain-specific checks. */
  protected validateTransactionInputs(
    params: TxParams & {
      sender: Address
      feeRate: FeeRate
    },
  ): void {
    UtxoTransactionValidator.validateTransferParams(params, this.feeBounds)

    if (!this.validateAddress(params.recipient)) {
      throw UtxoError.invalidAddress(params.recipient, this.network)
    }
    if (params.sender && !this.validateAddress(params.sender)) {
      throw UtxoError.invalidAddress(params.sender, this.network)
    }
  }

  /**
   * Sweep spends every UTXO. That is simpler and more correct than binary search over selections.
   */
  protected calculateMaxSendableAmount(
    utxos: UTXO[],
    feeRate: number,
    hasMemo: boolean,
    preferences?: UtxoSelectionPreferences,
  ): { amount: number; fee: number; inputs: UTXO[] } {
    const inputUtxos = preferences?.avoidDust
      ? utxos.filter((utxo) => utxo.value >= UtxoSelector.DUST_THRESHOLD)
      : utxos

    if (inputUtxos.length === 0) {
      throw UtxoError.insufficientBalance('max', '0', this.chain)
    }

    const totalValue = inputUtxos.reduce((sum, utxo) => sum + utxo.value, 0)

    // Recipient plus optional memo. No change output.
    const outputCount = hasMemo ? 2 : 1

    const fee = UtxoSelector.calculateFee(inputUtxos.length, outputCount, feeRate)

    const maxAmount = totalValue - fee

    if (maxAmount <= 0) {
      throw UtxoError.insufficientBalance('max', totalValue.toString(), this.chain)
    }

    if (maxAmount < UtxoSelector.DUST_THRESHOLD) {
      throw UtxoError.invalidAmount(maxAmount, `below dust threshold of ${UtxoSelector.DUST_THRESHOLD} satoshis`)
    }

    return {
      amount: maxAmount,
      fee,
      inputs: inputUtxos,
    }
  }

  protected async getValidatedUtxos(sender: Address, confirmedOnly: boolean): Promise<UTXO[]> {
    const utxos = await this.scanUTXOs(sender, confirmedOnly)

    if (utxos.length === 0) {
      throw UtxoError.insufficientBalance('any', '0', this.chain)
    }

    UtxoTransactionValidator.validateUtxoSet(utxos)

    return utxos
  }

  /** Override `buildTxPsbt` for chain-specific PSBT construction. */
  async prepareTxEnhanced({
    sender,
    memo,
    amount,
    recipient,
    spendPendingUTXO = true,
    feeRate,
    utxoSelectionPreferences,
    selectedUtxos,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    spendPendingUTXO?: boolean
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
  }): Promise<PreparedTx> {
    try {
      this.validateTransactionInputs({
        amount,
        recipient,
        memo,
        sender,
        feeRate,
      })

      // Coin control uses the provided UTXOs; otherwise they are fetched
      let utxos: UTXO[]
      if (selectedUtxos && selectedUtxos.length > 0) {
        UtxoTransactionValidator.validateUtxoSet(selectedUtxos)
        utxos = selectedUtxos
      } else {
        const confirmedOnly = !spendPendingUTXO
        utxos = await this.getValidatedUtxos(sender, confirmedOnly)
      }

      const compiledMemo = memo ? this.compileMemo(memo) : null
      const targetValue = amount.amount().toNumber()
      // Recipient + change + optional memo
      const extraOutputs = 2 + (compiledMemo ? 1 : 0)

      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        extraOutputs,
        utxoSelectionPreferences,
      )

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

  async prepareMaxTx({
    sender,
    recipient,
    memo,
    feeRate,
    spendPendingUTXO = true,
    utxoSelectionPreferences,
    selectedUtxos,
  }: {
    sender: Address
    recipient: Address
    memo?: string
    feeRate: FeeRate
    spendPendingUTXO?: boolean
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
  }): Promise<PreparedTx & { maxAmount: number; fee: number }> {
    try {
      if (!recipient?.trim()) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(recipient)) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(sender)) {
        throw UtxoError.invalidAddress(sender, this.network)
      }

      if (typeof feeRate !== 'number' || !isFinite(feeRate) || feeRate <= 0) {
        throw UtxoError.invalidFeeRate(feeRate, 'Fee rate must be a positive finite number')
      }
      const validatedFeeRate = Math.ceil(feeRate)

      // Coin control uses the provided UTXOs; otherwise they are fetched
      let utxos: UTXO[]
      if (selectedUtxos && selectedUtxos.length > 0) {
        UtxoTransactionValidator.validateUtxoSet(selectedUtxos)
        utxos = selectedUtxos
      } else {
        const confirmedOnly = !spendPendingUTXO
        utxos = await this.getValidatedUtxos(sender, confirmedOnly)
      }

      const maxCalc = this.calculateMaxSendableAmount(utxos, validatedFeeRate, !!memo, utxoSelectionPreferences)

      const compiledMemo = memo ? this.compileMemo(memo) : null

      // Max send has no change output
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

  abstract validateAddress(address: string): boolean

  protected abstract compileMemo(memo: string): Buffer

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

  public abstract transfer(params: TxParams & { feeRate?: number }): Promise<string>
}
