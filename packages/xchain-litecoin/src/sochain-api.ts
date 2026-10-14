import { Network } from '@xchainjs/xchain-client'
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import { LTC_DECIMAL } from './const'
import {
  AddressParams,
  BalanceParams,
  LtcAddressDTO,
  LtcAddressUTXO,
  LtcGetBalanceDTO,
  LtcGetTxsDTO,
  LtcUnspentTxsDTO,
  SochainResponse,
  Transaction,
  TxHashParams,
} from './types/sochain-api-types'
const toSochainNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'LTC'
    case Network.Testnet:
      return 'LTCTEST'
  }
}

/** @see https://sochain.com/api#get-display-data-address */
export const getAddress = async ({ apiKey, sochainUrl, network, address }: AddressParams): Promise<LtcAddressDTO> => {
  const url = `${sochainUrl}/address_summary/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const addressResponse: SochainResponse<LtcAddressDTO> = response.data
  return addressResponse.data
}

/** @see https://sochain.com/api#get-tx */
export const getTx = async ({ apiKey, sochainUrl, network, hash }: TxHashParams): Promise<Transaction> => {
  const url = `${sochainUrl}/transaction/${toSochainNetwork(network)}/${hash}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const tx: SochainResponse<Transaction> = response.data
  return tx.data
}

/** @see https://sochain.com/api#get-tx */
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
  network: Network
  page: number
}): Promise<LtcGetTxsDTO> => {
  const url = `${sochainUrl}/transactions/${toSochainNetwork(network)}/${address}/${page}` //TODO support paging
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const txs: SochainResponse<LtcGetTxsDTO> = response.data
  return txs.data
}
/** @see https://sochain.com/api#get-balance */
export const getBalance = async ({ apiKey, sochainUrl, network, address }: BalanceParams): Promise<BaseAmount> => {
  const url = `${sochainUrl}/balance/${toSochainNetwork(network)}/${address}`
  const response = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const balanceResponse: SochainResponse<LtcGetBalanceDTO> = response.data
  const confirmed = assetAmount(balanceResponse.data.confirmed, LTC_DECIMAL)
  const unconfirmed = assetAmount(balanceResponse.data.unconfirmed, LTC_DECIMAL)
  const netAmt = confirmed.amount().plus(unconfirmed.amount())
  const result = assetToBase(assetAmount(netAmt, LTC_DECIMAL))
  return result
}

/** @see https://sochain.com/api#get-unspent-tx */
export const getUnspentTxs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  page,
}: AddressParams): Promise<LtcAddressUTXO[]> => {
  const url = [sochainUrl, 'unspent_outputs', toSochainNetwork(network), address, page].filter((v) => !!v).join('/')
  const resp = await axios.get(url, { headers: { 'API-KEY': apiKey } })
  const response: SochainResponse<LtcUnspentTxsDTO> = resp.data
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
