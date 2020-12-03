import { ethers } from 'ethers'

export type Address = string

export enum Network {
  TEST = 'rinkeby',
  MAIN = 'homestead',
}

export type NormalTxOpts = {
  addressTo: Address
  amount: ethers.BigNumberish
  overrides?: NormalTxOverrides
}

export type NormalTxOverrides = {
  nonce?: ethers.BigNumberish
  gasLimit?: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  data?: ethers.BytesLike
}

export type Erc20TxOpts = {
  erc20ContractAddress: Address
  addressTo: Address
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
  erc20ContractAddress: Address
  addressTo: Address
  amount: ethers.BigNumberish
}


export type GasOracleResponse = {
  LastBlock?: string
  SafeGasPrice?: string
  ProposeGasPrice?: string
  FastGasPrice?: string
}
