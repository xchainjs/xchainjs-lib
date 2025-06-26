import * as bitcore from 'bitcore-lib-cash'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client' // Importing getSeed function from xchain-crypto module
import { getSeed } from '@xchainjs/xchain-crypto' // Importing the Address type from xchain-util module
import { Address } from '@xchainjs/xchain-util' // Importing necessary types from bitcoincashjs-types module
import { TxParams } from '@xchainjs/xchain-utxo' // Importing necessary types and the UTXOClient class from xchain-utxo module

import { Client } from './client' // Importing the base BitcoinCash client
import * as Utils from './utils'
import { HDKey } from '@scure/bip32'

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
      const address = bchKeys.toAddress().toString()

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
  private getBCHKeys(phrase: string, derivationPath: string) {
    const rootSeed = getSeed(phrase) // Get seed from the phrase
    const root = HDKey.fromMasterSeed(Uint8Array.from(rootSeed))
    const child = root.derive(derivationPath)

    if (!child.privateKey) {
      throw new Error('Invalid derived private key')
    }
  
    const privateKey = new bitcore.PrivateKey(
      Buffer.from(child.privateKey).toString('hex'),
      Utils.bchNetwork(this.network)
    )

    return privateKey
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
    const { rawUnsignedTx, inputs } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    // Get key from mnemonic and path
    const derivationPath = this.getFullDerivationPath(fromAddressIndex)
    const privateKey = this.getBCHKeys(this.phrase, derivationPath)

    // Recreate the transaction from rawUnsignedTx
    const unsignedTx = new bitcore.Transaction(rawUnsignedTx)

    // Rebuild the transaction with inputs enriched with UTXO values and scripts
    const tx = new bitcore.Transaction()

    const sender = await this.getAddressAsync(fromAddressIndex)

    tx.from(
      inputs.map((input) =>
        new bitcore.Transaction.UnspentOutput({
          txId: input.hash,
          outputIndex: input.index,
          address: sender,
          script: bitcore.Script.fromHex(input.witnessUtxo?.script.toString('hex') || ''),
          satoshis: input.value,
        }),
      )
    )

    unsignedTx.outputs.forEach((out) => {
      tx.addOutput(new bitcore.Transaction.Output({
        script: out.script,
        satoshis: out.satoshis,
      }))
    })

    tx.sign(privateKey)

    const txHex = tx.toString()

    return await this.roundRobinBroadcastTx(txHex)
  }
}

export { ClientKeystore }
