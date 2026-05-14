import dashcore from '@dashevo/dashcore-lib'
import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import {
  Client as UTXOClient,
  PreparedTx,
  TxParams,
  UTXO,
  UtxoClientParams,
  UtxoError,
  UtxoSelectionPreferences,
  UtxoTransactionValidator,
} from '@xchainjs/xchain-utxo'

import {
  AssetDASH,
  BitgoProviders,
  BlockcypherDataProviders,
  DASHChain,
  DASH_DECIMAL,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import { DashPreparedTx, NodeAuth, NodeUrls } from './types'
import * as Utils from './utils'

/**
 * Default parameters for the DASH client.
 */
export const defaultDashParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BlockcypherDataProviders, BitgoProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/5'/0'/0/`,
    [Network.Stagenet]: `m/44'/5'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://insight.dash.org/insight-api',
    [Network.Stagenet]: 'https://insight.dash.org/insight-api',
    [Network.Testnet]: 'http://insight.testnet.networks.dash.org:3001/insight-api',
  },
}
/**
 * DASH client class extending UTXOClient.
 */
abstract class Client extends UTXOClient {
  protected readonly nodeUrls: NodeUrls
  protected readonly nodeAuth?: NodeAuth

  constructor(params = defaultDashParams) {
    super(DASHChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.nodeUrls = params.nodeUrls
    this.nodeAuth = params.nodeAuth
  }

  /**
   * Get the asset info for DASH.
   * @returns {AssetInfo} The asset info for DASH.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDASH,
      decimal: DASH_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate a DASH address.
   * @param {string} address The DASH address to validate.
   * @returns {boolean} True if the address is valid, false otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Asynchronously prepares a transaction for sending assets.
   * @deprecated Use `prepareTxEnhanced` instead for better UTXO selection and error handling.
   * @param {TxParams&Address&FeeRate} params - Parameters for the transaction preparation.
   * @returns {string} A promise resolving to the prepared transaction data.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
  }): Promise<DashPreparedTx> {
    // Build the transaction using provided parameters
    const { tx, utxos, inputs } = await Utils.buildTx({
      sender,
      recipient,
      memo,
      amount,
      feeRate,
      network: this.network,
    })
    // Return the raw unsigned transaction and UTXOs
    // ESLint disabled: Dash transaction has proper toString() method that returns hex string
    // Left as-is during ESLint 8 upgrade as this core crypto functionality is tested and working
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return { rawUnsignedTx: tx.toString(), utxos, inputs }
  }
  /**
   * Compiles a memo into a buffer.
   * @param {string} memo - The memo to be compiled.
   * @returns {Buffer} The compiled memo as a buffer.
   */
  protected compileMemo(memo: string): Buffer {
    return dashcore.Script.buildDataOut(memo)
  }

  /**
   * Calculates the transaction fee based on the provided UTXOs, fee rate, and optional compiled memo.
   * @param {UTXO[]} inputs - The UTXOs used as inputs for the transaction.
   * @param {FeeRate} feeRate - The fee rate for the transaction.
   * @param {Buffer | null} data - The compiled memo as a buffer (optional).
   * @returns {number} The calculated transaction fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    // Calculate the size of the transaction in bytes
    let sum =
      Utils.TransactionBytes.Version +
      Utils.TransactionBytes.Type +
      Utils.TransactionBytes.InputCount +
      inputs.length *
        (Utils.TransactionBytes.InputPrevOutputHash +
          Utils.TransactionBytes.InputPrevOutputIndex +
          Utils.TransactionBytes.InputScriptLength +
          Utils.TransactionBytes.InputPubkeyHash +
          Utils.TransactionBytes.InputSequence) +
      Utils.TransactionBytes.OutputCount +
      2 *
        (Utils.TransactionBytes.OutputValue +
          Utils.TransactionBytes.OutputScriptLength +
          Utils.TransactionBytes.OutputPubkeyHash) +
      Utils.TransactionBytes.LockTime
    // Add size of the memo data if provided
    if (data) {
      sum +=
        Utils.TransactionBytes.OutputValue +
        Utils.TransactionBytes.OutputScriptLength +
        Utils.TransactionBytes.OutputOpReturn +
        data.length
    }
    // Calculate fee based on transaction size and fee rate
    const fee = sum * feeRate
    // Ensure fee meets minimum requirement
    return fee > Utils.TX_MIN_FEE ? fee : Utils.TX_MIN_FEE
  }

  private getUtxoScriptHex(utxo: UTXO): string {
    // Providers may populate either scriptPubKey (Insight) or witnessUtxo.script (Blockcypher)
    const scriptHex = utxo.scriptPubKey || utxo.witnessUtxo?.script.toString('hex')
    if (!scriptHex) {
      throw UtxoError.validationError(`UTXO ${utxo.hash}:${utxo.index} is missing scriptPubKey and witnessUtxo.script`)
    }
    return scriptHex
  }

  // ==================== Enhanced Transaction Methods ====================

  /**
   * Prepare transaction with enhanced UTXO selection.
   * Uses base class UTXO selection logic with dashcore-lib transaction building.
   */
  async prepareTxEnhanced({
    sender,
    memo,
    amount,
    recipient,
    feeRate,
    spendPendingUTXO = true,
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
      // Validate inputs using base class method
      this.validateTransactionInputs({
        amount,
        recipient,
        memo,
        sender,
        feeRate,
      })

      // Use provided UTXOs (coin control) or fetch from chain
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
      const extraOutputs = 1 + (compiledMemo ? 1 : 0)

      // Use base class UTXO selection
      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        extraOutputs,
        utxoSelectionPreferences,
      )

      // Build transaction using dashcore-lib
      const tx = new dashcore.Transaction().to(recipient, targetValue)

      // Add selected inputs
      for (const utxo of selectionResult.inputs) {
        const scriptBuffer: Buffer = Buffer.from(this.getUtxoScriptHex(utxo), 'hex')
        const script = new dashcore.Script(scriptBuffer)
        const input = new dashcore.Transaction.Input.PublicKeyHash({
          prevTxId: Buffer.from(utxo.hash, 'hex'),
          outputIndex: utxo.index,
          script: '',
          output: new dashcore.Transaction.Output({
            satoshis: utxo.value,
            script,
          }),
        })
        tx.uncheckedAddInput(input)
      }

      // Set change address
      const senderAddress = dashcore.Address.fromString(sender, this.network)
      tx.change(senderAddress)

      // Add memo if provided
      if (memo) {
        tx.addData(memo)
      }

      // Dash transaction has proper toString() method that returns hex string
      return { rawUnsignedTx: tx.toString(), utxos, inputs: selectionResult.inputs }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareTxEnhanced')
    }
  }

  /**
   * Prepare max send transaction
   */
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
      // Validate addresses
      if (!this.validateAddress(recipient)) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(sender)) {
        throw UtxoError.invalidAddress(sender, this.network)
      }

      // Use provided UTXOs (coin control) or fetch from chain
      let utxos: UTXO[]
      if (selectedUtxos && selectedUtxos.length > 0) {
        UtxoTransactionValidator.validateUtxoSet(selectedUtxos)
        utxos = selectedUtxos
      } else {
        const confirmedOnly = !spendPendingUTXO
        utxos = await this.getValidatedUtxos(sender, confirmedOnly)
      }

      // Calculate max using base class method
      const maxCalc = this.calculateMaxSendableAmount(utxos, Math.ceil(feeRate), !!memo, utxoSelectionPreferences)

      // Build transaction using dashcore-lib
      const tx = new dashcore.Transaction().to(recipient, maxCalc.amount)

      // Add inputs
      for (const utxo of maxCalc.inputs) {
        const scriptBuffer: Buffer = Buffer.from(this.getUtxoScriptHex(utxo), 'hex')
        const script = new dashcore.Script(scriptBuffer)
        const input = new dashcore.Transaction.Input.PublicKeyHash({
          prevTxId: Buffer.from(utxo.hash, 'hex'),
          outputIndex: utxo.index,
          script: '',
          output: new dashcore.Transaction.Output({
            satoshis: utxo.value,
            script,
          }),
        })
        tx.uncheckedAddInput(input)
      }

      // Add memo if provided
      if (memo) {
        tx.addData(memo)
      }

      // Dash transaction has proper toString() method that returns hex string
      return {
        rawUnsignedTx: tx.toString(),
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
}

export { Client }
