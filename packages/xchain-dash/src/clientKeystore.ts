import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import dashcore from '@dashevo/dashcore-lib'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import { HDKey } from '@scure/bip32'
import * as Dash from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client } from './client'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
export class ClientKeystore extends Client {
  /**
   * @deprecated This function will be removed eventually. Use getAddressAsync instead.
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

  public async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

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

  async transfer(
    params: TxParams & {
      feeRate?: FeeRate
      utxoSelectionPreferences?: UtxoSelectionPreferences
      selectedUtxos?: UTXO[]
    },
  ): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Average]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0

    const mergedPreferences: UtxoSelectionPreferences = {
      minimizeFee: true,
      avoidDust: true,
      minimizeInputs: false,
      ...params.utxoSelectionPreferences,
    }

    const { rawUnsignedTx, utxos } = await this.prepareTxEnhanced({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
      utxoSelectionPreferences: mergedPreferences,
      selectedUtxos: params.selectedUtxos,
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
      // Providers may populate either scriptPubKey (Insight) or witnessUtxo.script (Blockcypher)
      const scriptHex = insightUtxo.scriptPubKey || insightUtxo.witnessUtxo?.script.toString('hex') || ''
      const scriptBuffer: Buffer = Buffer.from(scriptHex, 'hex')
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

    const txHex = tx.checkedSerialize({ disableLargeFees: true })
    return await this.broadcastTx(txHex)
  }

  async transferMax(params: {
    recipient: Address
    memo?: string
    feeRate?: FeeRate
    walletIndex?: number
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
  }): Promise<{ hash: TxHash; maxAmount: number; fee: number }> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Average]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)

    const { rawUnsignedTx, utxos, maxAmount, fee } = await this.prepareMaxTx({
      sender,
      recipient: params.recipient,
      memo: params.memo,
      feeRate,
      utxoSelectionPreferences: params.utxoSelectionPreferences,
      selectedUtxos: params.selectedUtxos,
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
      // Providers may populate either scriptPubKey (Insight) or witnessUtxo.script (Blockcypher)
      const scriptHex = insightUtxo.scriptPubKey || insightUtxo.witnessUtxo?.script.toString('hex') || ''
      const scriptBuffer: Buffer = Buffer.from(scriptHex, 'hex')
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

    const txHex = tx.checkedSerialize({ disableLargeFees: true })
    const hash = await this.broadcastTx(txHex)

    return { hash, maxAmount, fee }
  }
}
