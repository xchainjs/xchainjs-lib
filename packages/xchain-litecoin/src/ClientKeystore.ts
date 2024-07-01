import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams } from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'

import { Client } from './client'
import * as Utils from './utils'

export class ClientKeystore extends Client {
  /**
   * [DEPRECATED] Retrieves the address at the specified index.
   *
   * @deprecated Use `getAddressAsync` instead.
   * @param {number} index The index of the address.
   * @returns {Address} The address at the specified index.
   * @throws {Error} Thrown when the index is less than zero.
   * @throws {Error} Thrown when the phrase has not been set.
   * @throws {Error} Thrown when the address cannot be defined.
   */
  public getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const ltcNetwork = Utils.ltcNetwork(this.network)
      const ltcKeys = this.getLtcKeys(this.phrase, index)

      const { address } = Litecoin.payments.p2wpkh({
        pubkey: ltcKeys.publicKey,
        network: ltcNetwork,
      })
      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
  }

  /**
   * Retrieves the current address asynchronously.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   *
   * @returns {Address} A promise that resolves to the current address
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  public async getAddressAsync(walletIndex = 0): Promise<Address> {
    return this.getAddress(walletIndex)
  }

  /**
   * Transfers Litecoin (LTC) from one address to another.
   *
   * @param {TxParams & { feeRate?: FeeRate }} params The transfer options.
   * @returns {Promise<TxHash>} A promise that resolves to the transaction hash.
   */
  public async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const { rawUnsignedTx } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    const psbt = Litecoin.Psbt.fromBase64(rawUnsignedTx)
    const ltcKeys = this.getLtcKeys(this.phrase, fromAddressIndex)

    psbt.signAllInputs(ltcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs

    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })
  }

  /**
   * @private
   * [PRIVATE] Retrieves the private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase used to generate the private key.
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating LTC keys from the given phrase
   * */
  private getLtcKeys(phrase: string, index = 0): Litecoin.ECPairInterface {
    const ltcNetwork = Utils.ltcNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Litecoin.bip32.fromSeed(seed, ltcNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Litecoin.ECPair.fromPrivateKey(master.privateKey, { network: ltcNetwork })
  }
}
