import { ethers, BigNumber } from 'ethers'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as C from '@xchainjs/xchain-client'
import { FeeOptionKey } from '@xchainjs/xchain-client'

export type Address = string

export enum Network {
  TEST = 'ropsten',
  MAIN = 'homestead',
}

export type ClientUrl = {
  testnet: string
  mainnet: string
}

export type ExplorerUrl = {
  testnet: string
  mainnet: string
}

export type TxOverrides = {
  nonce?: ethers.BigNumberish

  // mandatory: https://github.com/ethers-io/ethers.js/issues/469#issuecomment-475926538
  gasLimit: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  data?: ethers.BytesLike
  value?: ethers.BigNumberish
}

export type InfuraCreds = {
  projectId: string
  projectSecret?: string
}

export type GasPrices = Record<C.FeeOptionKey, BaseAmount>

export type FeesParams = C.FeesParams & C.TxParams

export type FeesWithGasPricesAndLimits = { fees: C.Fees; gasPrices: GasPrices; gasLimit: BigNumber }

export type ApproveParams = {
  walletIndex?: number
  contractAddress: Address
  spenderAddress: Address
  feeOptionKey?: FeeOptionKey
  amount?: BaseAmount
  // Optional fallback for gasLimit
  gasLimitFallback?: ethers.BigNumberish
}

export type IsApprovedParams = { contractAddress: Address; spenderAddress: Address; amount?: BaseAmount }

export type CallParams = {
  walletIndex?: number
  contractAddress: Address
  abi: ethers.ContractInterface
  funcName: string
  funcParams?: Array<unknown>
}

export type EstimateCallParams = Pick<CallParams, 'contractAddress' | 'abi' | 'funcName' | 'funcParams' | 'walletIndex'>
