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
import * as Dogecoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative.js'

import {
  AssetDOGE,
  BitgoProviders,
  BlockbookDataProviders,
  DOGEChain,
  DOGE_DECIMAL,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  blockcypherDataProviders,
  blockstreamExplorerProviders,
} from './const'
import { LedgerTxInfo, LedgerTxInfoParams } from './types/ledger'
import * as Utils from './utils'
export const defaultDogeParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BitgoProviders, blockcypherDataProviders, BlockbookDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/3'/0'/0/`,
    [Network.Stagenet]: `m/44'/3'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
abstract class Client extends UTXOClient {
  constructor(params = defaultDogeParams) {
    super(DOGEChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
  }

  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDOGE,
      decimal: DOGE_DECIMAL,
    }
    return assetInfo
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * @deprecated Use the `transfer` method instead.
   */
  public buildTx = async ({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
  }): Promise<{ psbt: Dogecoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> => {
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')

    const utxos = await this.scanUTXOs(sender, false)
    if (utxos.length === 0) throw new Error('No UTXOs to send')

    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    if (!inputs || !outputs) throw new Error('Balance insufficient for transaction')

    const psbt = new Dogecoin.Psbt({ network: Utils.dogeNetwork(this.network) })
    psbt.setMaximumFeeRate(7500000)

    for (const utxo of inputs) {
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        nonWitnessUtxo: Buffer.from(utxo.txHex, 'hex'),
      })
    }
    outputs.forEach((output: Dogecoin.PsbtTxOutput) => {
      if (!output.address) {
        //an empty address means this is the  change address
        output.address = sender
      }
      if (!output.script) {
        psbt.addOutput(output)
      } else {
        //we need to add the compiled memo this way to
        //avoid dust error tx when accumulating memo output with 0 value
        if (compiledMemo) {
          psbt.addOutput({ script: compiledMemo, value: 0 })
        }
      }
    })

    return { psbt, utxos, inputs }
  }

  public async createTxInfo(params: LedgerTxInfoParams): Promise<LedgerTxInfo> {
    const { psbt, utxos } = await this.buildTx(params)
    const ledgerTxInfo: LedgerTxInfo = {
      utxos,
      newTxHex: psbt.data.globalMap.unsignedTx.toBuffer().toString('hex'),
    }
    return ledgerTxInfo
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
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx & { utxos: UTXO[]; inputs: UTXO[] }> {
    const { psbt, utxos, inputs } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
    })

    return { rawUnsignedTx: psbt.toBase64(), utxos, inputs }
  }

  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8')
    return Dogecoin.script.compile([Dogecoin.opcodes.OP_RETURN, data])
  }

  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    const inputSizeBasedOnInputs =
      inputs.length > 0
        ? inputs.reduce((a) => a + Utils.inputBytes(), 0) + inputs.length // +1 byte for each input signature
        : 0
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
    const fee = sum * feeRate
    return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
  }

  /**
   * Doge uses legacy P2PKH addresses (nonWitnessUtxo).
   */
  async buildTxEnhanced({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
    spendPendingUTXO = true,
    utxoSelectionPreferences,
    selectedUtxos,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
    spendPendingUTXO?: boolean
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
  }): Promise<{ psbt: Dogecoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
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

      const psbt = new Dogecoin.Psbt({ network: Utils.dogeNetwork(this.network) })
      psbt.setMaximumFeeRate(7500000)

      // Doge uses nonWitnessUtxo (legacy P2PKH)
      for (const utxo of selectionResult.inputs) {
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          nonWitnessUtxo: Buffer.from(utxo.txHex || '', 'hex'),
        })
      }

      psbt.addOutput({
        address: recipient,
        value: targetValue,
      })

      if (selectionResult.changeAmount > 0) {
        psbt.addOutput({
          address: sender,
          value: selectionResult.changeAmount,
        })
      }

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
      const { psbt, utxos, inputs } = await this.buildTxEnhanced({
        sender,
        recipient,
        amount,
        feeRate,
        memo,
        spendPendingUTXO,
        utxoSelectionPreferences,
        selectedUtxos,
      })

      return { rawUnsignedTx: psbt.toBase64(), utxos, inputs }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareTxEnhanced')
    }
  }

  async sendMax({
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
  }): Promise<{
    psbt: Dogecoin.Psbt
    utxos: UTXO[]
    inputs: UTXO[]
    maxAmount: number
    fee: number
  }> {
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

      const compiledMemo = memo ? this.compileMemo(memo) : null
      const psbt = new Dogecoin.Psbt({ network: Utils.dogeNetwork(this.network) })
      psbt.setMaximumFeeRate(7500000)

      // Doge uses nonWitnessUtxo
      for (const utxo of maxCalc.inputs) {
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          nonWitnessUtxo: Buffer.from(utxo.txHex || '', 'hex'),
        })
      }

      psbt.addOutput({
        address: recipient,
        value: maxCalc.amount,
      })

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
      const { psbt, utxos, inputs, maxAmount, fee } = await this.sendMax({
        sender,
        recipient,
        memo,
        feeRate,
        spendPendingUTXO,
        utxoSelectionPreferences,
        selectedUtxos,
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
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareMaxTx')
    }
  }
}

export { Client }
