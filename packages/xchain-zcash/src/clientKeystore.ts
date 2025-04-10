import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as utxolib from '@bitgo/utxo-lib'
import { createHash } from 'crypto'
import * as bs58check from 'bs58check'
import { BIP32Factory } from 'bip32'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'

import { Client, defaultZECParams } from './client' // Importing the base Bitcoin client
import * as Utils from './utils'

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
   * @throws {"Address not defined"} Thrown if failed to create the address from the phrase.
   */
  getAddress(index = 0): Address {
    // Check if the index is valid
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }

    // Check if the phrase has been set
    if (this.phrase) {
      // const zecNetwork = Utils.zecNetwork(this.network)
      const zecKeys = this.getZecKeys(this.phrase, index)

      // let address: string | undefined
      // address = utxolib.payments.p2wpkh({
      //   pubkey: zecKeys.publicKey,
      //   network: zecNetwork,
      // }).address
      // // Throw an error if the address is not defined
      // if (!address) {
      //   throw new Error('Address not defined')
      // }

      // return address

      // const keyPair = utxolib.ECPair.fromPrivateKey(node.privateKey)

      const sha256 = createHash('sha256').update(zecKeys.publicKey).digest()
      const ripemd160 = createHash('ripemd160').update(sha256).digest()
      const prefix = Buffer.from([0x1c, 0xb8]) // ZEC P2PKH
      const payload = Buffer.concat([prefix, ripemd160])

      return bs58check.default.encode(payload)
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
  private getZecKeys(phrase: string, index = 0): utxolib.ECPairInterface {
    // const zecNetwork = Utils.zecNetwork(this.network)
    const seed = getSeed(phrase)

    const bip32 = BIP32Factory(ecc)
    const master = bip32.fromSeed(seed).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return utxolib.ECPair.fromPrivateKey(Buffer.from(master.privateKey)) // Be carefull missing zcash network due to this error: https://github.com/iancoleman/bip39/issues/94 
  }

  /**
   * Transfer ZEC.
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
    const zecKeys = this.getZecKeys(this.phrase, fromAddressIndex)
    const sender = await this.getAddressAsync(fromAddressIndex)
    // zecKeys.network = Utils.zecNetwork(this.network)

    // Prepare the transaction
    const { rawUnsignedTx, inputs } = await this.prepareTx({
      ...params,
      sender,
      feeRate,
    })

    // Build the PSBT
    const buffer = Buffer.from(rawUnsignedTx, 'hex')
    const unsignedTx = utxolib.bitgo.ZcashTransaction.fromBuffer(buffer, false, 'number', Utils.zecNetwork(this.network))
    const txb = utxolib.bitgo.ZcashTransactionBuilder.fromTransaction(unsignedTx, Utils.zecNetwork(this.network))

    // Sign all inputs
    for (let i = 0; i < inputs.length; i++) {
      // txb.tx.ins[i] = { ...txb.tx.ins[i], value: inputs[i].value } as any
      txb.sign(
        inputs[i].index,
        zecKeys,
        undefined,
        utxolib.Transaction.SIGHASH_ALL,
        inputs[i].value,
        // value: inputs[i].value
      )
    }

    // Extract the transaction hex
    const txBuilded = txb.build()
    const txHex = txBuilded.toHex()
    // Extract the transaction hash
    // const txHash = psbt.extractTransaction().getId()

    const txId = await this.roundRobinBroadcastTx(txHex)
    return txId
  }
}

export { ClientKeystore }
