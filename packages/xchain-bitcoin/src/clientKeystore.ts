import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoClientParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import { HDKey } from '@scure/bip32'
import * as Bitcoin from 'bitcoinjs-lib'
import { ECPairFactory, ECPairInterface } from 'ecpair'

import { Client, defaultBTCParams } from './client'
import { AddressFormat } from './types'
import * as Utils from './utils'

const ECPair = ECPairFactory(ecc)
class ClientKeystore extends Client {
  constructor(
    params: UtxoClientParams & { addressFormat?: AddressFormat } = {
      ...defaultBTCParams,
      addressFormat: AddressFormat.P2WPKH,
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
      const btcNetwork = Utils.btcNetwork(this.network)
      const btcKeys = this.getBtcKeys(this.phrase, index)

      const address = Utils.getPaymentForFormat(this.addressFormat, btcKeys.publicKey, btcNetwork).address

      if (!address) {
        throw new Error('Address not defined')
      }

      return address
    }

    throw new Error('Phrase must be provided')
  }

  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * P2TR inputs are signed with a tweaked key; P2SH-P2WPKH inputs need the redeem
   * script attached before signing; P2WPKH and P2PKH sign with the plain key.
   */
  private signPsbt(psbt: Bitcoin.Psbt, btcKeys: ECPairInterface): void {
    if (this.addressFormat === AddressFormat.P2SH_P2WPKH) {
      const redeemScript = Bitcoin.payments.p2wpkh({
        pubkey: btcKeys.publicKey,
        network: Utils.btcNetwork(this.network),
      }).output
      for (let i = 0; i < psbt.data.inputs.length; i++) {
        psbt.updateInput(i, { redeemScript })
      }
    }

    const signer =
      this.addressFormat === AddressFormat.P2TR
        ? btcKeys.tweak(Bitcoin.crypto.taggedHash('TapTweak', Utils.toXOnly(btcKeys.publicKey)))
        : btcKeys

    psbt.signAllInputs(signer)
    psbt.finalizeAllInputs()
  }

  private getBtcKeys(phrase: string, index = 0): ECPairInterface {
    const btcNetwork = Utils.btcNetwork(this.network)
    const seed = getSeed(phrase)
    const master = HDKey.fromMasterSeed(Uint8Array.from(seed)).derive(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return ECPair.fromPrivateKey(Buffer.from(master.privateKey), { network: btcNetwork })
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

    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)

    const mergedUtxoSelectionPreferences = {
      minimizeFee: true,
      avoidDust: true,
      minimizeInputs: false,
      ...params.utxoSelectionPreferences,
    }

    const { rawUnsignedTx } = await this.prepareTxEnhanced({
      ...params,
      sender: this.getAddress(fromAddressIndex),
      feeRate,
      utxoSelectionPreferences: mergedUtxoSelectionPreferences,
      selectedUtxos: params.selectedUtxos,
    })

    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)

    this.signPsbt(psbt, btcKeys)

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

    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)
    this.signPsbt(psbt, btcKeys)

    const txHex = psbt.extractTransaction().toHex()
    const hash = await this.roundRobinBroadcastTx(txHex)

    return { hash, maxAmount, fee }
  }
}

export { ClientKeystore }
