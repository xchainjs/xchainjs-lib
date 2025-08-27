import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import {
  Client as UTXOClient,
  PreparedTx,
  TxParams,
  UTXO,
  UtxoClientParams,
  UtxoError,
  UtxoTransactionValidator,
  UtxoSelector,
  UtxoSelectionPreferences,
  UtxoSelectionResult,
} from '@xchainjs/xchain-utxo'
import * as Bitcoin from 'bitcoinjs-lib'

import accumulative from 'coinselect/accumulative'

import {
  AssetBTC,
  BTCChain,
  BTC_DECIMAL,
  BitgoProviders,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from './const'
import { AddressFormat } from './types'
import * as Utils from './utils'

// Default parameters for the Bitcoin UTXO client
export const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BitgoProviders, BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/0'/0'/0/`, // Not BIP44 compliant but compatible with pre-HD wallets
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
/**
 * Custom Bitcoin client
 */
abstract class Client extends UTXOClient {
  protected addressFormat: AddressFormat
  /**
   * Constructor
   * Initializes the client with network type and other parameters.
   * @param {UtxoClientParams} params
   */
  constructor(
    params: UtxoClientParams & { addressFormat?: AddressFormat } = {
      ...defaultBTCParams,
      addressFormat: AddressFormat.P2WPKH,
    },
  ) {
    super(BTCChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.addressFormat = params.addressFormat || AddressFormat.P2WPKH

    if (this.addressFormat === AddressFormat.P2TR) {
      if (
        !this.rootDerivationPaths?.mainnet.startsWith(`m/86'`) ||
        !this.rootDerivationPaths?.testnet.startsWith(`m/86'`) ||
        !this.rootDerivationPaths?.stagenet.startsWith(`m/86'`)
      ) {
        throw Error(`Unsupported derivation paths for Taproot client. Use 86' paths`)
      }
    }
    Bitcoin.initEccLib(ecc)
  }

  /**
   * Get BTC asset info.
   * @returns {AssetInfo} BTC asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetBTC,
      decimal: BTC_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate the given Bitcoin address.
   * @param {string} address Bitcoin address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Compile memo into a buffer.
   * @param {string} memo Memo to compile.
   * @returns {Buffer} Compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  }

  /**
   * Get transaction fee from UTXOs.
   * @param {UTXO[]} inputs UTXOs to calculate fee from.
   * @param {FeeRate} feeRate Fee rate.
   * @param {Buffer | null} data Compiled memo (Optional).
   * @returns {number} Transaction fee.
   */
  /**
   * Enhanced UTXO selection using the new UtxoSelector with multiple strategies
   */
  private selectUtxosForTransaction(
    utxos: UTXO[],
    targetValue: number,
    feeRate: number,
    extraOutputs: number = 2, // recipient + change by default
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
        throw error // Re-throw typed errors
      }
      throw UtxoError.fromUnknown(error, 'UTXO selection')
    }
  }

  /**
   * Validate transaction inputs using comprehensive validation
   */
  private validateTransactionInputs(
    params: TxParams & {
      sender: Address
      feeRate: FeeRate
    },
  ): void {
    // Use comprehensive validator
    UtxoTransactionValidator.validateTransferParams(params)

    // Bitcoin-specific address validation
    UtxoTransactionValidator.validateAddressFormat(params.recipient, this.network, 'BTC')
    if (params.sender) {
      UtxoTransactionValidator.validateAddressFormat(params.sender, this.network, 'BTC')
    }

    // Fee rate validation with Bitcoin network conditions
    const networkConditions = {
      minFeeRate: 1,
      maxFeeRate: 1000,
      recommendedRange: [5, 100] as [number, number],
    }
    UtxoTransactionValidator.validateFeeRate(params.feeRate, networkConditions)
  }

  /**
   * Calculate maximum sendable amount by trying different amounts until optimal
   */
  private calculateMaxSendableAmount(
    utxos: UTXO[],
    feeRate: number,
    hasMemo: boolean,
    preferences?: UtxoSelectionPreferences,
  ): { amount: number; fee: number; inputs: UTXO[] } {
    const selector = new UtxoSelector()
    const extraOutputs = hasMemo ? 2 : 1 // recipient + optional memo (no change for max send)

    const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0)

    // Binary search for maximum sendable amount
    let low = UtxoSelector.DUST_THRESHOLD
    let high = totalBalance
    let bestResult: UtxoSelectionResult | null = null

    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2)

      try {
        const result = selector.selectOptimal(utxos, mid, feeRate, { ...preferences, minimizeFee: true }, extraOutputs)

        // For max send, we don't want change - the goal is to send everything
        const totalInput = result.inputs.reduce((sum, utxo) => sum + utxo.value, 0)
        const maxSendable = totalInput - result.fee

        if (maxSendable >= mid) {
          bestResult = {
            ...result,
            changeAmount: 0, // No change for max send
          }
          low = mid
        } else {
          high = mid - 1
        }
      } catch {
        high = mid - 1
      }
    }

    if (!bestResult) {
      throw UtxoError.insufficientBalance('max', totalBalance.toString(), 'BTC')
    }

    // Calculate the actual maximum we can send
    const totalInput = bestResult.inputs.reduce((sum, utxo) => sum + utxo.value, 0)
    const maxAmount = totalInput - bestResult.fee

    return {
      amount: maxAmount,
      fee: bestResult.fee,
      inputs: bestResult.inputs,
    }
  }

  /**
   * Get and validate UTXOs for transaction building
   */
  private async getValidatedUtxos(sender: Address, confirmedOnly: boolean): Promise<UTXO[]> {
    const utxos = await this.scanUTXOs(sender, confirmedOnly)

    if (utxos.length === 0) {
      throw UtxoError.insufficientBalance('any', '0', 'BTC')
    }

    // Validate UTXO set integrity
    UtxoTransactionValidator.validateUtxoSet(utxos)

    return utxos
  }

  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    // Calculate input size based on inputs
    const inputSizeBasedOnInputs =
      inputs.length > 0
        ? inputs.reduce((a, x) => a + Utils.inputBytes(x), 0) + inputs.length // +1 byte for each input signature
        : 0
    // Calculate sum
    let sum =
      Utils.TX_EMPTY_SIZE +
      inputSizeBasedOnInputs +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH

    if (data) {
      sum += Utils.TX_OUTPUT_BASE + data.length
    }
    // Calculate fee
    const fee = sum * feeRate
    return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
  }

  /**
   * Enhanced Bitcoin transaction builder with comprehensive validation and optimal UTXO selection
   * @param params Transaction parameters
   * @returns Enhanced transaction build result with PSBT, UTXOs, and inputs
   */
  async buildTxEnhanced({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
    spendPendingUTXO = true,
    utxoSelectionPreferences,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
    spendPendingUTXO?: boolean
    utxoSelectionPreferences?: UtxoSelectionPreferences
  }): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
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
      const extraOutputs = 1 + (compiledMemo ? 1 : 0) // recipient + optional memo (change calculated separately)

      // Enhanced UTXO selection
      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        extraOutputs,
        utxoSelectionPreferences,
      )

      const psbt = new Bitcoin.Psbt({ network: Utils.btcNetwork(this.network) })

      // Add inputs based on selection
      if (this.addressFormat === AddressFormat.P2WPKH) {
        selectionResult.inputs.forEach((utxo: UTXO) =>
          psbt.addInput({
            hash: utxo.hash,
            index: utxo.index,
            witnessUtxo: utxo.witnessUtxo,
          }),
        )
      } else {
        const { pubkey, output } = Bitcoin.payments.p2tr({
          address: sender,
        })
        selectionResult.inputs.forEach((utxo: UTXO) =>
          psbt.addInput({
            hash: utxo.hash,
            index: utxo.index,
            witnessUtxo: { value: utxo.value, script: output as Buffer },
            tapInternalKey: pubkey,
          }),
        )
      }

      // Add recipient output
      psbt.addOutput({
        address: recipient,
        value: targetValue,
      })

      // Add change output if needed
      if (selectionResult.changeAmount > 0) {
        psbt.addOutput({
          address: sender,
          value: selectionResult.changeAmount,
        })
      }

      // Add memo output if present
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 })
      }

      return { psbt, utxos, inputs: selectionResult.inputs }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'buildTxEnhanced')
    }
  }

  /**
   * Build a Bitcoin transaction.*
   * @param param0
   * @deprecated Use buildTxEnhanced for better performance and validation
   */
  async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
    spendPendingUTXO = true,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
    spendPendingUTXO?: boolean
    withTxHex?: boolean
  }): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
    // Check memo length
    if (memo && memo.length > 80) {
      throw new Error('memo too long, must not be longer than 80 chars.')
    }
    // This section of the code is responsible for preparing a transaction by building a Bitcoin PSBT (Partially Signed Bitcoin Transaction).
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')
    // Determine whether to only use confirmed UTXOs or include pending UTXOs based on the spendPendingUTXO flag.
    const confirmedOnly = !spendPendingUTXO
    // Scan UTXOs associated with the sender's address.
    const utxos = await this.scanUTXOs(sender, confirmedOnly)
    // Throw an error if there are no available UTXOs to cover the transaction.
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')
    // Round up the fee rate to the nearest integer.
    const feeRateWhole = Math.ceil(feeRate)
    // Compile the memo into a Buffer if provided.
    const compiledMemo = memo ? this.compileMemo(memo) : null
    // Initialize an array to store the target outputs of the transaction.
    const targetOutputs = []

    // 1. Add the recipient address and amount to the target outputs.
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    // 2. Add the compiled memo to the target outputs if it exists.
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }
    // Use the coinselect library to determine the inputs and outputs for the transaction.
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)
    // If no suitable inputs or outputs are found, throw an error indicating insufficient balance.
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')
    // Initialize a new Bitcoin PSBT object.
    const psbt = new Bitcoin.Psbt({ network: Utils.btcNetwork(this.network) }) // Network-specific

    if (this.addressFormat === AddressFormat.P2WPKH) {
      // Add inputs to the PSBT from the accumulated inputs.
      inputs.forEach((utxo: UTXO) =>
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          witnessUtxo: utxo.witnessUtxo,
        }),
      )
    } else {
      const { pubkey, output } = Bitcoin.payments.p2tr({
        address: sender,
      })
      inputs.forEach((utxo: UTXO) =>
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          witnessUtxo: { value: utxo.value, script: output as Buffer },
          tapInternalKey: pubkey,
        }),
      )
    }
    // Add outputs to the PSBT from the accumulated outputs.
    outputs.forEach((output: Bitcoin.PsbtTxOutput) => {
      // If the output address is not specified, it's considered a change address and set to the sender's address.
      if (!output.address) {
        //an empty address means this is the change address
        output.address = sender
      }
      // Add the output to the PSBT.
      if (!output.script) {
        psbt.addOutput(output)
      } else {
        // If the output is a memo, add it to the PSBT to avoid dust error.
        if (compiledMemo) {
          psbt.addOutput({ script: compiledMemo, value: 0 })
        }
      }
    })

    return { psbt, utxos, inputs }
  }

  /**
   * Send maximum possible amount (sweep) with optimal fee calculation
   * @param params Send max parameters
   * @returns Transaction details with maximum sendable amount
   */
  async sendMax({
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
  }): Promise<{
    psbt: Bitcoin.Psbt
    utxos: UTXO[]
    inputs: UTXO[]
    maxAmount: number
    fee: number
  }> {
    try {
      // Basic validation (skip amount validation since we're calculating max)
      if (!recipient?.trim()) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }

      UtxoTransactionValidator.validateAddressFormat(recipient, this.network, 'BTC')
      UtxoTransactionValidator.validateAddressFormat(sender, this.network, 'BTC')

      if (memo) {
        // Only validate memo for send max (skip amount validation)
        if (typeof memo !== 'string') {
          throw UtxoError.validationError('Memo must be a string')
        }
        const memoBytes = Buffer.byteLength(memo, 'utf8')
        if (memoBytes > 80) {
          throw UtxoError.validationError(`Memo too long: ${memoBytes} bytes (max 80 bytes)`)
        }
      }

      // Get validated UTXOs
      const confirmedOnly = !spendPendingUTXO
      const utxos = await this.getValidatedUtxos(sender, confirmedOnly)

      // Calculate maximum sendable amount
      const maxCalc = this.calculateMaxSendableAmount(utxos, Math.ceil(feeRate), !!memo, utxoSelectionPreferences)

      const compiledMemo = memo ? this.compileMemo(memo) : null
      const psbt = new Bitcoin.Psbt({ network: Utils.btcNetwork(this.network) })

      // Add inputs
      if (this.addressFormat === AddressFormat.P2WPKH) {
        maxCalc.inputs.forEach((utxo: UTXO) =>
          psbt.addInput({
            hash: utxo.hash,
            index: utxo.index,
            witnessUtxo: utxo.witnessUtxo,
          }),
        )
      } else {
        const { pubkey, output } = Bitcoin.payments.p2tr({
          address: sender,
        })
        maxCalc.inputs.forEach((utxo: UTXO) =>
          psbt.addInput({
            hash: utxo.hash,
            index: utxo.index,
            witnessUtxo: { value: utxo.value, script: output as Buffer },
            tapInternalKey: pubkey,
          }),
        )
      }

      // Add recipient output (max amount - no change)
      psbt.addOutput({
        address: recipient,
        value: maxCalc.amount,
      })

      // Add memo output if present
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 })
      }

      return {
        psbt,
        utxos,
        inputs: maxCalc.inputs,
        maxAmount: maxCalc.amount,
        fee: maxCalc.fee,
      }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'sendMax')
    }
  }

  /**
   * Prepare maximum amount transfer (sweep transaction)
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
      const { psbt, utxos, inputs, maxAmount, fee } = await this.sendMax({
        sender,
        recipient,
        memo,
        feeRate,
        spendPendingUTXO,
        utxoSelectionPreferences,
      })

      return {
        rawUnsignedTx: psbt.toBase64(),
        utxos,
        inputs,
        maxAmount,
        fee,
      }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        console.error('Bitcoin max transaction preparation failed:', error.toJSON())
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareMaxTx')
    }
  }

  /**
   * Enhanced prepare transfer with comprehensive validation and optimal UTXO selection.
   *
   * @param params The transfer options with enhanced UTXO selection preferences.
   * @returns The raw unsigned transaction with enhanced error handling.
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
      const { psbt, utxos, inputs } = await this.buildTxEnhanced({
        sender,
        recipient,
        amount,
        feeRate,
        memo,
        spendPendingUTXO,
        utxoSelectionPreferences,
      })

      return { rawUnsignedTx: psbt.toBase64(), utxos, inputs }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        console.error('Enhanced Bitcoin transaction preparation failed:', error.toJSON())
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareTxEnhanced')
    }
  }

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address&FeeRate&boolean} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   * @deprecated Use prepareTxEnhanced for better performance and validation
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    spendPendingUTXO = true,
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx> {
    // Build the transaction using the provided parameters.
    const { psbt, utxos, inputs } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
      spendPendingUTXO,
    })
    // Return the raw unsigned transaction (PSBT) and associated UTXOs.
    return { rawUnsignedTx: psbt.toBase64(), utxos, inputs }
  }
}

export { Client }
