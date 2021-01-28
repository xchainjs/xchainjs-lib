import { ethers } from 'ethers'
import { BaseAmount, Asset } from '@xchainjs/xchain-util'
import { FeeOptionKey } from '@xchainjs/xchain-client/lib'

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

export type EstimateGasOpts = {
  asset?: Asset
  sender?: Address
  recipient: Address
  amount: BaseAmount

  overrides?: TxOverrides
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
