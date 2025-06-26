// Import statements for necessary modules and types
import * as bitcore from 'bitcore-lib-cash'
import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client' // Importing various types and constants from xchain-client module
import { Address } from '@xchainjs/xchain-util' // Importing the Address type from xchain-util module
import { Client as UTXOClient, TxParams, UtxoClientParams, UTXO } from '@xchainjs/xchain-utxo' // Importing necessary types and the UTXOClient class from xchain-utxo module
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
    builder: bitcore.Transaction
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

    // Return transaction builder, UTXOs, and inputs
    return {
      builder: tx,
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
    const { builder, utxos, inputs } = await this.buildTx({
      sender,
      recipient,
      amount,
      memo,
      feeRate,
    })
    // Return the raw unsigned transaction and UTXOs
    return { rawUnsignedTx: builder.toString(), utxos, inputs }
  }
  /**
   * Compile a memo.
   * @param {string} memo - The memo to be compiled.
   * @returns {Buffer} - The compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8')
    const script = bitcore.Script.buildDataOut(data)
    return script.toBuffer()
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
