import { TxHash } from '@xchainjs/xchain-client'

export type AddressParams = {
  apiKey: string
  baseUrl: string
  address: string
  page: number
}
export type BalanceParams = {
  apiKey: string
  baseUrl: string
  address: string
  confirmedOnly: boolean
  assetDecimals: number
}

export type TxHashParams = {
  apiKey: string
  baseUrl: string
  hash: TxHash
}

export type TxBroadcastParams = {
  apiKey: string
  baseUrl: string
  txHex: string
}

export interface TxInput {
  txid: string
  vout?: number
  n: number
  sequence: number
  addresses: string[]
  isAddress: boolean
  value: string // zatoshis
  hex: string
}
export interface TxOutput {
  value: string
  n: number
  spent?: boolean
  hex: string
  addresses: string[]
  isAddress: boolean
}
export interface Transaction {
  txid: string
  version: number
  vin: TxInput[]
  vout: TxOutput[]
  blockHash: string
  blockHeight: number
  confirmations: number
  blockTime: number
  size: number
  value: string // total enviado
  valueIn: string // total recibido en inputs
  fees: string
  hex: string // transacción completa en hexadecimal
}

export type AddressUTXO = {
  txid: string
  vout: number
  value: string
  height: number
  confirmations: number
}

export type AddressTxDTO = {
  tx_hash: string
  block_height: number
  confirmed: string
}

export type GetAddressInfo= {
  page: number
  totalPages: number
  itemsOnPage: number
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  txids?: string[]
  transactions?: Transaction[]
}

export type BroadcastDTO = {
  result: string
}
export type UnspentTxsDTO = {
  outputs: AddressUTXO[]
}

export type BroadcastTransfer = {
  network: string
  txid: string
}

export type TxConfirmedStatus = {
  txid: string
  confirmations: number
  is_confirmed: boolean
}

// export type ChainResponse = {
//   blockbook: {
//     coin: string
//     host: string
//     version: string
//     gitCommit: string
//     buildTime: string
//     syncMode: boolean
//     initialSync: boolean
//     inSync: boolean
//     bestHeight: number
//     lastBlockTime: string
//     inSyncMempool: boolean
//     lastMempoolTime: string
//     mempoolSize: number
//     decimals: number
//     dbSize: number
//     about: string
//   }
//   backend: {
//     chain: string
//     blocks: number
//     headers: number
//     bestBlockHash: string
//     difficulty: string
//     sizeOnDisk: number
//     version: string
//     subversion: string
//     protocolVersion: string
//     consensus: {
//       chaintip: string
//       nextblock: string
//     }
//   }
// }


export type RawTransaction = {
  hex: string
  txid: string
  authdigest: string
  size: number
  overwintered: boolean
  version: number
  versiongroupid: string
  locktime: number
  expiryheight: number
  vin: {
    txid: string
    vout: number
    scriptSig: {
      asm: string
      hex: string
    }
    sequence: number
  }[]
  vout: {
    value: number
    valueZat: number
    valueSat: number
    n: number
    scriptPubKey: {
      asm: string
      hex: string
      reqSigs: number
      type: string
      addresses: string[]
    }
  }[]
  vjoinsplit: any[]
  valueBalance: number
  valueBalanceZat: number
  vShieldedSpend: any[]
  vShieldedOutput: any[]
  orchard: {
    actions: any[]
    valueBalance: number
    valueBalanceZat: number
  }
  blockhash: string
  height: number
  confirmations: number
  time: number
  blocktime: number
}

