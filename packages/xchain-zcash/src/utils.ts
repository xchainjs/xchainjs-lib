import * as UtxoLib from '@bitgo/utxo-lib'
import { Balance, Network } from '@xchainjs/xchain-client'
import { AssetZEC } from '@xchainjs/xchain-util'
import * as sochain from './sochain-api'

import { AddressParams, ZecAddressDTO } from './types/sochain-api-types'

export const ZEC_DECIMAL = 8

/**
 * Get Litecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {UtxoLib.Network} Valid UtxoLib Network
 */
export const zecNetwork = (network: Network): UtxoLib.Network => {
  switch (network) {
    case Network.Mainnet:
      return UtxoLib.networks.zcash
    case Network.Testnet:
      return UtxoLib.networks.zcashTest
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
