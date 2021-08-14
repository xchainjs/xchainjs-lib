import { Address, Wallet as BaseWallet, WalletFactory, WalletParams } from '@xchainjs/xchain-client'
import { getSeed, validatePhrase } from '@xchainjs/xchain-crypto'
import * as Litecoin from 'bitcoinjs-lib'

import * as Utils from './utils'

export interface Wallet extends BaseWallet {
  getLtcKeys(index: number): Promise<Litecoin.SignerAsync>
}

function asyncifySigner<T extends Litecoin.Signer>(ecPair: T) {
  const signAsync = async (hash: Buffer, lowR?: boolean) => {
    return ecPair.sign(hash, lowR)
  }
  return (new Proxy(ecPair, {
    get(target, p, receiver) {
      if (p === 'sign') return signAsync
      return Reflect.get(target, p, receiver)
    },
  }) as unknown) as Omit<T, 'sign'> & { sign: typeof signAsync }
}

class DefaultWallet implements Wallet {
  protected readonly params: WalletParams
  protected readonly phrase: string

  protected constructor(params: WalletParams, phrase: string) {
    this.params = params
    this.phrase = phrase
  }

  static create(phrase: string): WalletFactory<DefaultWallet> {
    return async (params: WalletParams) => {
      if (!validatePhrase(phrase)) throw new Error('Invalid phrase')
      return new this(params, phrase)
    }
  }

  async getAddress(index: number): Promise<Address> {
    const ltcKeys = await this.getLtcKeys(index)
    const ltcNetwork = Utils.ltcNetwork(this.params.network)

    const { address } = Litecoin.payments.p2wpkh({
      pubkey: ltcKeys.publicKey,
      network: ltcNetwork,
    })

    if (!address) throw new Error('Address not defined')
    return address
  }

  async getLtcKeys(index: number): Promise<Litecoin.SignerAsync> {
    const ltcNetwork = Utils.ltcNetwork(this.params.network)

    const seed = getSeed(this.phrase)
    const master = Litecoin.bip32.fromSeed(seed, ltcNetwork).derivePath(this.params.getFullDerivationPath(index))

    if (!master.privateKey) throw new Error('Could not get private key from phrase')

    return asyncifySigner(Litecoin.ECPair.fromPrivateKey(master.privateKey, { network: ltcNetwork }))
  }
}

export const Wallet = DefaultWallet
