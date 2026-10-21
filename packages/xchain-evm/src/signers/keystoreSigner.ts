import { TxHash } from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { HDNodeWallet } from 'ethers'
import BigNumber from 'bignumber.js'

import { IKeystoreSigner, SignApproveParams, SignTransferParams } from '../types'

import { Signer, SignerParams } from './signer'

export type KeystoreSignerParams = SignerParams & { phrase: string }

export class KeystoreSigner extends Signer implements IKeystoreSigner {
  private phrase?: string

  constructor(params: KeystoreSignerParams) {
    super(params)
    if (!validatePhrase(params.phrase)) {
      throw new Error('Invalid phrase')
    }
    this.phrase = params.phrase
  }

  public setPhrase(phrase: string, walletIndex = 0): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
    }

    return this.getAddress(walletIndex)
  }

  public purge(): void {
    this.phrase = undefined
  }

  private deriveWallet(walletIndex: number): HDNodeWallet {
    if (!this.phrase) {
      throw new Error('HDNode is not defined. Make sure phrase has been provided.')
    }
    return HDNodeWallet.fromPhrase(this.phrase, undefined, this.getFullDerivationPath(walletIndex))
  }

  /**
   * @deprecated Use getAddressAsync instead. This function will eventually be removed.
   */
  public getAddress(walletIndex = 0): Address {
    if (walletIndex < 0) {
      throw new Error('Index must be greater than or equal to zero')
    }
    return this.deriveWallet(walletIndex).address.toLowerCase()
  }

  public async getAddressAsync(walletIndex = 0): Promise<Address> {
    return this.getAddress(walletIndex)
  }

  public getWallet(walletIndex = 0): HDNodeWallet {
    return this.deriveWallet(walletIndex).connect(this.getProvider()) as HDNodeWallet
  }

  public async signTransfer({ walletIndex, tx }: SignTransferParams): Promise<TxHash> {
    const signer = this.getWallet(walletIndex)
    return signer.signTransaction(tx)
  }

  public async signApprove({ walletIndex, tx }: SignApproveParams): Promise<string> {
    return this.getWallet(walletIndex).signTransaction({
      from: await this.getAddressAsync(walletIndex),
      to: tx.to,
      value: tx.value,
      data: tx.data,
      nonce: tx.nonce ? new BigNumber(tx.nonce).toNumber() : undefined,
      gasPrice: tx.gasPrice,
      gasLimit: tx.gasLimit,
      chainId: tx.chainId,
    })
  }
}
