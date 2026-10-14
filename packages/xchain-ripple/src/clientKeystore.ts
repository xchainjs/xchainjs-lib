import { ECDSA, Wallet as XrplWallet } from 'xrpl'
import type { Payment } from 'xrpl'

import { SignedTransaction, XRPClientParams } from './types'
import { Client, defaultXRPParams } from './client'

export class ClientKeystore extends Client {
  constructor(params: XRPClientParams = defaultXRPParams) {
    const clientParams = { ...defaultXRPParams, ...params }

    super(clientParams)
  }

  public getXrplWallet(walletIndex = 0) {
    if (!this.phrase) throw new Error('Phrase must be provided')

    return XrplWallet.fromMnemonic(this.phrase, {
      derivationPath: this.getFullDerivationPath(walletIndex),
      // xrpl.js 5 defaults fromMnemonic to ed25519. Existing accounts are secp256k1.
      algorithm: ECDSA.secp256k1,
    })
  }

  public getAddress(walletIndex = 0): string {
    const wallet = this.getXrplWallet(walletIndex)
    return wallet.address
  }

  public async getAddressAsync(walletIndex = 0): Promise<string> {
    return this.getAddress(walletIndex)
  }

  public async signTransaction(payment: Payment, walletIndex = 0): Promise<SignedTransaction> {
    const xrplAccount = this.getXrplWallet(walletIndex)
    return xrplAccount.sign(payment)
  }
}
