import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoClientParams } from '@xchainjs/xchain-utxo'
import { BIP32Factory } from 'bip32'
import * as Bitcoin from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import * as ecc from 'tiny-secp256k1'

import { Client, defaultBTCParams } from './client' // Importing the base Bitcoin client
import * as Utils from './utils' // Importing utility functions

const ECPair = ECPairFactory(ecc)
/**
 * Custom Bitcoin client extended to support keystore functionality
 */
class ClientKeystore extends Client {
  constructor(params: UtxoClientParams & { useTapRoot?: boolean } = { ...defaultBTCParams, useTapRoot: false }) {
    super(params)
  }
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
      const btcNetwork = Utils.btcNetwork(this.network)
      const btcKeys = this.getBtcKeys(this.phrase, index)

      // Generate the address using the Bitcoinjs library

      let address: string | undefined
      if (!this.useTapRoot) {
        address = Bitcoin.payments.p2wpkh({
          pubkey: btcKeys.publicKey,
          network: btcNetwork,
        }).address
      } else {
        address = Bitcoin.payments.p2tr({
          pubkey: Utils.toXOnly(btcKeys.publicKey),
          network: btcNetwork,
        }).address
      }

      // Throw an error if the address is not defined
      if (!address) {
        throw new Error('Address not defined')
      }

      return address
    }

    throw new Error('Phrase must be provided')
  }

  /**
   * Get the current address asynchronously.
   * @param {number} index The index of the address.
   * @returns {Promise<Address>} A promise that resolves to the Bitcoin address.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * @private
   * Get the Bitcoin keys derived from the given phrase.
   *
   * @param {string} phrase The phrase to be used for generating the keys.
   * @param {number} index The index of the address.
   * @returns {Bitcoin.ECPair.ECPairInterface} The Bitcoin key pair.
   * @throws {"Could not get private key from phrase"} Thrown if failed to create BTC keys from the given phrase.
   */
  private getBtcKeys(phrase: string, index = 0): ECPairInterface {
    const btcNetwork = Utils.btcNetwork(this.network)
    const seed = getSeed(phrase)
    const bip32 = BIP32Factory(ecc)
    const master = bip32.fromSeed(seed, btcNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(master.privateKey, { network: btcNetwork })
  }

  /**
   * Transfer BTC.
   *
   * @param {TxParams&FeeRate} params The transfer options including the fee rate.
   * @returns {Promise<TxHash|string>} A promise that resolves to the transaction hash or an error message.
   * @throws {"memo too long"} Thrown if the memo is longer than 80 characters.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // Set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]

    // Check if the fee rate is within the fee bounds
    checkFeeBounds(this.feeBounds, feeRate)

    // Get the address index from the parameters or use the default value
    const fromAddressIndex = params?.walletIndex || 0

    // Get the Bitcoin keys
    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)

    // Prepare the transaction
    const { rawUnsignedTx } = await this.prepareTx({
      ...params,
      sender: this.getAddress(fromAddressIndex),
      feeRate,
    })

    // Build the PSBT
    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)

    // Sign all inputs
    psbt.signAllInputs(btcKeys)

    // Finalize inputs
    psbt.finalizeAllInputs()

    // Extract the transaction hex
    const txHex = psbt.extractTransaction().toHex()

    // Extract the transaction hash
    const txHash = psbt.extractTransaction().getId()

    try {
      // Broadcast the transaction and return the transaction hash
      const txId = await this.roundRobinBroadcastTx(txHex)
      return txId
    } catch (err) {
      // If broadcasting fails, return an error message with a link to the explorer
      const error = `Server error, please check explorer for tx confirmation ${this.explorerProviders[
        this.network
      ].getExplorerTxUrl(txHash)}`
      return error
    }
  }
}

export { ClientKeystore }
