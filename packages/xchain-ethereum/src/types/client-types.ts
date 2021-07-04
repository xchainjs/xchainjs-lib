import { FeeOptionKey, Fees, FeesParams as BaseFeesParams, TxParams } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

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

export type GasPrices = Record<FeeOptionKey, BaseAmount>

export type FeesParams = BaseFeesParams & TxParams

export type FeesWithGasPricesAndLimits = { fees: Fees; gasPrices: GasPrices; gasLimit: BigNumber }

export type ApproveParams = {
  walletIndex?: number
  contractAddress: Address
  spenderAddress: Address
  feeOptionKey?: FeeOptionKey
  amount?: BaseAmount
  // Optional fallback in case estimation for gas limit fails
  gasLimitFallback?: ethers.BigNumberish
}

export type EstimateApproveParams = Omit<ApproveParams, 'feeOptionKey' | 'gasLimitFallback'>

export type IsApprovedParams = {
  walletIndex?: number
  contractAddress: Address
  spenderAddress: Address
  amount?: BaseAmount
}

export type CallParams = {
  walletIndex?: number
  contractAddress: Address
  abi: ethers.ContractInterface
  funcName: string
  funcParams?: unknown[]
}

export type EstimateCallParams = Pick<CallParams, 'contractAddress' | 'abi' | 'funcName' | 'funcParams' | 'walletIndex'>
