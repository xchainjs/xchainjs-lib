import { Provider } from 'ethers'

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
    if (derivationPath.endsWith('/')) {
      derivationPath = derivationPath.slice(0, -1)
    }
    this.derivationPath = derivationPath
  }

  /**
   * If the path contains `{index}` (Ledger Live `m/44'/60'/{index}'/0/0`), substitute the wallet index there.
   * Otherwise append it, keeping the default `m/44'/60'/0'/0/{index}` behavior.
   */
  public getFullDerivationPath(walletIndex: number): string {
    return this.derivationPath.includes('{index}')
      ? this.derivationPath.replace('{index}', `${walletIndex}`)
      : `${this.derivationPath}/${walletIndex}`
  }

  protected getProvider(): Provider {
    return this.provider
  }

  abstract purge(): void
  abstract signTransfer(params: SignTransferParams): Promise<string>
  abstract signApprove(params: SignApproveParams): Promise<string>
  abstract getAddressAsync(walletIndex?: number): Promise<string>
}
