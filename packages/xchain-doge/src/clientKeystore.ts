import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib' // Importing the base Doge client

import { Client } from './client' // Importing utility functions
import * as Utils from './utils'
/**
 * Custom Doge client extended to support keystore functionality
 */
class ClientKeystore extends Client {
  /**
   * Get the Dogecoin address.
   *
   * Generates a Dogecoin address using the provided phrase and index.
   * @param {number} index The index of the address to retrieve. Default is 0.
   * @returns {Address} The Dogecoin address.
   * @throws {"index must be greater than zero"} Thrown if the index is less than zero.
   * @throws {"Phrase must be provided"} Thrown if the phrase is not provided.
   * @throws {"Address not defined"} Thrown if failed to create the address from the phrase.
   */
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      // Get Dogecoin network and keys
      const dogeNetwork = Utils.dogeNetwork(this.network)
      const dogeKeys = this.getDogeKeys(this.phrase, index)
      // Generate Dogecoin address
      const { address } = Dogecoin.payments.p2pkh({
        pubkey: dogeKeys.publicKey,
        network: dogeNetwork,
      })
      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
  }
  /**
   * @private
   * Get private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase to be used for generating privkey
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating Doge keys from the given phrase
   * */
  private getDogeKeys(phrase: string, index = 0): Dogecoin.ECPairInterface {
    const dogeNetwork = Utils.dogeNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Dogecoin.bip32.fromSeed(seed, dogeNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Dogecoin.ECPair.fromPrivateKey(master.privateKey, { network: dogeNetwork })
  }

  /**
   * Get the current address.
   * Asynchronous version of getAddress method.
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   * @returns {Address} The current address.
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Asynchronously transfers Dogecoin.
   *
   * Builds, signs, and broadcasts a Dogecoin transaction with the specified parameters.
   * @param {TxParams & { feeRate?: FeeRate }} params The transfer parameters including transaction details and optional fee rate.
   * @returns {TxHash} A promise that resolves to the transaction hash once the transfer is completed.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // Determine the fee rate for the transaction, using provided fee rate or fetching it from the network
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    // Check if the fee rate is within the specified fee bounds
    checkFeeBounds(this.feeBounds, feeRate)

    // Get the index of the sender's address or use the default index (0)
    const fromAddressIndex = params?.walletIndex || 0
    // Prepare the transaction by building it with the specified parameters
    const { rawUnsignedTx } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })
    // Get the Dogecoin keys for signing the transaction
    const dogeKeys = this.getDogeKeys(this.phrase, fromAddressIndex)
    // Create a Partially Signed Bitcoin Transaction (PSBT) from the raw unsigned transaction
    const psbt = Dogecoin.Psbt.fromBase64(rawUnsignedTx, { maximumFeeRate: 7500000 })
    // Sign all inputs of the transaction with the Dogecoin keys
    psbt.signAllInputs(dogeKeys)
    // Finalize all inputs of the transaction
    psbt.finalizeAllInputs()
    // Extract the signed transaction and format it to hexadecimal
    const txHex = psbt.extractTransaction().toHex()
    // Broadcast the signed transaction to the Dogecoin network and return the transaction hash
    return await this.roundRobinBroadcastTx(txHex)
  }
}
export { ClientKeystore }
