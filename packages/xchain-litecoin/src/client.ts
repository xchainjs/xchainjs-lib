import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import {
  Client as UTXOClient,
  PreparedTx,
  TxParams,
  TxSizeConstants,
  UTXO,
  UtxoClientParams,
  UtxoError,
  UtxoSelectionPreferences,
  UtxoTransactionValidator,
} from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative.js'

import {
  AssetLTC,
  BitgoProviders,
  BlockbookDataProviders,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  LTCChain,
  LTC_DECIMAL,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import * as Utils from './utils'
export const defaultLtcParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BitgoProviders, BlockcypherDataProviders, BlockbookDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/2'/0'/0/`,
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/2'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

abstract class Client extends UTXOClient {
  constructor(params = defaultLtcParams) {
    super(LTCChain, {
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
      asset: AssetLTC,
      decimal: LTC_DECIMAL,
    }
    return assetInfo
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * @deprecated This function will eventually be removed. Use `prepareTx` instead.
   */
  async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
  }): Promise<{ psbt: Litecoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')

    const utxos = await this.scanUTXOs(sender, false)
    if (utxos.length === 0) throw new Error('No utxos to send')

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

    // .inputs and .outputs will be undefined if no solution was found
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    const psbt = new Litecoin.Psbt({ network: Utils.ltcNetwork(this.network) })
    inputs.forEach((utxo: UTXO) =>
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        witnessUtxo: utxo.witnessUtxo,
      }),
    )

    outputs.forEach((output: Litecoin.PsbtTxOutput) => {
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
    return Litecoin.script.compile([Litecoin.opcodes.OP_RETURN, data])
  }

  protected getTxSizeConstants(): TxSizeConstants {
    return { BASE_TX_SIZE: 11, BYTES_PER_INPUT: 68, BYTES_PER_OUTPUT: 31 }
  }

  /** Litecoin relays outputs from 5460 litoshi (`DUST_RELAY_TX_FEE` 30000), which also covers P2PKH recipients. */
  protected getDustThreshold(): number {
    return 5460
  }

  protected getRecipientOutputBytes(recipient?: Address): number {
    if (!recipient) return super.getRecipientOutputBytes()
    return 9 + Litecoin.address.toOutputScript(recipient, Utils.ltcNetwork(this.network)).length
  }

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
  }): Promise<{ psbt: Litecoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
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
      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        0,
        utxoSelectionPreferences,
        this.getSendSizes(recipient, compiledMemo?.length),
      )

      const psbt = new Litecoin.Psbt({ network: Utils.ltcNetwork(this.network) })

      selectionResult.inputs.forEach((utxo: UTXO) =>
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          witnessUtxo: utxo.witnessUtxo,
        }),
      )

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
    psbt: Litecoin.Psbt
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

      const compiledMemo = memo ? this.compileMemo(memo) : null

      const maxCalc = this.calculateMaxSendableAmount(
        utxos,
        Math.ceil(feeRate),
        compiledMemo?.length ?? 0,
        utxoSelectionPreferences,
        recipient,
      )
      const psbt = new Litecoin.Psbt({ network: Utils.ltcNetwork(this.network) })

      maxCalc.inputs.forEach((utxo: UTXO) =>
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          witnessUtxo: utxo.witnessUtxo,
        }),
      )

      // Recipient gets the max; no change output.
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
