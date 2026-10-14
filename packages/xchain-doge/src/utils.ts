import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { toBitcoinJS } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib'

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 // 10
export const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1 // 9
export const TX_OUTPUT_PUBKEYHASH = 25

export function inputBytes(): number {
  return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH
}

export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

export const dogeNetwork = (network: Network): Dogecoin.networks.Network => {
  switch (network) {
    case Network.Mainnet:
      return toBitcoinJS('dogecoin', 'main') as Dogecoin.networks.Network
    case Network.Stagenet:
      return toBitcoinJS('dogecoin', 'main') as Dogecoin.networks.Network
    case Network.Testnet: {
      return toBitcoinJS('dogecoin', 'test') as Dogecoin.networks.Network
    }
  }
}

export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Dogecoin.address.toOutputScript(address, dogeNetwork(network))
    return true
  } catch (_error) {
    return false
  }
}

export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return ''
    case Network.Testnet:
      return 'n'
  }
}
