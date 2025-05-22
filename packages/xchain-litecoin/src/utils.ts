import { Balance, Network, TxHash } from '@xchainjs/xchain-client'
import { Address, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UTXO, toBitcoinJS } from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'

import { AssetLTC, LTC_DECIMAL } from './const'
import * as nodeApi from './node-api'
import * as sochain from './sochain-api'
import { BroadcastTxParams } from './types/common'
import { AddressParams, LtcAddressUTXO, ScanUTXOParam } from './types/sochain-api-types'

/**
 * Size of an empty transaction in bytes.
 */
export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 // 10

/**
 * Base size of a transaction input in bytes.
 */
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41

/**
 * Size of a transaction input with a pubkey hash in bytes.
 */
export const TX_INPUT_PUBKEYHASH = 107

/**
 * Base size of a transaction output in bytes.
 */
export const TX_OUTPUT_BASE = 8 + 1 // 9

/**
 * Size of a transaction output with a pubkey hash in bytes.
 */
export const TX_OUTPUT_PUBKEYHASH = 25

/**
 * Calculate the size of a transaction input in bytes.
 *
 * @param {UTXO} input The UTXO.
 * @returns {number} The size of the transaction input.
 */
export function inputBytes(input: UTXO): number {
  return TX_INPUT_BASE + (input.witnessUtxo?.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

/**
 * Calculate the average value of an array.
 *
 * @param {number[]} array The array of numbers.
 * @returns {number} The average value of the array.
 */
export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get the Litecoin network to be used with bitcoinjs.
 *
 * @param {Network} network The network identifier.
 * @returns {Litecoin.Network} The Litecoin network.
 */
export const ltcNetwork = (network: Network): Litecoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return toBitcoinJS('litecoin', 'main') as Litecoin.Network
    case Network.Testnet:
      return toBitcoinJS('litecoin', 'test') as Litecoin.Network
  }
}

/**
 * Get the balance of an address.
 *
 * @param {AddressParams} params The parameters for fetching the balance.
 * @returns {Balance[]} The balance of the address.
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
 * Validate a Litecoin address.
 *
 * @param {Address} address The Litecoin address to validate.
 * @param {Network} network The network identifier.
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
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
 * Scan UTXOs from the Sochain API.
 *
 * @param {ScanUTXOParam} params The parameters for scanning UTXOs.
 * @returns {Promise<UTXO[]>} The UTXOs of the address.
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
 * Broadcast a transaction.
 *
 * @param {BroadcastTxParams} params The parameters for broadcasting the transaction.
 * @returns {Promise<TxHash>} The hash of the broadcasted transaction.
 */
export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  return await nodeApi.broadcastTx(params)
}

/**
 * Get the address prefix based on the network.
 *
 * @param {Network} network The network identifier.
 * @returns {string} The address prefix based on the network.
 **/
export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'ltc1'
    case Network.Testnet:
      return 'tltc1'
  }
}
