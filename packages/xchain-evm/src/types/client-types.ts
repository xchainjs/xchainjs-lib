import { FeeOption, Fees, Network } from '@xchainjs/xchain-client'
import { Address, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber, Signer, ethers } from 'ethers'

export type ClientUrl = Record<Network, string>
export type ExplorerUrl = Record<Network, string>

export type TxOverrides = {
  nonce?: ethers.BigNumberish

  // mandatory: https://github.com/ethers-io/ethers.js/issues/469#issuecomment-475926538
  gasLimit: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  data?: ethers.BytesLike
  value?: ethers.BigNumberish
}

export type GasPrices = Record<FeeOption, BaseAmount>

export type FeesWithGasPricesAndLimits = { fees: Fees; gasPrices: GasPrices; gasLimit: BigNumber }

export type ApproveParams = {
  walletIndex?: number
  signer?: Signer
  contractAddress: Address
  spenderAddress: Address
  feeOption?: FeeOption
  amount?: BaseAmount
  // Optional fallback in case estimation for gas limit fails
  // gasLimitFallback?: ethers.BigNumberish
}

export type EstimateApproveParams = {
  contractAddress: Address
  spenderAddress: Address
  fromAddress: Address
  amount?: BaseAmount
}

export type IsApprovedParams = {
  walletIndex?: number
  contractAddress: Address
  spenderAddress: Address
  amount?: BaseAmount
}

export type CallParams = {
  signer?: Signer
  walletIndex?: number
  contractAddress: Address
  abi: ethers.ContractInterface
  funcName: string
  funcParams?: unknown[]
}

export type EstimateCallParams = Pick<CallParams, 'contractAddress' | 'abi' | 'funcName' | 'funcParams'>
