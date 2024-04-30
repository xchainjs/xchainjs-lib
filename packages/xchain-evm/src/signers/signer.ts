import { Provider } from '@ethersproject/abstract-provider'

import { ISigner, SignApproveParams, SignTransferParams } from '../types'

export type SignerParams = {
  provider: Provider
  derivationPath: string
}

export abstract class Signer implements ISigner {
  protected provider: Provider
  protected derivationPath: string

  constructor({ provider, derivationPath }: SignerParams) {
    this.provider = provider
    this.derivationPath = derivationPath
  }

  public getFullDerivationPath(walletIndex: number): string {
    return `${this.derivationPath}${walletIndex}`
  }

  protected getProvider(): Provider {
    return this.provider
  }

  abstract purge(): void
  abstract signTransfer(params: SignTransferParams): Promise<string>
  abstract signApprove(params: SignApproveParams): Promise<string>
  abstract getAddressAsync(walletIndex?: number | undefined): Promise<string>
}
