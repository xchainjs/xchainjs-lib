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
  getAddressAsync(walletIndex?: number, verify?: boolean): Promise<Address> // Get address asynchronously
  signTransfer(params: SignTransferParams): Promise<string> // Transfer
  signApprove(params: SignApproveParams): Promise<string>
  getFullDerivationPath(walletIndex: number): string
  purge(): void // Purge client
}

export interface IKeystoreSigner extends ISigner {
  setPhrase(phrase: string, walletIndex?: number): Address // Set phrase
  getAddress(walletIndex?: number): Address // Get address
}
