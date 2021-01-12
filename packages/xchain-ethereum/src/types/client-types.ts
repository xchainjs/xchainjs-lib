import { ethers } from 'ethers'
import { BaseAmount } from '@xchainjs/xchain-util'

export type Address = string

export enum Network {
  TEST = 'kovan',
  MAIN = 'homestead',
}

export type VaultTxOpts = {
  address: Address
  amount: BaseAmount
  memo: string
  overrides?: ContractTxOverrides
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
  amount: BaseAmount

  overrides?: ContractTxOverrides
}

export type ContractTxOverrides = {
  nonce?: ethers.BigNumberish

  // mandatory: https://github.com/ethers-io/ethers.js/issues/469#issuecomment-475926538
  gasLimit: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  value?: ethers.BigNumberish
}

export type GasOracleResponse = {
  LastBlock?: string
  SafeGasPrice?: string
  ProposeGasPrice?: string
  FastGasPrice?: string
}
