import { Balance, Network, TxHash } from '@xchainjs/xchain-client'
import { Address, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UTXO } from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'
import coininfo from 'coininfo'

import { AssetLTC, LTC_DECIMAL } from './const'
import * as nodeApi from './node-api'
import * as sochain from './sochain-api'
import { BroadcastTxParams } from './types/common'
import { AddressParams, LtcAddressUTXO, ScanUTXOParam } from './types/sochain-api-types'

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1 //9
export const TX_OUTPUT_PUBKEYHASH = 25

export function inputBytes(input: UTXO): number {
  return TX_INPUT_BASE + (input.witnessUtxo?.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

/**
 * Get the average value of an array.
 *
 * @param {number[]} array
 * @returns {number} The average value.
 */
export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get Litecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Litecoin.Network} The LTC network.
 */
export const ltcNetwork = (network: Network): Litecoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return coininfo.litecoin.main.toBitcoinJS()
    case Network.Testnet:
      return coininfo.litecoin.test.toBitcoinJS()
  }
}

/**
 * Get the balances of an address.
 *
 * @param {AddressParams} params
 * @returns {Balance[]} The balances of the given address.
 */
export const getBalance = async (params: {
  apiKey: string
  sochainUrl: string
  network: Network
  address: string
}): Promise<Balance[]> => {
  try {
    const balance = await sochain.getBalance(params)
    return [
      {
        asset: AssetLTC,
        amount: balance,
      },
    ]
  } catch (error) {
    throw new Error(`Could not get balances for address ${params.address}`)
  }
}

/**
 * Validate the LTC address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Litecoin.address.toOutputScript(address, ltcNetwork(network))
    return true
  } catch (error) {
    return false
  }
}

/**
 * Scan UTXOs from sochain.
 *
 * @param {ScanUTXOParam} params
 * @returns {UTXO[]} The UTXOs of the given address.
 */
export const scanUTXOs = async ({ apiKey, sochainUrl, network, address }: ScanUTXOParam): Promise<UTXO[]> => {
  const addressParam: AddressParams = {
    apiKey,
    sochainUrl,
    network,
    address,
    page: 1,
  }

  const utxos: LtcAddressUTXO[] = await sochain.getUnspentTxs(addressParam)

  return await Promise.all(
    utxos.map(async (utxo) => ({
      hash: utxo.hash,
      index: utxo.index,
      value: assetToBase(assetAmount(utxo.value, LTC_DECIMAL)).amount().toNumber(),
      witnessUtxo: {
        value: assetToBase(assetAmount(utxo.value, LTC_DECIMAL)).amount().toNumber(),
        script: Buffer.from(utxo.script, 'hex'),
      },
      txHex: utxo.tx_hex,
    })),
  )
}

/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  return await nodeApi.broadcastTx(params)
}

/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'ltc1'
    case Network.Testnet:
      return 'tltc1'
  }
}
