export interface BlockChairResponse<T> {
  data: T
  context: {
    status: number
  }
}

export interface TxIO {
  block_id: number
  transaction_id: number
  index: number
  transaction_hash: string
  date: string
  time: string
  value: number
  value_usd: number
  recipient: string
  type: string
  script_hex: string
  is_from_coinbase: boolean
  is_spendable: boolean
  is_spent: boolean
  spending_block_id: number
  spending_transaction_id: number
  spending_index: number
  spending_transaction_hash: string
  spending_date: string
  spending_time: string
  spending_value_usd: number
  spending_sequence: number
  spending_signature_hex: string
  spending_witness: string
  lifespan: number
  cdd: number
  scripthash_type?: string
}

export interface Transactions {
  [key: string]: {
    transaction: {
      block_id: number
      id: number
      index: number
      hash: string
      date: string
      time: string
      failed: boolean
      type: string
      sender: string
      recipient: string
      call_count: number
      value: string
      value_usd: number | null
      internal_value: string
      internal_value_usd: number | null
      fee: string
      fee_usd: number | null
      gas_used: number
      gas_limit: number
      gas_price: number
      input_hex: string
      nonce: number
      v: string
      r: string
      s: string
    }
    calls: {
      block_id: number
      transaction_id: number
      transaction_hash: string
      index: string
      depth: number
      date: string
      time: string
      failed: boolean
      fail_reason: string | null
      type: string
      sender: string
      recipient: string
      child_call_count: number
      value: string
      value_usd: number | null
      transferred: boolean
      input_hex: string
      output_hex: string
    }[]
  }
}

/**
 * https://blockchair.com/api/docs#link_201
 */
export interface RawTxs {
  [key: string]: {
    raw_transaction: string
    decoded_raw_transaction: {
      txid: string
      hash: string
      version: number
      size: number
      vsize: number
      weight: number
      locktime: number
      vin: [
        {
          txid: string
          vout: number
          scriptSig: {
            asm: string
            hex: string
          }
          sequence: number
        },
      ]
      vout: {
        value: number
        n: number
        scriptPubKey: {
          asm: string
          hex: string
          reqSigs: number
          type: string // todo -> enum this
          addresses: string[]
        }
      }[]
    }
  }
}

export interface AddressTx {
  block_id: number
  hash: string
  time: string
  balance_change: number
}

export interface AddressCall {
  block_id: number
  transaction_hash: string
  index: string
  time: string
  sender: string
  recipient: string
  value: number
  value_usd: number | null
  transferred: true
}

export interface AddressDTO {
  [key: string]: {
    address: {
      type: string | null
      contract_code_hex: string | null
      contract_created: boolean | null
      contract_destroyed: boolean | null
      balance: string | null
      balance_usd: number
      received_approximate: string
      received_usd: number
      spent_approximate: string
      spent_usd: number
      fees_approximate: string
      fees_usd: number
      receiving_call_count: number
      spending_call_count: number
      call_count: number
      transaction_count: number
      first_seen_receiving: string | null
      last_seen_receiving: string | null
      first_seen_spending: string | null
      last_seen_spending: string | null
      nonce: number | null
    }
    calls: AddressCall[]
  }
}

/**
 * https://blockchair.com/api/docs#link_001
 */
export interface ChainStatsBtc {
  blocks: number
  transactions: number
  outputs: number
  circulation: number
  blocks_24h: number
  transactions_24h: number
  difficulty: number
  volume_24h: number
  mempool_transactions: number
  mempool_size: number
  mempool_tps: number
  mempool_total_fee_usd: number
  best_block_height: number
  best_block_hash: string
  best_block_time: string
  blockchain_size: number
  average_transaction_fee_24h: number
  inflation_24h: number
  median_transaction_fee_24h: number
  cdd_24h: number
  largest_transaction_24h: {
    hash: string
    value_usd: number
  }
  nodes: number
  hashrate_24h: string
  inflation_usd_24h: number
  average_transaction_fee_usd_24h: number
  median_transaction_fee_usd_24h: number
  market_price_usd: number
  market_price_btc: number
  market_price_usd_change_24h_percentage: number
  market_cap_usd: number
  market_dominance_percentage: number
  next_retarget_time_estimate: string
  next_difficulty_estimate: number
  countdowns: {
    event: string
    time_left: number
  }[]
  suggested_transaction_fee_per_byte_sat: number
}
