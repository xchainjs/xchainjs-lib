import { TxHash } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AddressDTO,
  AddressParams,
  AddressUTXO,
  BalanceParams,
  BroadcastDTO,
  GetBalanceDTO,
  GetTxsDTO,
  SochainNetwork,
  SochainResponse,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
  UnspentTxsDTO,
} from './sochain-api-types'

export const getAddress = async ({ apiKey, sochainUrl, network, address }: AddressParams): Promise<AddressDTO> => {
  const url = `${sochainUrl}/address_summary/${network}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: SochainResponse<AddressDTO> = response.data
  return addressResponse.data
}

export const getTx = async ({ apiKey, sochainUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${sochainUrl}/transaction/${network}/${hash}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const tx: SochainResponse<Transaction> = response.data
  return tx.data
}

export const getTxs = async ({
  apiKey,
  address,
  sochainUrl,
  network,
  page,
}: {
  apiKey: string
  address: string
  sochainUrl: string
  network: SochainNetwork
  page: number
}): Promise<GetTxsDTO> => {
  const url = `${sochainUrl}/transactions/${network}/${address}/${page}` //TODO support paging
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const txs: SochainResponse<GetTxsDTO> = response.data
  return txs.data
}
export const getBalance = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  confirmedOnly,
  assetDecimals,
}: BalanceParams): Promise<BaseAmount> => {
  const url = `${sochainUrl}/balance/${network}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const balanceResponse: SochainResponse<GetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed, assetDecimals)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed, assetDecimals)
  const netAmt = confirmedOnly ? confirmed : confirmed.plus(unconfirmed)
  const result = assetToBase(netAmt)
  return result
}

export const getUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  page,
}: AddressParams): Promise<AddressUTXO[]> => {
  const url = [sochainUrl, 'unspent_outputs', network, address, page].filter((v) => !!v).join('/')
  const resp = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const response: SochainResponse<UnspentTxsDTO> = resp.data
  const txs = response.data.outputs
  if (txs.length === 10) {
    const nextBatch = await getUnspentTxs({
      apiKey,
      sochainUrl,
      network,
      address,
      page: page + 1,
    })
    return txs.concat(nextBatch)
  } else {
    return txs
  }
}

export const getIsTxConfirmed = async ({
  apiKey,
  sochainUrl,
  network,
  hash,
}: TxHashParams): Promise<TxConfirmedStatus> => {
  const tx = await getTx({ apiKey, sochainUrl, network, hash })
  return {
    network: network,
    txid: hash,
    confirmations: tx.confirmations,
    is_confirmed: tx.confirmations >= 1,
  }
}

// Confirmed tx hashes, cached so the same status is not requested again
const confirmedTxs: Array<TxHash> = []

export const getConfirmedTxStatus = async ({
  apiKey,
  txHash,
  sochainUrl,
  network,
}: {
  apiKey: string
  sochainUrl: string
  txHash: TxHash
  network: SochainNetwork
}): Promise<boolean> => {
  if (confirmedTxs.includes(txHash)) return true
  const { is_confirmed } = await getIsTxConfirmed({
    apiKey,
    sochainUrl,
    network,
    hash: txHash,
  })
  confirmedTxs.push(txHash)
  return is_confirmed
}

export const getConfirmedUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
}: AddressParams): Promise<AddressUTXO[]> => {
  const txs = await getUnspentTxs({
    apiKey,
    sochainUrl,
    network,
    address,
    page: 1,
  })

  const confirmedUTXOs: AddressUTXO[] = []

  await Promise.all(
    txs.map(async (tx: AddressUTXO) => {
      const confirmed = await getConfirmedTxStatus({
        apiKey,
        sochainUrl,
        network,
        txHash: tx.hash,
      })

      if (confirmed) {
        confirmedUTXOs.push(tx)
      }
    }),
  )

  return confirmedUTXOs
}

export const broadcastTx = async ({
  apiKey,
  sochainUrl,
  network,
  txHex,
}: {
  apiKey: string
  sochainUrl: string
  txHex: string
  network: SochainNetwork
}): Promise<TxHash> => {
  const url = `${sochainUrl}/broadcast_transaction/${network}`
  const response = await axios.post(url, { tx_hex: txHex }, { headers: { 'API-KEY': apiKey } })
  const broadcastResponse: BroadcastDTO = response.data
  return broadcastResponse.tx_hex
}
