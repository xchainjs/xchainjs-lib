import { ethers } from 'ethers'
import { BaseAmount } from '@xchainjs/xchain-util'
import { FeeOptionKey, TxParams } from '@xchainjs/xchain-client/lib'

export type Address = string

export enum Network {
  TEST = 'rinkeby',
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

export type GasPrices = Record<FeeOptionKey, BaseAmount>
export type GasLimits = Record<FeeOptionKey, BaseAmount>

export type EstimateFeesParams = Omit<TxParams, 'memo'> & { sender: Address }
export type GasLimitParams = EstimateFeesParams & { gasPrice: BaseAmount }
export type GasLimitsParams = EstimateFeesParams & { gasPrices: GasPrices }

export type FeesWithGasPricesAndLimits = { fees: Fees; gasPrices: GasPrices; gasLimits: GasLimits }
