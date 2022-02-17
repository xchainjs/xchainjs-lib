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
  chainIds?: ChainIds
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
  from_rune_balance: BaseAmount
  /**
   * Balance of asset to send from
   * Optional: It can be ignored if asset to send from is RUNE
   */
  from_asset_balance?: BaseAmount
  from_account_number: string
  from_sequence: string
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
