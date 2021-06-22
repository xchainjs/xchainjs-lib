import { Address, TxHash, TxParams, Wallet as BaseWallet, WalletFactory } from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { PrivKey } from 'cosmos-client'

import { Client } from './client'
import { getDenom } from './util'

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

  protected async getPrivateKey(index: number): Promise<PrivKey> {
    const path = this.client.getFullDerivationPath(index)
    return this.client.sdkClient.getPrivKeyFromMnemonic(this.phrase, path)
  }

  async getAddress(index: number): Promise<Address> {
    const privateKey = await this.getPrivateKey(index)
    return this.client.sdkClient.getAddressFromPrivKey(privateKey)
  }

  async transfer(index: number, params: TxParams): Promise<TxHash> {
    const privateKey = await this.getPrivateKey(index)

    const txResult = await this.client.sdkClient.transfer({
      privkey: privateKey,
      from: this.client.sdkClient.getAddressFromPrivKey(privateKey),
      to: params.recipient,
      amount: params.amount.amount().toString(),
      asset: getDenom(params.asset ?? this.client.params.mainAsset),
      memo: params.memo,
    })
    const out = txResult?.txhash

    if (out === undefined) throw new Error(`unable to complete transaction, result: ${txResult}`)
    return out
  }
}
