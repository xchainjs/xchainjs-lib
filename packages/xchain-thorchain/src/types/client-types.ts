import { Network, Tx, TxParams } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import Long from 'long'

export type NodeUrl = {
  node: string
  rpc: string
}

export type ClientUrl = Record<Network, NodeUrl>

export type ExplorerUrls = {
  root: ExplorerUrl
  tx: ExplorerUrl
  address: ExplorerUrl
}

export type ExplorerUrl = Record<Network, string>

export type ChainId = string
export type ChainIds = Record<Network, ChainId>

export type ThorchainClientParams = {
  clientUrl?: ClientUrl
  explorerUrls?: ExplorerUrls
  chainIds?: ChainIds
}

export type DepositParam = {
  walletIndex?: number
  asset?: Asset
  amount: BaseAmount
  memo: string
  gasLimit?: BigNumber
  sequence?: number
}

export type TxData = Pick<Tx, 'from' | 'to' | 'type'>

export type TxOfflineParams = TxParams & {
  /**
   * Balance of Rune to send from
   */
  fromRuneBalance: BaseAmount
  /**
   * Balance of asset to send from
   * Optional: It can be ignored if asset to send from is RUNE
   */
  fromAssetBalance?: BaseAmount
  fromAccountNumber: Long
  fromSequence: Long
  gasLimit?: BigNumber
}

/**
 * Response from `thorchain/constants` endpoint
 */
export type ThorchainNetworkResponse = {
  // We are in fee interested only - ignore all other values
  native_tx_fee_rune: number
}

/**
 * Response of `/cosmos/base/tendermint/v1beta1/node_info`
 * Note: We are interested in `network` (aka chain id) only
 */
export type NodeInfoResponse = {
  default_node_info: {
    network: string
  }
}
/**
 * Response of `/cosmos/tx/v1beta1/simulateo`
 * Note: We are interested in `network` (aka chain id) only
 */
export type SimulateResponse = {
  gas_info: {
    gas_used: string
  }
}

export type MessageSend = {
  '@type': string
  from_address: string
  to_address: string
  amount: Amount
}
export type Amount = {
  denom: string
  amount: string
}

export type MessageDeposit = {
  '@type': string
  coins: Coins[]
  memo: string
  signer: string
}

export type Coins = {
  asset: string
  amount: number
  decimals: number
}
