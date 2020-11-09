export type BtcChainOptions =
  | 'bitcoin'
  | 'bitcoin-cash'
  | 'litecoin'
  | 'bitcoin-sv'
  | 'dogecoin'
  | 'dash'
  | 'groestlcoin'
  | 'zcash'
  | 'bitcoin/testnet'

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
      hash: string
      date: string
      time: string
      size: number
      weight: number
      version: number
      lock_time: number
      is_coinbase: boolean
      has_witness: boolean
      input_count: number
      output_count: number
      input_total: number
      input_total_usd: number
      output_total: number
      output_total_usd: number
      fee: number
      fee_usd: number
      fee_per_kb: number
      fee_per_kb_usd: number
      fee_per_kwu: number
      fee_per_kwu_usd: number
      cdd_total: number
      is_rbf: boolean
    }
    inputs: TxIO[]
    outputs: TxIO[]
  }
}

/**
 * https://blockchair.com/api/docs#link_201
 */
export interface RawTxsBTC {
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

export interface BtcAddressDTO {
  [key: string]: {
    address: {
      type:
        | 'pubkey'
        | 'pubkeyhash'
        | 'scripthash'
        | 'multisig'
        | 'nulldata'
        | 'nonstandard'
        | 'witness_v0_keyhash'
        | 'witness_v0_scripthash'
        | 'witness_unknown'
      script_hex: string
      balance: number
      balance_usd: number
      received: number
      received_usd: number
      spent: number
      spent_usd: number
      output_count: number
      unspent_output_count: number
      first_seen_receiving: string
      last_seen_receiving: string
      first_seen_spending: string
      last_seen_spending: string
      transaction_count: number
      scripthash_type: string
    }
    transactions: string[]
    utxo: {
      block_id: number
      transaction_hash: string
      index: number
      value: number
    }[]
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
  suggested_transaction_fee_per_byte_sat: 49
}
