import { Network } from '@xchainjs/xchain-client'
import axios from 'axios'

/**
 * Parameters for fetching address details from the Insight API.
 */
export type InsightAddressParams = {
  network: Network
  address: string
  pageNum?: number
}

/**
 * Response structure for address details fetched from the Insight API.
 */
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

/**
 * Parameters for fetching transaction details from the Insight API.
 */
export type InsightTransactionParams = {
  network: Network
  txid: string
}

/**
 * Response structure for transaction details fetched from the Insight API.
 */
export type InsightTxResponse = {
  // Fields representing transaction details
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

/**
 * Raw transaction data fetched from the Insight API.
 */
export type InsightRawTx = string

/**
 * Response structure for UTXO details fetched from the Insight API.
 */
export type InsightUtxoResponse = {
  // Fields representing UTXO details
  address: string
  txid: string
  vout: number
  scriptPubKey: string
  amount: number
  satoshis: number
  height: number
  confirmations: number
}

/**
 * Function to generate the URL for the given network.
 *
 * @param {Network} network The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The URL for the Insight API based on the network.
 */
const urlForNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'https://insight.dash.org/insight-api'
    case Network.Testnet:
      return 'http://insight.testnet.networks.dash.org:3001/insight-api'
  }
}

/**
 * Fetch address details from the Insight API.
 *
 * @param {InsightAddressParams} p Parameters for fetching address details.
 * @returns {Promise<InsightAddressResponse>} Address details fetched from the Insight API.
 */
export const getAddress = async (p: InsightAddressParams): Promise<InsightAddressResponse> => {
  const data = (await axios.get(`${urlForNetwork(p.network)}/addr/${p.address}`)).data
  return data
}

/**
 * Fetch transactions associated with an address from the Insight API.
 *
 * @param {InsightAddressParams} p Parameters for fetching address transactions.
 * @returns {Promise<{ txs: InsightTxResponse[]; pagesTotal: number }>} Transactions associated with the address.
 */
export const getAddressTxs = async (
  p: InsightAddressParams,
): Promise<{ txs: InsightTxResponse[]; pagesTotal: number }> => {
  const pageNum = p?.pageNum || 0
  return (await axios.get(`${urlForNetwork(p.network)}/txs?address=${p.address}&pageNum=${pageNum}`)).data
}

/**
 * Fetch UTXOs associated with an address from the Insight API.
 *
 * @param {InsightAddressParams} p Parameters for fetching address UTXOs.
 * @returns {Promise<InsightUtxoResponse[]>} UTXOs associated with the address.
 */
export const getAddressUtxos = async (p: InsightAddressParams): Promise<InsightUtxoResponse[]> => {
  return (await axios.get(`${urlForNetwork(p.network)}/addr/${p.address}/utxo`)).data
}

/**
 * Fetch transaction details from the Insight API.
 *
 * @param {InsightTransactionParams} p Parameters for fetching transaction details.
 * @returns {Promise<InsightTxResponse>} Transaction details fetched from the Insight API.
 */
export const getTx = async (p: InsightTransactionParams): Promise<InsightTxResponse> => {
  return (await axios.get(`${urlForNetwork(p.network)}/tx/${p.txid}`)).data
}

/**
 * Fetch raw transaction data from the Insight API.
 *
 * @param {InsightTransactionParams} p Parameters for fetching raw transaction data.
 * @returns {Promise<InsightRawTx>} Raw transaction data fetched from the Insight API.
 */
export const getRawTx = async (p: InsightTransactionParams): Promise<InsightRawTx> => {
  return (await axios.get(`${urlForNetwork(p.network)}/rawtx/${p.txid}`)).data.rawtx
}
