import { ethers } from 'ethers'
import { BaseAmount } from '@xchainjs/xchain-util/lib'

export type Address = string

export enum Network {
  TEST = 'goerli',
  MAIN = 'homestead',
}

export type NormalTxOpts = {
  recipient: Address
  amount: BaseAmount
  overrides?: NormalTxOverrides
}

export type NormalTxOverrides = {
  nonce?: ethers.BigNumberish
  gasLimit?: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  data?: ethers.BytesLike
}

export type Erc20TxOpts = {
  assetAddress: Address
  recipient: Address
  amount: ethers.BigNumberish

  overrides?: Erc20TxOverrides
}

export type Erc20TxOverrides = {
  nonce?: ethers.BigNumberish

  // mandatory: https://github.com/ethers-io/ethers.js/issues/469#issuecomment-475926538
  gasLimit: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  value?: ethers.BigNumberish
}

export type EstimateGasERC20Opts = {
  assetAddress: Address
  recipient: Address
  amount: ethers.BigNumberish
}

export type GasOracleResponse = {
  LastBlock?: string
  SafeGasPrice?: string
  ProposeGasPrice?: string
  FastGasPrice?: string
}
