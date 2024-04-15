// Import statements for necessary modules and types
import * as bitcash from '@psf/bitcoincashjs-lib'
import { AssetInfo, FeeRate, Network, TxParams } from '@xchainjs/xchain-client' // Importing various types and constants from xchain-client module
import { Address } from '@xchainjs/xchain-util' // Importing the Address type from xchain-util module
import { Client as UTXOClient, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo' // Importing necessary types and the UTXOClient class from xchain-utxo module
import accumulative from 'coinselect/accumulative' // Importing accumulative function from coinselect/accumulative module

import {
  AssetBCH,
  BCHChain,
  BCH_DECIMAL,
  BitgoProviders,
  HaskoinDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const' // Importing various constants from the const module
import { BchPreparedTx } from './types' // Importing the BchPreparedTx type from types module
import { TransactionBuilder } from './types/bitcoincashjs-types' // Importing necessary types from bitcoincashjs-types module
import * as Utils from './utils' // Importing utility functions from utils module
// Default parameters for Bitcoin Cash (BCH) client
export const defaultBchParams: UtxoClientParams = {
  network: Network.Mainnet, // Default network is Mainnet
  phrase: '', // Default empty phrase
  explorerProviders: explorerProviders, // Default explorer providers
  dataProviders: [BitgoProviders, HaskoinDataProviders], // Default data providers
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/145'/0'/0/`, // Default root derivation path for Mainnet
    [Network.Testnet]: `m/44'/1'/0'/0/`, // Default root derivation path for Testnet
    [Network.Stagenet]: `m/44'/145'/0'/0/`, // Default root derivation path for Stagenet
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND, // Default lower fee bound
    upper: UPPER_FEE_BOUND, // Default upper fee bound
  },
}
/**
 * Custom Bitcoin Cash client class.
 */
abstract class Client extends UTXOClient {
  /**
   * Constructor for the Client class.
   *
   * @param {UtxoClientParams} params - Parameters for initializing the client.
   */
  constructor(params = defaultBchParams) {
    // Call the constructor of the parent class (UTXOClient) with BCHChain as the chain and provided parameters
    super(BCHChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
  }

  /**
   * Get information about the BCH asset.
   * @returns Information about the BCH asset.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetBCH, // Asset symbol
      decimal: BCH_DECIMAL, // Decimal precision
    }
    return assetInfo
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Build a BCH transaction.
   * @param {BuildParams} params - The transaction build options.
   * @returns {Transaction} A promise that resolves with the transaction builder, UTXOs, and inputs.
   * @deprecated
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
  }): Promise<{
    builder: TransactionBuilder
    utxos: UTXO[]
    inputs: UTXO[]
  }> {
    // Convert recipient address to CashAddress format
    const recipientCashAddress = Utils.toCashAddress(recipient)
    // Validate recipient address
    if (!this.validateAddress(recipientCashAddress)) throw new Error('Invalid address')

    // Scan UTXOs for the sender address
    const utxos = await this.scanUTXOs(sender, false)
    // Throw error if no UTXOs are found
    if (utxos.length === 0) throw new Error('No utxos to send')

    // Convert fee rate to a whole number
    const feeRateWhole = Number(feeRate.toFixed(0))
    // Compile memo if provided
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []

    // Add output amount and recipient to target outputs
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })

    // Calculate transaction inputs and outputs
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    // Throw error if no solution is found
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    // Initialize a new transaction builder
    const transactionBuilder = new bitcash.TransactionBuilder(Utils.bchNetwork(this.network))

    // Add inputs to the transaction builder
    inputs.forEach((utxo: UTXO) =>
      transactionBuilder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex || '', 'hex')), utxo.index),
    )

    // Add outputs to the transaction builder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outputs.forEach((output: any) => {
      let out = undefined
      if (!output.address) {
        // An empty address means this is the change address
        out = bitcash.address.toOutputScript(Utils.toLegacyAddress(sender), Utils.bchNetwork(this.network))
      } else if (output.address) {
        out = bitcash.address.toOutputScript(Utils.toLegacyAddress(output.address), Utils.bchNetwork(this.network))
      }
      transactionBuilder.addOutput(out, output.value)
    })

    // Add output for memo if compiled
    if (compiledMemo) {
      transactionBuilder.addOutput(compiledMemo, 0) // Add OP_RETURN {script, value}
    }

    // Return transaction builder, UTXOs, and inputs
    return {
      builder: transactionBuilder,
      utxos,
      inputs,
    }
  }
  /**
   * Prepare a BCH transaction.
   * @param {TxParams&Address&FeeRate} params - The transaction preparation options.
   * @returns {PreparedTx} A promise that resolves with the prepared transaction and UTXOs.
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
    // Build the transaction using provided options
    const { builder, utxos } = await this.buildTx({
      sender,
      recipient,
      amount,
      memo,
      feeRate,
    })
    // Return the raw unsigned transaction and UTXOs
    return { rawUnsignedTx: builder.buildIncomplete().toHex(), utxos }
  }
  /**
   * Compile a memo.
   * @param {string} memo - The memo to be compiled.
   * @returns {Buffer} - The compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return bitcash.script.compile([bitcash.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  }
  /**
   * Calculate the transaction fee.
   * @param {UTXO[]} inputs - The UTXOs.
   * @param {FeeRate} feeRate - The fee rate.
   * @param {Buffer | null} data - The compiled memo (optional).
   * @returns {number} - The fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    let totalWeight = Utils.TX_EMPTY_SIZE
    totalWeight += (Utils.TX_INPUT_PUBKEYHASH + Utils.TX_INPUT_BASE) * inputs.length
    totalWeight += (Utils.TX_OUTPUT_BASE + Utils.TX_OUTPUT_PUBKEYHASH) * 2
    if (data) {
      totalWeight += 9 + data.length
    }
    return Math.ceil(totalWeight * feeRate)
  }
}

export { Client }
