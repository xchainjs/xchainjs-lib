import bitcore from 'bitcore-lib-cash'
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
import accumulative from 'coinselect/accumulative.js'

import {
  AssetBCH,
  BCHChain,
  BCH_DECIMAL,
  BitgoProviders,
  BlockbookDataProviders,
  HaskoinDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import { BchPreparedTx } from './types'
import * as Utils from './utils'
export const defaultBchParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BitgoProviders, HaskoinDataProviders, BlockbookDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/145'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
    [Network.Stagenet]: `m/44'/145'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
abstract class Client extends UTXOClient {
  constructor(params = defaultBchParams) {
    super(BCHChain, {
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
      asset: AssetBCH,
      decimal: BCH_DECIMAL,
    }
    return assetInfo
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /** @deprecated */
  async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
  }): Promise<{
    builder: bitcore.Transaction
    utxos: UTXO[]
    inputs: UTXO[]
  }> {
    const recipientCashAddress = Utils.toCashAddress(recipient)
    if (!this.validateAddress(recipientCashAddress)) throw new Error('Invalid address')

    const utxos = await this.scanUTXOs(sender, false)
    if (utxos.length === 0) throw new Error('No utxos to send')

    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []

    // bitcore requires CashAddr / BCH legacy byte — not BTC-style 1…
    targetOutputs.push({
      address: recipientCashAddress,
      value: amount.amount().toNumber(),
    })

    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    const tx = new bitcore.Transaction().from(
      inputs.map((utxo: UTXO) => ({
        txId: utxo.hash,
        outputIndex: utxo.index,
        address: sender,
        script: bitcore.Script.fromHex(utxo.witnessUtxo?.script.toString('hex') || ''),
        satoshis: utxo.value,
      })),
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outputs.forEach((output: any) => {
      if (!output.address) {
        tx.to(sender, output.value) // change back to sender
      } else {
        tx.to(output.address, output.value)
      }
    })

    if (compiledMemo) {
      tx.addOutput(
        new bitcore.Transaction.Output({
          script: compiledMemo,
          satoshis: 0,
        }),
      )
    }

    return {
      builder: tx,
      utxos,
      inputs,
    }
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
  }): Promise<BchPreparedTx> {
    const { builder, utxos, inputs } = await this.buildTx({
      sender,
      recipient,
      amount,
      memo,
      feeRate,
    })
    // Bitcoin transaction builder toString() returns hex. Left as-is during the ESLint 8 upgrade.
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return { rawUnsignedTx: builder.toString(), utxos, inputs }
  }
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8')
    const script = bitcore.Script.buildDataOut(data)
    return script.toBuffer()
  }
  protected getTxSizeConstants(): TxSizeConstants {
    return { BASE_TX_SIZE: 10, BYTES_PER_INPUT: 148, BYTES_PER_OUTPUT: 34 }
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
  }): Promise<{
    builder: bitcore.Transaction
    utxos: UTXO[]
    inputs: UTXO[]
  }> {
    try {
      this.validateTransactionInputs({
        amount,
        recipient,
        memo,
        sender,
        feeRate,
      })

      const recipientCashAddress = Utils.toCashAddress(recipient)
      if (!this.validateAddress(recipientCashAddress)) {
        throw UtxoError.invalidAddress(recipient, this.network)
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
      const targetValue = amount.amount().toNumber()
      const selectionResult = this.selectUtxosForTransaction(
        utxos,
        targetValue,
        Math.ceil(feeRate),
        0,
        utxoSelectionPreferences,
        this.getSendSizes(recipient, compiledMemo?.length),
      )

      const tx = new bitcore.Transaction().from(
        selectionResult.inputs.map(
          (utxo: UTXO) =>
            new bitcore.Transaction.UnspentOutput({
              txId: utxo.hash,
              outputIndex: utxo.index,
              address: sender,
              script: bitcore.Script.fromHex(utxo.witnessUtxo?.script.toString('hex') || ''),
              satoshis: utxo.value,
            }),
        ),
      )

      // Must be CashAddr; bitcore rejects BTC-style legacy 1…/3….
      tx.to(recipientCashAddress, targetValue)

      if (selectionResult.changeAmount > 0) {
        tx.to(Utils.toCashAddress(sender), selectionResult.changeAmount)
      }

      if (compiledMemo) {
        tx.addOutput(
          new bitcore.Transaction.Output({
            script: compiledMemo,
            satoshis: 0,
          }),
        )
      }

      return { builder: tx, utxos, inputs: selectionResult.inputs }
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
      const { builder, utxos, inputs } = await this.buildTxEnhanced({
        sender,
        recipient,
        amount,
        feeRate,
        memo,
        spendPendingUTXO,
        utxoSelectionPreferences,
        selectedUtxos,
      })

      // Bitcoin Cash transaction builder toString() returns hex.
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return { rawUnsignedTx: builder.toString(), utxos, inputs }
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
      const recipientCashAddress = Utils.toCashAddress(recipient)
      if (!this.validateAddress(recipientCashAddress)) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(Utils.toCashAddress(sender))) {
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

      const tx = new bitcore.Transaction().from(
        maxCalc.inputs.map(
          (utxo: UTXO) =>
            new bitcore.Transaction.UnspentOutput({
              txId: utxo.hash,
              outputIndex: utxo.index,
              address: sender,
              script: bitcore.Script.fromHex(utxo.witnessUtxo?.script.toString('hex') || ''),
              satoshis: utxo.value,
            }),
        ),
      )

      // Recipient gets the max; no change output.
      tx.to(recipientCashAddress, maxCalc.amount)

      if (compiledMemo) {
        tx.addOutput(
          new bitcore.Transaction.Output({
            script: compiledMemo,
            satoshis: 0,
          }),
        )
      }

      // Bitcoin Cash transaction builder toString() returns hex.
      return {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
