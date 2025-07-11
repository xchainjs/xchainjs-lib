import { Wallet as XrplWallet } from 'xrpl'
import type { Payment } from 'xrpl'

import { SignedTransaction, XRPClientParams } from './types'
import { Client, defaultXRPParams } from './client'

export class ClientKeystore extends Client {
  constructor(params: XRPClientParams = defaultXRPParams) {
    const clientParams = { ...defaultXRPParams, ...params }

    super(clientParams)
  }

  /**
   * get xrpl wallet by mnemonic phrase and derivation path
   */
  public getXrplWallet(walletIndex = 0) {
    if (!this.phrase) throw new Error('Phrase must be provided')

    return XrplWallet.fromMnemonic(this.phrase, {
      derivationPath: this.getFullDerivationPath(walletIndex),
    })
  }

  /**
   * Get the current address synchronously.
   */
  public getAddress(walletIndex = 0): string {
    const wallet = this.getXrplWallet(walletIndex)
    return wallet.address
  }

  /**
   * Get the current address asynchronously.
   *
   * @param {number} index The index of the address. Default 0
   * @returns {Address} The XRP address related to the index provided.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  public async getAddressAsync(walletIndex = 0): Promise<string> {
    return await this.getAddress(walletIndex)
  }

  /**
   * Return signed tx
   * @param payment prepared xrp payment tx
   * @param walletIndex wallet index
   * @returns Transaction signed by phrase
   */
  public async signTransaction(payment: Payment, walletIndex = 0): Promise<SignedTransaction> {
    const xrplAccount = await this.getXrplWallet(walletIndex)
    return xrplAccount.sign(payment)
  }
}
