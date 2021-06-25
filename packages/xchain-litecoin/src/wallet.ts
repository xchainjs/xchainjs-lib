import {
  Address,
  FeeOption,
  FeeRate,
  TxHash,
  TxParams,
  Wallet as BaseWallet,
  WalletFactory,
} from '@xchainjs/xchain-client'
import { validatePhrase, getSeed } from '@xchainjs/xchain-crypto'
import * as Litecoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib

import * as Utils from './utils'
import { Client } from './client'

export class Wallet implements BaseWallet {
  protected readonly client: Client
  protected readonly phrase: string

  protected constructor(client: Client, phrase: string) {
    this.client = client
    this.phrase = phrase
  }

  static async create(phrase: string): Promise<WalletFactory<Client>> {
    if (!validatePhrase(phrase)) throw new Error('Invalid phrase')
    return async (client: Client) => new this(client, phrase)
  }

  protected async getLtcKeys(index: number): Promise<Litecoin.ECPairInterface> {
    const ltcNetwork = Utils.ltcNetwork(this.client.params.network)

    const seed = getSeed(this.phrase)
    const master = Litecoin.bip32.fromSeed(seed, ltcNetwork).derivePath(this.client.getFullDerivationPath(index))

    if (!master.privateKey) throw new Error('Could not get private key from phrase')

    return Litecoin.ECPair.fromPrivateKey(master.privateKey, { network: ltcNetwork })
  }

  async getAddress(index: number): Promise<Address> {
    const ltcKeys = await this.getLtcKeys(index)
    const ltcNetwork = Utils.ltcNetwork(this.client.params.network)

    const { address } = Litecoin.payments.p2wpkh({
      pubkey: ltcKeys.publicKey,
      network: ltcNetwork,
    })

    if (!address) throw new Error('Address not defined')
    return address
  }

  async transfer(index: number, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const ltcKeys = await this.getLtcKeys(index)
    const feeRate = params.feeRate ?? (await this.client.getFeeRates())[FeeOption.Fast]
    const { psbt } = await Utils.buildTx({
      ...params,
      feeRate,
      sender: await this.getAddress(index),
      sochainUrl: this.client.params.sochainUrl,
      network: this.client.params.network,
    })
    psbt.signAllInputs(ltcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({
      network: this.client.params.network,
      txHex,
      nodeUrl: this.client.params.nodeUrl,
      auth: this.client.params.nodeAuth,
    })
  }
}
