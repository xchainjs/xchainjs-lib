import { Address } from '@xchainjs/xchain-util'

import { KeystoreSigner } from '../signers'
import { IKeystoreSigner } from '../types'

import { Client, EVMClientParams } from './client'

export type EVMKeystoreClientParams = EVMClientParams & { signer: IKeystoreSigner }

export class ClientKeystore extends Client {
  protected signer?: IKeystoreSigner

  constructor(params: EVMClientParams & { signer?: IKeystoreSigner }) {
    super(params)
    this.signer = params.signer
  }

  public setPhrase(phrase: string, walletIndex = 0): Address {
    // Derive the requested account before installing the signer. super.setPhrase
    // calls getAddress, and a bad index must leave the current account in place.
    const signer = new KeystoreSigner({
      phrase,
      provider: this.getProvider(),
      derivationPath: this.rootDerivationPaths ? this.rootDerivationPaths[this.network] : '', // TODO: Avoid this empty derivation path
    })
    signer.getAddress(walletIndex)
    this.signer = signer
    return super.setPhrase(phrase, walletIndex)
  }

  /**
   * @deprecated Use getAddressAsync instead. This function will eventually be removed.
   */
  public getAddress(walletIndex?: number): string {
    return this.getSigner().getAddress(walletIndex)
  }

  protected getSigner(): IKeystoreSigner {
    if (!this.signer) throw new Error('Can not get signer')
    return this.signer
  }
}
