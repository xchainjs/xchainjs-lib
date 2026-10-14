import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import { HDKey } from '@scure/bip32'

import { Client } from './client'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
class ClientKeystore extends Client {
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const dogeNetwork = Utils.dogeNetwork(this.network)
      const dogeKeys = this.getDogeKeys(this.phrase, index)
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

  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  async transfer(
    params: TxParams & {
      feeRate?: FeeRate
      utxoSelectionPreferences?: UtxoSelectionPreferences
      selectedUtxos?: UTXO[]
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
      selectedUtxos: params.selectedUtxos,
    })

    const psbt = Dogecoin.Psbt.fromBase64(rawUnsignedTx, { maximumFeeRate: 7500000 })
    psbt.signAllInputs(dogeKeys)
    psbt.finalizeAllInputs()
    const txHex = psbt.extractTransaction().toHex()

    return await this.roundRobinBroadcastTx(txHex)
  }

  async transferMax(params: {
    recipient: Address
    memo?: string
    feeRate?: FeeRate
    walletIndex?: number
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
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
      selectedUtxos: params.selectedUtxos,
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
