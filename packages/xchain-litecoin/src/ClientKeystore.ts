import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import { HDKey } from '@scure/bip32'
import * as Litecoin from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client } from './client'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)

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
   * @param {Object} params The transfer options.
   * @returns {Promise<TxHash>} The transaction hash.
   */
  public async transfer(
    params: TxParams & {
      feeRate?: FeeRate
      utxoSelectionPreferences?: UtxoSelectionPreferences
    },
  ): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)
    const ltcKeys = this.getLtcKeys(this.phrase, fromAddressIndex)

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

    const psbt = Litecoin.Psbt.fromBase64(rawUnsignedTx)
    psbt.signAllInputs(ltcKeys)
    psbt.finalizeAllInputs()
    const txHex = psbt.extractTransaction().toHex()

    return await Utils.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })
  }

  /**
   * Transfer the maximum amount of Litecoin (sweep).
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
  public async transferMax(params: {
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

    const ltcKeys = this.getLtcKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(ltcKeys)
    psbt.finalizeAllInputs()

    const txHex = psbt.extractTransaction().toHex()
    const hash = await Utils.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })

    return { hash, maxAmount, fee }
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
  private getLtcKeys(phrase: string, index = 0): ECPairInterface {
    const ltcNetwork = Utils.ltcNetwork(this.network)

    const seed = getSeed(phrase)
    const master = HDKey.fromMasterSeed(Uint8Array.from(seed), ltcNetwork.bip32).derive(
      this.getFullDerivationPath(index),
    )

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey), { network: ltcNetwork })
  }
}
