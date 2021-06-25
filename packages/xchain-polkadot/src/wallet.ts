import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { Address, TxHash, TxParams, Wallet as BaseWallet, WalletFactory } from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { baseAmount } from '@xchainjs/xchain-util'

import { Client } from './client'
import { AssetDOT } from './types'
import { getDecimal } from './util'

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

  protected async getKeyringPair(index: number): Promise<KeyringPair> {
    const key = new Keyring({ ss58Format: this.client.params.ss58Format, type: 'ed25519' })
    return key.createFromUri(`${this.phrase}//${this.client.getFullDerivationPath(index)}`)
  }

  async getAddress(index: number): Promise<Address> {
    return (await this.getKeyringPair(index)).address
  }

  async transfer(index: number, params: TxParams): Promise<TxHash> {
    const keyringPair = await this.getKeyringPair(index)
    const address = await this.getAddress(index)

    const api = await this.client.getAPI()
    let transaction = null
    // Createing a transfer
    const transfer = api.tx.balances.transfer(params.recipient, params.amount.amount().toString())
    if (!params.memo) {
      // Send a simple transfer
      transaction = transfer
    } else {
      // Send a `utility.batch` with two Calls: i) Balance.Transfer ii) System.Remark

      // Creating a remark
      const remark = api.tx.system.remark(params.memo)

      // Send the Batch Transaction
      transaction = api.tx.utility.batch([transfer, remark])
    }

    // Check balances
    const paymentInfo = await transaction.paymentInfo(address)
    const fee = baseAmount(paymentInfo.partialFee.toString(), getDecimal(this.client.params.network))
    const balances = await this.client.getBalance(address, [AssetDOT])

    if (!balances || params.amount.amount().plus(fee.amount()).isGreaterThan(balances[0].amount.amount())) {
      throw new Error('insufficient balance')
    }

    const txHash = await transaction.signAndSend(keyringPair)
    await api.disconnect()

    return txHash.toString()
  }
}
