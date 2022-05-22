import { cosmosclient } from '@cosmos-client/core'
import { Network, Tx, TxParams } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

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
  chainIds: ChainIds
}

export type DepositParam = {
  walletIndex?: number
  asset?: Asset
  amount: BaseAmount
  memo: string
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
  fromAccountNumber: cosmosclient.Long.Long
  fromSequence: cosmosclient.Long.Long
}

/**
 * Response from `thorchain/constants` endpoint
 */
export type ThorchainConstantsResponse = {
  int_64_values: {
    // We are in fee interested only - ignore all other values
    NativeTransactionFee: number
  }
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
