import { Network, Tx, TxsPage } from '@xchainjs/xchain-client'
import { TxFrom, TxTo, TxType } from '@xchainjs/xchain-client/src'
import { DCR_DECIMAL } from '@xchainjs/xchain-decred/src/const'
import { AssetDCR, BaseAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { AddressParams, DcrTxFrom, DcrTxTo, DcrUTXO, TxBroadcastParams } from './types/dcrdata-api-types'

/**
 * Broadcast transaction.
 *
 * @see https://github.com/decred/dcrdata/blob/master/docs/Insight_API_documentation.md#txsend-post
 *
 * @param {string} params
 * @returns {string} Transaction ID.
 */
export const broadcastTx = async ({ network, txHex }: TxBroadcastParams): Promise<string> => {
  const url = (() => {
    switch (network) {
      case Network.Mainnet:
        return `https://dcrdata.decred.org/insight/api/tx/send`
      case Network.Testnet:
        return `https://testnet.dcrdata.org/insight/api/tx/send`
    }
    return ''
  })()
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Postman-Token': 'bf2e16a1-b6d2-4b2f-b6e5-9ea7bd3df5b1',
  }
  const txid: string = (await axios.post(url, `{"rawtx":"${txHex}"}`, { headers: headers })).data.txid
  return txid
}

/**
 * Get address information.
 *
 * @see https://github.com/decred/dcrdata/blob/master/docs/Insight_API_documentation.md#addrstxs
 *
 * @param {string} dcrdataUrl
 * @param {string} network
 * @param {string} address
 * @returns {TxsPage}
 */
export const getAddress = async (
  { dcrdataUrl, network, address }: AddressParams,
  offset = 0,
  limit = 10,
): Promise<TxsPage> => {
  dcrdataUrl as string
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Postman-Token': 'bf2e16a1-b6d2-4b2f-b6e5-9ea7bd3df5b1',
  }
  let resp = null
  if (network == Network.Mainnet) {
    resp = await axios.post(
      `https://dcrdata.decred.org/insight/api/addrs/txs`,
      { addrs: address, from: `${offset}`, to: `${offset + limit}`, noScriptSig: '1', noAsm: '1' },
      { headers: headers },
    )
  } else if (network == Network.Testnet) {
    resp = await axios.post(
      `https://testnet.dcrdata.org/insight/api/addrs/txs`,
      { addrs: address, from: `${offset}`, to: `${offset + limit}`, noScriptSig: '1', noAsm: '1' },
      { headers: headers },
    )
  }
  const txs: Tx[] = []
  if (resp?.status != 200) throw new Error('dcrdata API not OK')
  const data = resp?.data
  for (let i = 0; i < data.items.length; i++) {
    const vin = data.items[i].vin
    const from: TxFrom[] = []
    vin.forEach(function (vi: DcrTxFrom) {
      from.push({ from: vi.addr, amount: baseAmount(vi.valueSat) })
    })
    const to: TxTo[] = []
    const vout = data.items[i].vout
    vout.forEach(function (vo: DcrTxTo) {
      if (vo.scriptPubKey.addresses)
        to.push({ to: vo.scriptPubKey.addresses[0], amount: assetToBase(assetAmount(vo.value)) })
    })
    const date = new Date(data.items[i].time * 1000) // Date expects in milliseconds
    const type = TxType.Transfer
    const hash = data.items[i].txid
    txs.push({ asset: AssetDCR, from: from, to: to, date: date, type: type, hash: hash })
  }
  return { total: txs.length, txs: txs }
}

/**
 * Get transaction by hash.
 *
 * @see https://sochain.com/api#get-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network network id
 * @param {string} hash The transaction hash.
 * @returns {Transactions}
 */
export const getTx = async (txid: string, network: Network): Promise<Tx> => {
  let dcrdataAPI
  switch (network) {
    case Network.Mainnet:
      dcrdataAPI = 'https://dcrdata.decred.org/insght/api'
      break
    case Network.Testnet:
      dcrdataAPI = 'https://testnet.dcrdata.org/insight/api'
      break
  }
  const url = `${dcrdataAPI}/tx/${txid}`
  const response = await axios.get(url)
  const data = response.data
  const from: TxFrom[] = []
  const to: TxTo[] = []
  data.vout.forEach(function (vo: DcrTxTo) {
    if (vo.scriptPubKey.addresses)
      to.push({ to: vo.scriptPubKey.addresses[0], amount: assetToBase(assetAmount(vo.value)) })
  })
  data.vin.forEach(function (vi: DcrTxFrom) {
    from.push({ from: vi.addr, amount: assetToBase(assetAmount(vi.value)) })
  })
  const date = new Date(data.time * 1000) // Date expects in milliseconds
  return { asset: AssetDCR, from: from, to: to, date: date, type: TxType.Transfer, hash: data.txid }
}

/**
 * Get address balance.
 *
 * @see https://sochain.com/api#get-balance
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {number}
 */
export const getBalance = async ({ dcrdataUrl, network, address }: AddressParams): Promise<BaseAmount> => {
  dcrdataUrl
  let dcrdataAPI: string
  switch (network) {
    case Network.Mainnet:
      dcrdataAPI = 'https://dcrdata.decred.org/api'
      break
    case Network.Testnet:
      dcrdataAPI = 'https://testnet.dcrdata.org/api'
      break
  }
  const url = `${dcrdataAPI}/address/${address}/totals`
  const response = await axios.get(url)
  return assetToBase(assetAmount(response.data.dcr_unspent, DCR_DECIMAL))
}

/**
 * Get unspent txs
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {string} network
 * @param {string} address
 * @returns {BtcAddressUTXO[]}
 */
export const getUnspentTxs = async ({
  dcrdataUrl,
  network,
  address,
  startingFromTxId,
}: AddressParams): Promise<DcrUTXO[]> => {
  dcrdataUrl
  startingFromTxId
  if (network == Network.Mainnet) {
    const resp = await axios.get(`https://dcrdata.decred.org/insight/api/addr/${address}/utxo`)
    const response: DcrUTXO[] = await resp?.data
    return response
  } else if (network == Network.Testnet) {
    const resp = await axios.get(`https://testnet.dcrdata.org/insight/api/addr/${address}/utxo`)
    const response: DcrUTXO[] = await resp?.data
    return response
  }
  return []
}

/**
 * Get unspent txs and filter out pending UTXOs
 *
 * @see https://sochain.com/api#get-unspent-tx
 *
 * @param {string} sochainUrl The sochain node url.
 * @param {Network} network
 * @param {string} address
 * @returns {BtcAddressUTXO[]}
 */
export const getConfirmedUnspentTxs = async ({ dcrdataUrl, network, address }: AddressParams): Promise<DcrUTXO[]> => {
  const txs = await getUnspentTxs({
    dcrdataUrl,
    network,
    address,
  })
  return txs.filter((tx) => tx.confirmations > 0)
}

/**
 * Get Bitcoin suggested transaction fee.
 *
 * @returns {number} The Bitcoin suggested transaction fee per bytes in sat.
 */
export const getSuggestedTxFee = async (network: Network): Promise<number> => {
  let resp = null
  if (network == Network.Mainnet) {
    resp = await axios.get(`https://dcrdata.decred.org/insight/api/utils/estimatefee`, { params: { nbBlocks: 1 } })
  } else if (network == Network.Testnet) {
    resp = await axios.get(`https://testnet.dcrdata.org/insight/api/utils/estimatefee?nbBlocks=1`, {
      params: { nbBlocks: 1 },
    })
  }
  const response: DcrUTXO[] = resp?.data
  const key = '1' // keep the ts linter happy
  return 10000 * Number(response[key as never]) // resp is DCR/KB, need ATOMs/B
}
