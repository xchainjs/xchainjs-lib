/* eslint-disable ordered-imports/ordered-imports */
// import * as UtxoLib from '@bitgo/utxo-lib'
import { Balance, Network } from '@xchainjs/xchain-client'
import { AssetZEC, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as sochain from './sochain-api'
import { AddressParams, ZecAddressDTO } from './types/sochain-api-types'
import { Network as ZecNetwork } from './types/zcashjs-types'
import coininfo from 'coininfo'
import { TX_FEE } from './const'

export const ZEC_DECIMAL = 8

/**
 * Get Litecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {UtxoLib.Network} Valid UtxoLib Network
 */
export const zecNetwork = (network: Network): ZecNetwork => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      // return UtxoLib.networks.zcash
      return coininfo.zcash.main.toBitcoinJS()
    case Network.Testnet:
      // return UtxoLib.networks.zcashTest
      return coininfo.zcash.main.toBitcoinJS()
  }
}

/**
 * Get the balances of an address.
 *
 * @param {AddressParams} params
 * @returns {Balance[]} The balances of the given address.
 */
export const getBalance = async (params: AddressParams): Promise<Balance[]> => {
  try {
    const balance = await sochain.getBalance(params)
    return [
      {
        asset: AssetZEC,
        amount: balance,
      },
    ]
  } catch (error) {
    throw new Error(`Could not get balances for address ${params.address}`)
  }
}

/**
 * Get the balances of an address.
 *
 * @param {AddressParams} params
 * @returns {Balance[]} The balances of the given address.
 */
export const getAddress = async (params: AddressParams): Promise<ZecAddressDTO> => {
  try {
    const address = await sochain.getAddress(params)
    return address
  } catch (error) {
    throw new Error(`Could not get balances for address ${params.address}`)
  }
}

/**
 * Get the transaction fee.
 *
 * @param {UTXO[]} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {BaseAmount} The fee amount.
 */
export function getFee(): BaseAmount {
  return baseAmount(TX_FEE)
}
