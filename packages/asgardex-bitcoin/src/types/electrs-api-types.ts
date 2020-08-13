export type status = {
  confirmed: boolean
  block_height?: number
  block_hash?: string
  block_time: number
}

export type vout = {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address?: string
  value: number
}

export type Estimates = {
  [index: string]: number
}

export type Address = {
  address: string
  chain_stats: {
    funded_txo_count: number
    funded_txo_sum: number
    spent_txo_count: number
    spent_txo_sum: number
    tx_count: number
  }
  mempool_stats: {
    funded_txo_count: number
    funded_txo_sum: number
    spent_txo_count: number
    spent_txo_sum: number
    tx_count: number
  }
}

export type Utxos = Array<Utxo>

export type Utxo = {
  txid: string
  vout: number
  value: number
  status: status
}

export type Txs = Array<Tx>

export type Tx = {
  txid: string
  version: number
  locktime: number
  size: number
  weight: number
  fee: number
  status: status
  vin: Array<{
    txid: string
    vout: number
    scriptsig: string
    scriptsig_asm: string
    is_coinbase: boolean
    sequence: number
    witness: Array<string>
    prevout: vout
  }>
  vout: Array<vout>
}

export type Blocks = Array<Block>

export type Block = {
  id: string
  height: number
  version: number
  timestamp: number
  tx_count: number
  size: number
  weight: number
  merkle_root: string
  previousblockhash: string
  nonce: number
  bits: number
  difficulty: number
}
