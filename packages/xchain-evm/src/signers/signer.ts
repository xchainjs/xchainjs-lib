import { Provider } from '@ethersproject/abstract-provider'

import { ISigner, SignApproveParams, SignTransferParams } from '../types'

/**
 * Signer parameters
 */
export type SignerParams = {
  provider: Provider
  derivationPath: string
}

/**
 * Abstraction of EVM Account
 */
export abstract class Signer implements ISigner {
  protected provider: Provider
  protected derivationPath: string

  constructor({ provider, derivationPath }: SignerParams) {
    this.provider = provider
    this.derivationPath = derivationPath
  }

  /**
   * Get the full derivation path based on the wallet index.
   * @param {number} walletIndex The HD wallet index
   * @returns {string} The full derivation path
   */
  public getFullDerivationPath(walletIndex: number): string {
    return `${this.derivationPath}${walletIndex}`
  }

  /**
   * Get the provider the signer is using to be connected with the blockchain.
   * @returns {Provider} The provider the signer is using
   */
  protected getProvider(): Provider {
    return this.provider
  }

  abstract purge(): void
  abstract signTransfer(params: SignTransferParams): Promise<string>
  abstract signApprove(params: SignApproveParams): Promise<string>
  abstract getAddressAsync(walletIndex?: number | undefined): Promise<string>
}
