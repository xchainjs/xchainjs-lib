import { ethers } from 'ethers'
import { BaseAmount, Asset } from '@xchainjs/xchain-util'

export type Address = string

export enum Network {
  TEST = 'kovan',
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
  recipient: Address
  amount: BaseAmount

  overrides?: TxOverrides
}

export type TxOverrides = {
  nonce?: ethers.BigNumberish

  from?: Address

  // mandatory: https://github.com/ethers-io/ethers.js/issues/469#issuecomment-475926538
  gasLimit: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  data?: ethers.BytesLike
  value?: ethers.BigNumberish
}

export type GasOracleResponse = {
  LastBlock?: string
  SafeGasPrice?: string
  ProposeGasPrice?: string
  FastGasPrice?: string
}
