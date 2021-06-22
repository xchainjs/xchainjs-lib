import { Address, FeeOption, TxHash, TxParams, Wallet as BaseWallet, WalletFactory } from '@xchainjs/xchain-client'
import { validatePhrase, getSeed } from '@xchainjs/xchain-crypto'
import * as Bitcoin from 'bitcoinjs-lib'
import * as Utils from './utils'

import { Client } from './client'
import { FeeRate } from './types/client-types'

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

  protected async getBtcKeys(index: number): Promise<Bitcoin.ECPairInterface> {
    const btcNetwork = Utils.btcNetwork(this.client.params.network)

    const seed = getSeed(this.phrase)
    const master = Bitcoin.bip32.fromSeed(seed, btcNetwork).derivePath(this.client.params.getFullDerivationPath(index))
    if (!master.privateKey) throw new Error('Could not get private key from phrase')
    return Bitcoin.ECPair.fromPrivateKey(master.privateKey, { network: btcNetwork })
  }

  async getAddress(index = 0): Promise<Address> {
    const btcKeys = await this.getBtcKeys(index)

    const { address } = Bitcoin.payments.p2wpkh({
      pubkey: btcKeys.publicKey,
      network: Utils.btcNetwork(this.client.params.network),
    })

    // Despite the exported typings on Payment, this can never actually be undefined.
    if (address === undefined) throw new Error('could not get address')
    return address
  }

  async transfer(index: number, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // set the default fee rate to `fast`
    const feeRate = params.feeRate ?? (await this.client.getFeeRates())[FeeOption.Fast]

    /**
     * do not spend pending UTXOs when adding a memo
     * https://github.com/xchainjs/xchainjs-lib/issues/330
     */
    const spendPendingUTXO: boolean = params.memo ? false : true

    const { psbt } = await Utils.buildTx({
      ...params,
      feeRate,
      sender: await this.getAddress(index),
      sochainUrl: this.client.params.sochainUrl,
      network: this.client.params.network,
      spendPendingUTXO,
    })

    const btcKeys = await this.getBtcKeys(index)
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({
      network: this.client.params.network,
      txHex,
      blockstreamUrl: this.client.params.blockstreamUrl,
    })
  }
}
