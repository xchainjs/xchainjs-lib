import * as bip32 from 'bip32'
import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'
import {
  Address,
  MultiSendParams,
  MultiSendWallet,
  Network,
  TxHash,
  TxParams,
  WalletFactory,
} from '@xchainjs/xchain-client'
import { validatePhrase, getSeed } from '@xchainjs/xchain-crypto'
import { AssetBNB, baseToAsset } from '@xchainjs/xchain-util'

import { Client } from './client'

export class Wallet implements MultiSendWallet {
  private readonly client: Client
  private readonly phrase: string

  protected constructor(client: Client, phrase: string) {
    this.client = client
    this.phrase = phrase
  }

  static async create(phrase: string): Promise<WalletFactory<Client>> {
    if (!validatePhrase(phrase)) throw new Error('Invalid phrase')
    return async (client: Client) => new this(client, phrase)
  }

  protected async getPrivateKey(index: number): Promise<string> {
    const seed = getSeed(this.phrase)
    const path = this.client.getFullDerivationPath(index)
    const node = bip32.fromSeed(seed).derivePath(path)
    if (node.privateKey === undefined) throw new Error('child does not have a privateKey')
    return node.privateKey.toString('hex')
  }

  async getAddress(index: number): Promise<Address> {
    const privateKey = await this.getPrivateKey(index)
    const prefix = this.client.params.network === Network.Testnet ? 'tbnb' : 'bnb'
    return crypto.getAddressFromPrivateKey(privateKey, prefix)
  }

  async transfer(index: number, { asset, amount, recipient, memo }: TxParams): Promise<TxHash> {
    const privateKey = await this.getPrivateKey(index)
    const bncClient = await this.client.bncClient.setPrivateKey(privateKey)

    const transferResult = await bncClient.transfer(
      await this.getAddress(index),
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo,
    )

    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  }

  async multiSend(index: number, { transactions, memo = '' }: MultiSendParams): Promise<TxHash> {
    const privateKey = await this.getPrivateKey(index)
    const bncClient = await this.client.bncClient.setPrivateKey(privateKey)

    const transferResult = await this.client.bncClient.multiSend(
      bncClient.getClientKeyAddress(),
      transactions.map((transaction) => {
        return {
          to: transaction.to,
          coins: transaction.coins.map((coin) => {
            return {
              denom: coin.asset.symbol,
              amount: baseToAsset(coin.amount).amount().toString(),
            }
          }),
        }
      }),
      memo,
    )

    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  }
}
