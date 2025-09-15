import { ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'
import { Address, BaseAmount } from '@xchainjs/xchain-util/lib'
import type { Contract, Types } from 'tronweb'

export type TRONClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

// Re-export TronWeb types for convenience
export type TronTransaction = Types.Transaction
export type TronContract = Contract
export type TronSignedTransaction = Types.SignedTransaction

// Signer interface compatible with TronWeb and wallet implementations
export interface TronSigner {
  getAddress(): Promise<string>
  signTransaction(transaction: TronTransaction): Promise<TronSignedTransaction>
}

export type ApproveParams = {
  walletIndex?: number
  contractAddress: Address
  spenderAddress: Address
  amount?: BaseAmount
}

export type IsApprovedParams = {
  walletIndex?: number
  contractAddress: Address
  spenderAddress: Address
  amount?: BaseAmount
}

export type TronGetApprovedParams = {
  contractAddress: string
  spenderAddress: string
  from: string
}

export interface TronGridTokenInfo {
  symbol: string
  address: string
  decimals: number
  name: string
  totalSupply: string
  owner: string
}
