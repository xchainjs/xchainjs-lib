import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { buildMaxTx, buildTx, signAndFinalize, skToAddr } from '@xchainjs/zcash-js'
import { Network, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoClientParams, UtxoTransactionValidator } from '@xchainjs/xchain-utxo'
import { HDKey } from '@scure/bip32'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client, defaultZECParams } from './client'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
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
   */
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }

    if (this.phrase) {
      const zecKeys = this.getZecKeys(this.phrase, index)
      if (!zecKeys.privateKey) {
        throw Error('Error getting private key')
      }
      const prefix = Utils.zecNetworkPrefix(this.network)
      const prefixUint8Array = new Uint8Array(prefix)
      return skToAddr(zecKeys.privateKey, prefixUint8Array)
    }

    throw new Error('Phrase must be provided')
  }

  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  private getZecKeys(phrase: string, index = 0): ECPairInterface {
    const seed = getSeed(phrase)

    const master = HDKey.fromMasterSeed(seed).derive(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey)) // Be carefull missing zcash network due to this error: https://github.com/iancoleman/bip39/issues/94
  }

  async transfer(params: TxParams & { selectedUtxos?: UTXO[] }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    const zecKeys = this.getZecKeys(this.phrase, fromAddressIndex)
    const sender = await this.getAddressAsync(fromAddressIndex)

    let utxos: UTXO[]
    if (params.selectedUtxos && params.selectedUtxos.length > 0) {
      UtxoTransactionValidator.validateUtxoSet(params.selectedUtxos)
      utxos = params.selectedUtxos
    } else {
      utxos = await this.scanUTXOs(sender, true)
    }
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

    const consensusBranchId = await this.getConsensusBranchId()
    const signedBuffer = await signAndFinalize(
      0,
      (zecKeys.privateKey as Buffer).toString('hex'),
      tx.inputs,
      tx.outputs,
      consensusBranchId,
    )

    const txId = await this.roundRobinBroadcastTx(signedBuffer.toString('hex'))

    return txId
  }

  async transferMax(params: {
    recipient: Address
    memo?: string
    walletIndex?: number
    selectedUtxos?: UTXO[]
  }): Promise<{ hash: TxHash; maxAmount: number; fee: number }> {
    const fromAddressIndex = params.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)

    const zecKeys = this.getZecKeys(this.phrase, fromAddressIndex)
    if (!zecKeys.privateKey) {
      throw Error('Error getting private key')
    }

    let utxos: UTXO[]
    if (params.selectedUtxos && params.selectedUtxos.length > 0) {
      UtxoTransactionValidator.validateUtxoSet(params.selectedUtxos)
      utxos = params.selectedUtxos
    } else {
      utxos = await this.scanUTXOs(sender, true)
    }
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')

    const zcashUtxos = utxos.map((utxo) => ({
      address: sender,
      txid: utxo.hash,
      outputIndex: utxo.index,
      satoshis: utxo.value,
    }))

    // buildMaxTx creates no change output.
    const tx = await buildMaxTx(0, sender, params.recipient, zcashUtxos, this.network !== Network.Testnet, params.memo)

    checkFeeBounds(this.feeBounds, tx.fee)

    const consensusBranchId = await this.getConsensusBranchId()
    const signedBuffer = await signAndFinalize(
      0,
      (zecKeys.privateKey as Buffer).toString('hex'),
      tx.inputs,
      tx.outputs,
      consensusBranchId,
    )
    const hash = await this.roundRobinBroadcastTx(signedBuffer.toString('hex'))

    return { hash, maxAmount: tx.maxAmount, fee: tx.fee }
  }
}

export { ClientKeystore }
