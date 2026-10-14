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

  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDASH,
      decimal: DASH_DECIMAL,
    }
    return assetInfo
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * @deprecated Use `prepareTxEnhanced` instead for better UTXO selection and error handling.
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
    const { tx, utxos, inputs } = await Utils.buildTx({
      sender,
      recipient,
      memo,
      amount,
      feeRate,
      network: this.network,
    })
    // ESLint disabled: Dash transaction has proper toString() method that returns hex string
    // Left as-is during ESLint 8 upgrade as this core crypto functionality is tested and working
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return { rawUnsignedTx: tx.toString(), utxos, inputs }
  }
  protected compileMemo(memo: string): Buffer {
    return dashcore.Script.buildDataOut(memo)
  }

  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
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
    if (data) {
      sum +=
        Utils.TransactionBytes.OutputValue +
        Utils.TransactionBytes.OutputScriptLength +
        Utils.TransactionBytes.OutputOpReturn +
        data.length
    }
    const fee = sum * feeRate
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
      this.validateTransactionInputs({
        amount,
        recipient,
        memo,
        sender,
        feeRate,
      })

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

      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        extraOutputs,
        utxoSelectionPreferences,
      )

      const tx = new dashcore.Transaction().to(recipient, targetValue)

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

      const senderAddress = dashcore.Address.fromString(sender, this.network)
      tx.change(senderAddress)

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
      if (!this.validateAddress(recipient)) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(sender)) {
        throw UtxoError.invalidAddress(sender, this.network)
      }

      let utxos: UTXO[]
      if (selectedUtxos && selectedUtxos.length > 0) {
        UtxoTransactionValidator.validateUtxoSet(selectedUtxos)
        utxos = selectedUtxos
      } else {
        const confirmedOnly = !spendPendingUTXO
        utxos = await this.getValidatedUtxos(sender, confirmedOnly)
      }

      const maxCalc = this.calculateMaxSendableAmount(utxos, Math.ceil(feeRate), !!memo, utxoSelectionPreferences)

      const tx = new dashcore.Transaction().to(recipient, maxCalc.amount)

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
