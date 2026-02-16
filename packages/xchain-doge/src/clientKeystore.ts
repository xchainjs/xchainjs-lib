import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib' // Importing the base Doge client
import { ECPairFactory, ECPairInterface } from 'ecpair'
import { HDKey } from '@scure/bip32'

import { Client } from './client' // Importing utility functions
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
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
  private getDogeKeys(phrase: string, index = 0): ECPairInterface {
    const dogeNetwork = Utils.dogeNetwork(this.network)

    const seed = getSeed(phrase)
    const master = HDKey.fromMasterSeed(Uint8Array.from(seed), dogeNetwork.bip32).derive(
      this.getFullDerivationPath(index),
    )

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey), { network: dogeNetwork })
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
   *
   * @param {Object} params The transfer parameters.
   * @returns {Promise<TxHash>} The transaction hash.
   */
  async transfer(
    params: TxParams & {
      feeRate?: FeeRate
      utxoSelectionPreferences?: UtxoSelectionPreferences
    },
  ): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params?.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)
    const dogeKeys = this.getDogeKeys(this.phrase, fromAddressIndex)

    const mergedPreferences: UtxoSelectionPreferences = {
      minimizeFee: true,
      avoidDust: true,
      minimizeInputs: false,
      ...params.utxoSelectionPreferences,
    }

    const { rawUnsignedTx } = await this.prepareTxEnhanced({
      ...params,
      feeRate,
      sender,
      utxoSelectionPreferences: mergedPreferences,
    })

    const psbt = Dogecoin.Psbt.fromBase64(rawUnsignedTx, { maximumFeeRate: 7500000 })
    psbt.signAllInputs(dogeKeys)
    psbt.finalizeAllInputs()
    const txHex = psbt.extractTransaction().toHex()

    return await this.roundRobinBroadcastTx(txHex)
  }

  /**
   * Transfer the maximum amount of Dogecoin (sweep).
   *
   * Calculates the maximum sendable amount after fees, signs, and broadcasts the transaction.
   * @param {Object} params The transfer parameters.
   * @param {string} params.recipient The recipient address.
   * @param {string} [params.memo] Optional memo for the transaction.
   * @param {FeeRate} [params.feeRate] Optional fee rate. Defaults to 'fast' rate.
   * @param {number} [params.walletIndex] Optional wallet index. Defaults to 0.
   * @param {UtxoSelectionPreferences} [params.utxoSelectionPreferences] Optional UTXO selection preferences.
   * @returns {Promise<{ hash: TxHash; maxAmount: number; fee: number }>} The transaction hash, amount sent, and fee.
   */
  async transferMax(params: {
    recipient: Address
    memo?: string
    feeRate?: FeeRate
    walletIndex?: number
    utxoSelectionPreferences?: UtxoSelectionPreferences
  }): Promise<{ hash: TxHash; maxAmount: number; fee: number }> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)

    const { psbt, maxAmount, fee } = await this.sendMax({
      sender,
      recipient: params.recipient,
      memo: params.memo,
      feeRate,
      utxoSelectionPreferences: params.utxoSelectionPreferences,
    })

    const dogeKeys = this.getDogeKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(dogeKeys)
    psbt.finalizeAllInputs()

    const txHex = psbt.extractTransaction().toHex()
    const hash = await this.roundRobinBroadcastTx(txHex)

    return { hash, maxAmount, fee }
  }
}
export { ClientKeystore }
