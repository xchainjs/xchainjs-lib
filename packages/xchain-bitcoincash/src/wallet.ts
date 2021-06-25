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
import * as bitcash from '@psf/bitcoincashjs-lib'

import * as utils from './utils'
import { Client } from './client'
import { broadcastTx } from './node-api'
import { KeyPair } from './types/bitcoincashjs-types'

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

  protected async getBCHKeys(index: number): Promise<KeyPair> {
    const derivationPath = this.client.getFullDerivationPath(index)
    const rootSeed = getSeed(this.phrase)
    const masterHDNode = bitcash.HDNode.fromSeedBuffer(rootSeed, utils.bchNetwork(this.client.params.network))

    return masterHDNode.derivePath(derivationPath).keyPair
  }

  async getAddress(index: number): Promise<Address> {
    const keyPair = await this.getBCHKeys(index)
    const address = keyPair.getAddress(index)
    return utils.stripPrefix(utils.toCashAddress(address))
  }

  async transfer(index: number, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const keyPair = await this.getBCHKeys(index)

    const feeRate = params.feeRate ?? (await this.client.getFeeRates())[FeeOption.Fast]
    const { builder, utxos } = await utils.buildTx({
      ...params,
      feeRate,
      sender: await this.getAddress(index),
      haskoinUrl: this.client.params.haskoinUrl,
      network: this.client.params.network,
    })

    utxos.forEach((utxo, index) => {
      builder.sign(index, keyPair, undefined, 0x41, utxo.witnessUtxo.value)
    })

    const tx = builder.build()
    const txHex = tx.toHex()

    return await broadcastTx({
      network: this.client.params.network,
      txHex,
      nodeUrl: this.client.params.nodeUrl,
      auth: this.client.params.nodeAuth,
    })
  }
}
