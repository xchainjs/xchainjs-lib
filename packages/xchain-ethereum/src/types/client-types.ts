import { ethers, BigNumber } from 'ethers'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as C from '@xchainjs/xchain-client'

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

export type GasPrices = Record<C.FeeOptionKey, BaseAmount>
export type GasLimits = Record<C.FeeOptionKey, BigNumber>

export type FeesParams = C.FeesParams & Omit<C.TxParams, 'memo'>
export type GasLimitParams = FeesParams & { gasPrice: BaseAmount }
export type GasLimitsParams = FeesParams & { gasPrices: GasPrices }

export type FeesWithGasPricesAndLimits = { fees: C.Fees; gasPrices: GasPrices; gasLimits: GasLimits }
