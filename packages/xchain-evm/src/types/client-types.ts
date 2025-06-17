import { FeeOption, Fees, Network, TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { Balance, CompatibleAsset, Tx, TxsPage } from '@xchainjs/xchain-evm-providers'
import { Address, BaseAmount } from '@xchainjs/xchain-util'
import { Signer, InterfaceAbi, BigNumberish, BytesLike } from 'ethers'
import { BigNumber } from 'bignumber.js'

export type ClientUrl = Record<Network, string>
export type ExplorerUrl = Record<Network, string>

export type TxOverrides = {
  nonce?: BigNumberish

  // mandatory: https://github.com/ethers-io/ethers.js/issues/469#issuecomment-475926538
  gasLimit: BigNumberish
  gasPrice?: BigNumberish
  data?: BytesLike
  value?: BigNumberish
}

export type GasPrices = Record<FeeOption, BaseAmount>

export type FeesWithGasPricesAndLimits = { fees: Fees; gasPrices: GasPrices; gasLimit: BigNumber }

export type ApproveParams = {
  walletIndex?: number
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
  abi: InterfaceAbi
  funcName: string
  funcParams?: unknown[]
}

export type EstimateCallParams = Pick<CallParams, 'contractAddress' | 'abi' | 'funcName' | 'funcParams'>

export type EvmDefaults = {
  transferGasAssetGasLimit: BigNumber
  transferTokenGasLimit: BigNumber
  approveGasLimit: BigNumber
  gasPrice: BigNumber // BaseAmount Unit
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
  feeOption?: FeeOption
  gasPrice?: BaseAmount
  maxFeePerGas?: BaseAmount
  maxPriorityFeePerGas?: BaseAmount
  gasLimit?: BigNumber
  isMemoEncoded?: boolean
}

export { CompatibleAsset, Balance, Tx, TxsPage }
