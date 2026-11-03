import { Balance, Network, TxHash } from '@xchainjs/xchain-client'
import { Address, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UTXO, toBitcoinJS } from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'

import { AssetLTC, LTC_DECIMAL } from './const'
import * as nodeApi from './node-api'
import * as sochain from './sochain-api'
import { BroadcastTxParams } from './types/common'
import { AddressParams, LtcAddressUTXO, ScanUTXOParam } from './types/sochain-api-types'

export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

export const ltcNetwork = (network: Network): Litecoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return toBitcoinJS('litecoin', 'main') as Litecoin.Network
    case Network.Testnet:
      return toBitcoinJS('litecoin', 'test') as Litecoin.Network
  }
}

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
  } catch (_error) {
    throw new Error(`Could not get balances for address ${params.address}`)
  }
}

export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Litecoin.address.toOutputScript(address, ltcNetwork(network))
    return true
  } catch (_error) {
    return false
  }
}

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

export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  return await nodeApi.broadcastTx(params)
}

export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'ltc1'
    case Network.Testnet:
      return 'tltc1'
  }
}
