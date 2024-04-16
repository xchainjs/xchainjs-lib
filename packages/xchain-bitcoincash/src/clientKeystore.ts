import * as bitcash from '@psf/bitcoincashjs-lib'
import { FeeOption, FeeRate, TxHash, TxParams, checkFeeBounds } from '@xchainjs/xchain-client' // Importing getSeed function from xchain-crypto module
import { getSeed } from '@xchainjs/xchain-crypto' // Importing the Address type from xchain-util module
import { Address } from '@xchainjs/xchain-util' // Importing necessary types from bitcoincashjs-types module

import { Client } from './client' // Importing the base BitcoinCash client
import { KeyPair, Transaction, TransactionBuilder } from './types/bitcoincashjs-types' // Importing utility functions
import * as Utils from './utils'

/**
 * Custom Bitcoin client extended to support keystore functionality
 */
class ClientKeystore extends Client {
  /**
   * @deprecated This function eventually will be removed. Use getAddressAsync instead.
   * Get the address associated with the given index.
   * @param {number} index The index of the address.
   * @returns {Address} The Bitcoin address.
   * @throws {"index must be greater than zero"} Thrown if the index is less than zero.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed to create the address from the phrase.
   */
  getAddress(index = 0): Address {
    // Check if the index is valid
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }

    // Check if the phrase has been set
    if (this.phrase) {
      const bchKeys = this.getBCHKeys(this.phrase, this.getFullDerivationPath(index))

      // Generate the address using the Bitcoinjs library
      const address = bchKeys.getAddress(index)

      // Throw an error if the address is not defined
      if (!address) {
        throw new Error('Address not defined')
      }

      return Utils.stripPrefix(Utils.toCashAddress(address))
    }

    throw new Error('Phrase must be provided')
  }

  /**
   * Get the current address asynchronously.
   * @param {number} index The index of the address.
   * @returns {Promise<Address>} A promise that resolves to the BitcoinCash address.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Private function to get BCH keys.
   * Generates a key pair from the provided phrase and derivation path.
   * @param {string} phrase - The phrase used for generating the private key.
   * @param {string} derivationPath - The BIP44 derivation path.
   * @returns {PrivateKey} The key pair generated from the phrase and derivation path.
   *
   * @throws {"Invalid phrase"} Thrown if an invalid phrase is provided.
   * */
  private getBCHKeys(phrase: string, derivationPath: string): KeyPair {
    const rootSeed = getSeed(phrase) // Get seed from the phrase
    const masterHDNode = bitcash.HDNode.fromSeedBuffer(rootSeed, Utils.bchNetwork(this.network)) // Create HD node from seed
    return masterHDNode.derivePath(derivationPath).keyPair // Derive key pair from the HD node and derivation path
  }

  /**
   * Transfer BCH.
   * @param {TxParams & { feeRate?: FeeRate }} params - The transfer options.
   * @returns {Promise<TxHash>} A promise that resolves with the transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // Set the default fee rate to 'fast'
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    // Check if the fee rate is within the specified bounds
    checkFeeBounds(this.feeBounds, feeRate)

    // Get the index of the address to send funds from
    const fromAddressIndex = params.walletIndex || 0

    // Prepare the transaction by gathering necessary data
    const { rawUnsignedTx, utxos } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    // Convert the raw unsigned transaction to a Transaction object
    const tx: Transaction = bitcash.Transaction.fromHex(rawUnsignedTx)

    // Initialize a new transaction builder
    const builder: TransactionBuilder = new bitcash.TransactionBuilder(Utils.bchNetwork(this.network))

    // Add inputs to the transaction builder
    tx.ins.forEach((input) => {
      const utxo = utxos.find(
        (utxo) =>
          Buffer.compare(Buffer.from(utxo.hash, 'hex').reverse(), input.hash) === 0 && input.index === utxo.index,
      )
      if (!utxo) throw Error('Can not find UTXO')
      builder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex || '', 'hex')), utxo.index)
    })

    // Add outputs to the transaction builder
    tx.outs.forEach((output) => {
      builder.addOutput(output.script, output.value)
    })

    // Get the derivation path for the sender's address
    const derivationPath = this.getFullDerivationPath(fromAddressIndex)
    // Get the key pair for signing the transaction
    const keyPair = this.getBCHKeys(this.phrase, derivationPath)

    // Sign each input of the transaction with the key pair
    builder.inputs.forEach((input: { value: number }, index: number) => {
      builder.sign(index, keyPair, undefined, 0x41, input.value)
    })

    // Build the final transaction and convert it to hexadecimal format
    const txHex = builder.build().toHex()

    // Broadcast the transaction to the BCH network and return the transaction hash
    return await this.roundRobinBroadcastTx(txHex)
  }
}

export { ClientKeystore }
