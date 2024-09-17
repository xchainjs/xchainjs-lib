import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { Client as UTXOClient, PreparedTx, TxParams, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as Bitcoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative'
import * as ecc from 'tiny-secp256k1'

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
import * as Utils from './utils'

// Default parameters for the Bitcoin UTXO client
export const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BitgoProviders, BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`, // Not BIP44 compliant but compatible with pre-HD wallets
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
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
  protected useTapRoot: boolean
  /**
   * Constructor
   * Initializes the client with network type and other parameters.
   * @param {UtxoClientParams} params
   */
  constructor(params: UtxoClientParams & { useTapRoot?: boolean } = { ...defaultBTCParams, useTapRoot: false }) {
    super(BTCChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.useTapRoot = params.useTapRoot || false
    Bitcoin.initEccLib(this.useTapRoot ? ecc : undefined)
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
   * Build a Bitcoin transaction.*
   * @param param0
   * @deprecated
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

    if (!this.useTapRoot) {
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
   * Prepare transfer.
   *
   * @param {TxParams&Address&FeeRate&boolean} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
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
    const { psbt, utxos } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
      spendPendingUTXO,
    })
    // Return the raw unsigned transaction (PSBT) and associated UTXOs.
    return { rawUnsignedTx: psbt.toBase64(), utxos }
  }
}

export { Client }
