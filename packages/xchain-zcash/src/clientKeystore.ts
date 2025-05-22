import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { buildTx, signAndFinalize, skToAddr } from '@mayaprotocol/zcash-js'
import { Network, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoClientParams } from '@xchainjs/xchain-utxo'
import { BIP32Factory } from 'bip32'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client, defaultZECParams } from './client'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
/**
 * Custom Bitcoin client extended to support keystore functionality
 */
class ClientKeystore extends Client {
  constructor(
    params: UtxoClientParams = {
      ...defaultZECParams,
    },
  ) {
    super(params)
  }
  /**
   * @deprecated This function eventually will be removed. Use getAddressAsync instead.
   * Get the address associated with the given index.
   * @param {number} index The index of the address.
   * @returns {Address} The Bitcoin address.
   * @throws {"index must be greater than zero"} Thrown if the index is less than zero.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  getAddress(index = 0): Address {
    // Check if the index is valid
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }

    // Check if the phrase has been set
    if (this.phrase) {
      const zecKeys = this.getZecKeys(this.phrase, index)
      if (!zecKeys.privateKey) {
        throw Error('Error getting private key')
      }
      const prefix = Utils.zecNetworkPrefix(this.network)
      const bufferPrefix = Buffer.from(prefix)
      return skToAddr(zecKeys.privateKey, bufferPrefix)
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
   * Get the keys derived from the given phrase.
   *
   * @param {string} phrase The phrase to be used for generating the keys.
   * @param {number} index The index of the address.
   * @returns {Bitcoin.ECPair.ECPairInterface} The Bitcoin key pair.
   * @throws {"Could not get private key from phrase"} Thrown if failed to create BTC keys from the given phrase.
   */
  private getZecKeys(phrase: string, index = 0): ECPairInterface {
    const seed = getSeed(phrase)

    const bip32 = BIP32Factory(ecc)
    const master = bip32.fromSeed(seed).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey)) // Be carefull missing zcash network due to this error: https://github.com/iancoleman/bip39/issues/94
  }

  /**
   * Transfer ZEC.
   *
   * @param {TxParams&FeeRate} params The transfer options including the fee rate.
   * @returns {Promise<TxHash|string>} A promise that resolves to the transaction hash or an error message.
   * @throws {"memo too long"} Thrown if the memo is longer than 80 characters.
   */
  async transfer(params: TxParams): Promise<TxHash> {
    // Get the address index from the parameters or use the default value
    const fromAddressIndex = params?.walletIndex || 0

    const zecKeys = this.getZecKeys(this.phrase, fromAddressIndex)
    const sender = await this.getAddressAsync(fromAddressIndex)

    const utxos = await this.scanUTXOs(sender, true)
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')

    const zcashUtxos = utxos.map((utxo) => ({
      address: sender,
      txid: utxo.hash,
      outputIndex: utxo.index,
      satoshis: utxo.value,
    }))

    const tx = await buildTx(
      0,
      sender,
      params.recipient,
      params.amount.amount().toNumber(),
      zcashUtxos,
      this.network === Network.Testnet ? false : true,
      params.memo,
    )

    checkFeeBounds(this.feeBounds, tx.fee)

    if (!zecKeys.privateKey) {
      throw Error('Error getting private key')
    }

    const signedBuffer = await signAndFinalize(0, (zecKeys.privateKey as Buffer).toString('hex'), tx.inputs, tx.outputs)

    const txId = await this.roundRobinBroadcastTx(signedBuffer.toString('hex'))

    return txId
  }
}

export { ClientKeystore }
