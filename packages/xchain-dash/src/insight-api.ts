import { Network } from '@xchainjs/xchain-client'
import axios from 'axios'

export type InsightAddressParams = {
  network: Network
  address: string
  pageNum?: number
}

export type InsightAddressResponse = {
  addrStr: string
  balance: number
  balanceSat: number
  totalReceived: number
  totalReceivedSat: number
  totalSent: number
  totalSentSat: number
  txAppearances: number
  txApperances: number
  unconfirmedAppearances: number
  unconfirmedBalance: number
  unconfirmedBalanceSat: number
  unconfirmedTxApperances: number
}

export type InsightTransactionParams = {
  network: Network
  txid: string
}

export type InsightTxResponse = {
  blockhash: string
  blockheight: number
  blocktime: number
  cbTx: {
    height: number
    merkleRootMNList: string
    merkleRootQuorums: string
    version: number
  }
  confirmations: number
  extraPayload: string
  extraPayloadSize: number
  isCoinBase: boolean
  locktime: number
  size: number
  time: number
  txid: string
  txlock: boolean
  type: number
  valueOut: number
  version: number
  vin: [
    {
      addr: string
      doubleSpentTxID: string
      n: number
      scriptSig: {
        asm: string
        hex: string
      }
      sequence: number
      txid: number
      value: number
      valueSat: number
    },
  ]
  vout: [
    {
      n: number
      scriptPubKey: {
        addresses: string[]
        asm: string
        hex: string
        type: string
      }
      spentHeight: number
      spentIndex: number
      spentTxId: string
      value: string
    },
  ]
}

export type InsightRawTx = string

export type InsightUtxoResponse = {
  address: string
  txid: string
  vout: number
  scriptPubKey: string
  amount: number
  satoshis: number
  height: number
  confirmations: number
}

const urlForNetwork = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'https://insight.dash.org/insight-api'
    case Network.Testnet:
      return 'https://testnet-insight.dash.org/insight-api'
  }
}

export const getAddress = async (p: InsightAddressParams): Promise<InsightAddressResponse> => {
  return (await axios.get(`${urlForNetwork(p.network)}/addr/${p.address}`)).data
}

export const getAddressTxs = async (
  p: InsightAddressParams,
): Promise<{ txs: InsightTxResponse[]; pagesTotal: number }> => {
  const pageNum = p?.pageNum || 0
  return (await axios.get(`${urlForNetwork(p.network)}/txs?address=${p.address}&pageNum=${pageNum}`)).data
}

export const getAddressUtxos = async (p: InsightAddressParams): Promise<InsightUtxoResponse[]> => {
  return (await axios.get(`${urlForNetwork(p.network)}/addr/${p.address}/utxo`)).data
}

export const getTx = async (p: InsightTransactionParams): Promise<InsightTxResponse> => {
  return (await axios.get(`${urlForNetwork(p.network)}/tx/${p.txid}`)).data
}

export const getRawTx = async (p: InsightTransactionParams): Promise<InsightRawTx> => {
  return (await axios.get(`${urlForNetwork(p.network)}/rawtx/${p.txid}`)).data.rawtx
}
