export type TronGridTRC20Balance = Array<{
  [contractAddress: string]: string
}>

export interface TronGridAccountResponse {
  data: Array<{
    address: string
    balance: number
    create_time: number
    latest_opration_time: number
    free_net_usage: number
    net_window_size: number
    net_window_optimized: boolean
    trc20: TronGridTRC20Balance
    assetV2?: Array<{ key: string; value: number }>
    frozenV2?: Array<{ type?: string }>
    free_asset_net_usageV2?: Array<{ key: string; value: number }>
    latest_consume_free_time?: number
    owner_permission?: {
      keys: Array<{ address: string; weight: number }>
      threshold: number
      permission_name: string
    }
    active_permission?: Array<{
      operations: string
      keys: Array<{ address: string; weight: number }>
      threshold: number
      id: number
      type: string
      permission_name: string
    }>
    account_resource?: { energy_window_optimized: boolean; energy_window_size: number }
  }>
  success: boolean
  meta: { at: number; page_size: number }
}

export interface TronGridTrxTransactionData {
  txID: string
  blockNumber: number
  block_timestamp: number
  raw_data: {
    contract: Array<{
      type: string
      parameter: {
        value: {
          owner_address: string
          to_address: string
          amount: number
        }
      }
    }>
  }
}

export interface TronGridTransaction {
  txID: string
  raw_data: {
    contract: TronGridContract[]
    ref_block_bytes?: string
    ref_block_hash?: string
    expiration?: number
    timestamp?: number // often included
    data?: string // optional, base16 string (ex: "74657374")
    fee_limit?: number
  }
  raw_data_hex?: string
  blockNumber?: number
  block_timestamp?: number // may not exist on walletsolidity
  ret?: Array<{ contractRet: string }>
  signature?: string[]
  visible?: boolean

  /**
   * Only available from TronGrid v1 REST API (not walletsolidity).
   * Contains pre-parsed TRC20 transfers.
   */
  trc20_transfer?: TronGridTrc20Transfer[]
}

export type TronGridContract = TronTransferContract | TronTransferAssetContract | TronTriggerSmartContract

export interface TronTransferContract {
  type: 'TransferContract'
  parameter: {
    value: {
      owner_address: string // hex (41...)
      to_address: string // hex (41...)
      amount: number // TRX in SUN (1e6)
    }
  }
}

export interface TronTransferAssetContract {
  type: 'TransferAssetContract'
  parameter: {
    value: {
      asset_name: string // base64 or token ID string
      owner_address: string
      to_address: string
      amount: number
    }
  }
}

export interface TronTriggerSmartContract {
  type: 'TriggerSmartContract'
  parameter: {
    value: {
      owner_address: string
      contract_address: string // hex (41...)
      data: string // ABI-encoded call (ex: a9059cbb...)
    }
  }
}

export interface TronGridTrc20Transfer {
  from: string // base58 address
  to: string // base58 address
  value: string // raw string value before decimals
  symbol: string
  decimals: number
  contract_address: string // base58 address of token contract
}
