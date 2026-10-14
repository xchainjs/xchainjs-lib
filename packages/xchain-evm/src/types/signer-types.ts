import { Address } from '@xchainjs/xchain-util'
import { Transaction } from 'ethers'

export type SignTransferParams = {
  walletIndex: number
  tx: Transaction
}

export type SignApproveParams = {
  walletIndex: number
  tx: Transaction
}

export interface ISigner {
  getAddressAsync(walletIndex?: number, verify?: boolean): Promise<Address>
  signTransfer(params: SignTransferParams): Promise<string>
  signApprove(params: SignApproveParams): Promise<string>
  getFullDerivationPath(walletIndex: number): string
  purge(): void
}

export interface IKeystoreSigner extends ISigner {
  setPhrase(phrase: string, walletIndex?: number): Address
  getAddress(walletIndex?: number): Address
}
