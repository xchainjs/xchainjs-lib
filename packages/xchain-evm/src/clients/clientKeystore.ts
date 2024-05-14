import { Address } from '@xchainjs/xchain-util/lib'

import { KeystoreSigner } from '../signers'
import { IKeystoreSigner } from '../types'

import { Client, EVMClientParams } from './client'

/**
 * EVM Keystore client params
 */
export type EVMKeystoreClientParams = EVMClientParams & { signer: IKeystoreSigner }

/**
 * Keystore client
 */
export class ClientKeystore extends Client {
  protected signer?: IKeystoreSigner

  constructor(params: EVMClientParams & { signer?: IKeystoreSigner }) {
    super(params)
    this.signer = params.signer
  }

  /**
   * Validates the given Ethereum address.
   * @param {Address} address - The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public setPhrase(phrase: string, walletIndex?: number): Address {
    super.setPhrase(phrase, walletIndex)
    this.signer = new KeystoreSigner({
      phrase,
      provider: this.getProvider(),
      derivationPath: this.rootDerivationPaths ? this.rootDerivationPaths[this.network] : '', // TODO: Avoid this empty derivation path
    })

    return this.signer.getAddress()
  }

  /**
   * @deprecated Use getAddressAsync instead. This function will eventually be removed.
   */
  public getAddress(walletIndex?: number): string {
    return this.getSigner().getAddress(walletIndex)
  }

  /**
   * Get the account signer the client is using
   * @returns {ISigner}
   * @throws {Error} if the client is not using an account
   */
  protected getSigner(): IKeystoreSigner {
    if (!this.signer) throw Error('Can not get signer')
    return this.signer
  }
}
