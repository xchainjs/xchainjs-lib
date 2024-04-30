import { Address } from '@xchainjs/xchain-util/lib'

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

  public setPhrase(phrase: string, walletIndex?: number): Address {
    super.setPhrase(phrase, walletIndex)
    this.signer = new KeystoreSigner({
      phrase,
      provider: this.getProvider(),
      derivationPath: this.rootDerivationPaths ? this.rootDerivationPaths[this.network] : '', // TODO: Avoid this empty derivation path
    })

    return this.signer.getAddress()
  }

  public getAddress(walletIndex?: number): string {
    return this.getSigner().getAddress(walletIndex)
  }

  protected getSigner(): IKeystoreSigner {
    if (!this.signer) throw Error('Can not get signer')
    return this.signer
  }
}
