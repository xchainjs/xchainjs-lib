import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { Client as UTXOClient, PreparedTx, TxParams, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative.js'

import {
  AssetDOGE,
  BitgoProviders,
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
/**
 * Default parameters for Dogecoin UTXO client.
 * Contains default values for network, phrase, explorer providers, data providers, root derivation paths, and fee bounds.
 */
export const defaultDogeParams: UtxoClientParams = {
  network: Network.Mainnet, // Default network is Mainnet
  phrase: '', // Default empty phrase
  explorerProviders: blockstreamExplorerProviders, // Default explorer providers
  dataProviders: [BitgoProviders, blockcypherDataProviders], // Default data providers
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/3'/0'/0/`, // Default root derivation path for Mainnet
    [Network.Stagenet]: `m/44'/3'/0'/0/`, // Default root derivation path for Stagenet
    [Network.Testnet]: `m/44'/1'/0'/0/`, // Default root derivation path for Testnet
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND, // Default lower fee bound
    upper: UPPER_FEE_BOUND, // Default upper fee bound
  },
}
/**
 * Custom Dogecoin client extending UTXOClient.
 * Implements methods for Dogecoin-specific functionality.
 */
abstract class Client extends UTXOClient {
  /**
   * Constructor for initializing the Dogecoin client.
   * Initializes the client with the provided parameters.
   *
   * @param {DogecoinClientParams} params Parameters for initializing the Dogecoin client.
   */
  constructor(params = defaultDogeParams) {
    super(DOGEChain, {
      // Call the superclass constructor with DOGEChain identifier and provided parameters
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
  }

  /**
   * Get Dogecoin asset information.
   *
   * @returns {AssetInfo} Dogecoin asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDOGE,
      decimal: DOGE_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address The Dogecoin address to validate.
   * @returns {boolean} `true` if the address is valid, otherwise `false`.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Builds a Dogecoin transaction (PSBT).
   *
   * Builds a Partially Signed Bitcoin Transaction (PSBT) with the specified parameters.
   * @param {BuildParams} params The transaction build options including sender, recipient, amount, memo, and fee rate.
   * @returns {Transaction} A promise that resolves to the built PSBT and the unspent transaction outputs (UTXOs) used in the transaction.
   * @deprecated This method is deprecated. Use the `transfer` method instead.
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
    // Validate the recipient address
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')

    // Scan unspent transaction outputs (UTXOs) for the sender's address
    const utxos = await this.scanUTXOs(sender, false)
    // Throw an error if no UTXOs are found
    if (utxos.length === 0) throw new Error('No UTXOs to send')

    // Round the fee rate to the nearest whole number
    const feeRateWhole = Number(feeRate.toFixed(0))
    // Compile the memo if provided
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []
    //1. Add output for the recipient
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    //2. Add output for the memo (if provided)
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }
    // Calculate the inputs and outputs for the transaction
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    // Throw an error if no solution was found for inputs and outputs
    if (!inputs || !outputs) throw new Error('Balance insufficient for transaction')

    // Create a new PSBT for building the transaction
    const psbt = new Dogecoin.Psbt({ network: Utils.dogeNetwork(this.network) })
    // Set the maximum fee rate for the PSBT
    psbt.setMaximumFeeRate(7500000)

    // Add inputs to the PSBT
    for (const utxo of inputs) {
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        nonWitnessUtxo: Buffer.from(utxo.txHex, 'hex'),
      })
    }
    // Outputs
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

  /**
   * Asynchronously creates transaction information for ledger sign.
   *
   * Builds a transaction (PSBT) and prepares necessary information for ledger signing.
   *
   * @param {LedgerTxInfoParams} params The parameters for creating transaction information.
   * @returns {LedgerTxInfo} A promise that resolves to the transaction information used for ledger sign.
   */
  public async createTxInfo(params: LedgerTxInfoParams): Promise<LedgerTxInfo> {
    // Build the transaction (PSBT) and obtain the unspent transaction outputs (UTXOs)
    const { psbt, utxos } = await this.buildTx(params)
    // Construct the ledger transaction information object
    const ledgerTxInfo: LedgerTxInfo = {
      utxos,
      newTxHex: psbt.data.globalMap.unsignedTx.toBuffer().toString('hex'), // Convert unsigned transaction to hexadecimal string
    }
    return ledgerTxInfo
  }

  /**
   * Asynchronously prepares a transaction for transfer.
   *
   * Builds a transaction (PSBT) with the specified transfer options.
   * @param {TxParams & { sender: Address; feeRate: FeeRate; spendPendingUTXO?: boolean }} params The transfer options including sender address, fee rate, and optional flag for spending pending UTXOs.
   * @returns {Promise<PreparedTx>} A promise that resolves to the raw unsigned transaction (PSBT).
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
    // Build the transaction (PSBT) with the specified transfer options
    const { psbt, utxos, inputs } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
    })

    // Return the raw unsigned transaction (PSBT)
    return { rawUnsignedTx: psbt.toBase64(), utxos, inputs }
  }

  /**
   * Compiles the memo into a buffer for inclusion in a Dogecoin transaction.
   *
   * @param {string} memo The memo to be compiled.
   * @returns {Buffer} The compiled memo as a buffer.
   */
  protected compileMemo(memo: string): Buffer {
    // Convert the memo to a buffer
    const data = Buffer.from(memo, 'utf8')
    // Compile the OP_RETURN script with the memo data
    return Dogecoin.script.compile([Dogecoin.opcodes.OP_RETURN, data])
  }

  /**
   * Calculates the transaction fee based on the provided UTXOs, fee rate, and optional data.
   *
   * @param {UTXO[]} inputs The unspent transaction outputs (UTXOs) used as inputs.
   * @param {FeeRate} feeRate The fee rate for the transaction.
   * @param {Buffer | null} data The compiled memo (optional).
   * @returns {number} The calculated transaction fee.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    // Calculate the size of the transaction
    const inputSizeBasedOnInputs =
      inputs.length > 0
        ? inputs.reduce((a) => a + Utils.inputBytes(), 0) + inputs.length // +1 byte for each input signature
        : 0
    // Calculate the sum of transaction size
    let sum =
      Utils.TX_EMPTY_SIZE +
      inputSizeBasedOnInputs +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH

    // Add additional output size if data is provided
    if (data) {
      sum += Utils.TX_OUTPUT_BASE + data.length
    }
    // Calculate the fee based on the sum of transaction size and the fee rate
    const fee = sum * feeRate
    // Ensure the fee is not less than the minimum transaction fee
    return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
  }
}

export { Client }
