import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import * as dashcore from '@dashevo/dashcore-lib'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams } from '@xchainjs/xchain-utxo'
import { HDKey } from '@scure/bip32'
import * as Dash from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client } from './client'
import * as nodeApi from './node-api'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
export class ClientKeystore extends Client {
  /**
   * Get the DASH address corresponding to the given index.
   * @deprecated This function will be removed eventually. Use getAddressAsync instead.
   * @param {number} index The index of the address.
   * @returns {Address} The DASH address.
   * @throws {"index must be greater than zero"} Thrown if index is less than zero.
   * @throws {"Phrase must be provided"} Thrown if phrase is not provided.
   * @throws {"Address not defined"} Thrown if address is not defined.
   */
  public getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (!this.phrase) {
      throw new Error('Phrase must be provided')
    }

    const dashNetwork = Utils.dashNetwork(this.network)
    const dashKeys = this.getDashKeys(this.phrase, index)

    const { address } = Dash.payments.p2pkh({
      pubkey: dashKeys.publicKey,
      network: dashNetwork,
    })

    if (!address) {
      throw new Error('Address not defined')
    }

    return address
  }

  /**
   * Asynchronously get the DASH address corresponding to the given index.
   * @param {number} index The index of the address.
   * @returns {Promise<string>} A promise resolving to the DASH address.
   */
  public async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Get the private and public keys for DASH.
   * @param {string} phrase The phrase used to derive keys.
   * @param {number} index The index for key derivation.
   * @returns {Dash.ECPairInterface} The DASH ECPairInterface object.
   * @throws {"Could not get private key from phrase"} Thrown if private key cannot be obtained from the phrase.
   */
  public getDashKeys(phrase: string, index = 0): ECPairInterface {
    const dashNetwork = Utils.dashNetwork(this.network)

    const seed = getSeed(phrase)
    const master = HDKey.fromMasterSeed(Uint8Array.from(seed), dashNetwork.bip32).derive(
      this.getFullDerivationPath(index),
    )

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey), { network: dashNetwork })
  }

  /**
   * Asynchronously transfers assets between addresses.
   * @param {TxParams & { feeRate?: FeeRate }} params - Parameters for the transfer.
   * @returns {Promise<TxHash>} A promise resolving to the transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Average]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const { rawUnsignedTx, utxos } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    const tx: Transaction = new dashcore.Transaction(rawUnsignedTx)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.inputs.forEach((input: any, index: number) => {
      const insightUtxo = utxos.find((utxo) => {
        return utxo.hash === input.prevTxId.toString('hex') && utxo.index == input.outputIndex
      })
      if (!insightUtxo) {
        throw new Error('Unable to match accumulative inputs with insight utxos')
      }
      const scriptBuffer: Buffer = Buffer.from(insightUtxo.scriptPubKey || '', 'hex')
      const script = new dashcore.Script(scriptBuffer)
      tx.inputs[index] = new dashcore.Transaction.Input.PublicKeyHash({
        prevTxId: Buffer.from(insightUtxo.hash, 'hex'),
        outputIndex: insightUtxo.index,
        script: '',
        output: new dashcore.Transaction.Output({
          satoshis: insightUtxo.value,
          script,
        }),
      })
    })

    const dashKeys = this.getDashKeys(this.phrase, fromAddressIndex)

    tx.sign(`${dashKeys.privateKey?.toString('hex')}`)

    const txHex = tx.checkedSerialize({})
    return await nodeApi.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })
  }
}
