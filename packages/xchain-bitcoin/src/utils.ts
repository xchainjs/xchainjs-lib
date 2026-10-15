import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'

import { AddressFormat } from './types'

export const arrayAverage = (array: number[]): number => {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

export const btcNetwork = (network: Network): Bitcoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return Bitcoin.networks.bitcoin
    case Network.Testnet:
      return Bitcoin.networks.testnet
  }
}

export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Bitcoin.address.toOutputScript(address, btcNetwork(network))
    return true
  } catch {
    return false
  }
}

export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'bc1'
    case Network.Testnet:
      return 'tb1'
  }
}

export const toXOnly = (pubKey: Buffer): Buffer => (pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33))

// Shared by address derivation and P2SH-P2WPKH redeem script construction to avoid drift.
export const getPaymentForFormat = (
  format: AddressFormat,
  pubkey: Buffer,
  network: Bitcoin.Network,
): Bitcoin.payments.Payment => {
  switch (format) {
    case AddressFormat.P2WPKH:
      return Bitcoin.payments.p2wpkh({ pubkey, network })
    case AddressFormat.P2TR:
      return Bitcoin.payments.p2tr({ internalPubkey: toXOnly(pubkey), network })
    case AddressFormat.P2PKH:
      return Bitcoin.payments.p2pkh({ pubkey, network })
    case AddressFormat.P2SH_P2WPKH:
      return Bitcoin.payments.p2sh({ redeem: Bitcoin.payments.p2wpkh({ pubkey, network }), network })
  }
}
