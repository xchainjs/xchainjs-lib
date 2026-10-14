import { Network, TxType } from '@xchainjs/xchain-client'
import { Address, baseAmount } from '@xchainjs/xchain-util'
import { Tx, TxFrom, TxTo } from '@xchainjs/xchain-utxo'
import * as bchaddr from './bchaddrjs'
import bitcore from 'bitcore-lib-cash'
import { AssetBCH, BCH_DECIMAL } from './const'
import { Transaction, TransactionInput, TransactionOutput } from './types'

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4
export const TX_INPUT_BASE = 32 + 4 + 1 + 4
export const TX_INPUT_PUBKEYHASH = 107
export const TX_OUTPUT_BASE = 8 + 1
export const TX_OUTPUT_PUBKEYHASH = 25

export const bchNetwork = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return bitcore.Networks.mainnet
    case Network.Testnet:
      return bitcore.Networks.testnet
  }
}

export const getPrefix = (): string => ''

export const stripPrefix = (address: Address): Address => address.replace(/(bchtest:|bitcoincash:)/, '')

export const toLegacyAddress = (address: Address): Address => {
  return bchaddr.toLegacyAddress(address)
}

export const toCashAddress = (address: Address): Address => {
  return bchaddr.toCashAddress(address)
}

export const isCashAddress = (address: Address): boolean => {
  return bchaddr.isCashAddress(address)
}

export const parseTransaction = (tx: Transaction): Tx => {
  return {
    asset: AssetBCH,
    from: tx.inputs
      .filter((input): input is Omit<TransactionInput, 'address'> & { address: string } => !!input.address)
      .map(
        (input) =>
          ({
            from: stripPrefix(input.address),
            amount: baseAmount(input.value, BCH_DECIMAL),
          } as TxFrom),
      ),
    to: tx.outputs
      .filter((output): output is Omit<TransactionOutput, 'address'> & { address: string } => !!output.address)
      .map(
        (output) =>
          ({
            to: stripPrefix(output.address),
            amount: baseAmount(output.value, BCH_DECIMAL),
          } as TxTo),
      ),
    date: new Date(tx.time * 1000),
    type: TxType.Transfer,
    hash: tx.txid,
  }
}

export const toBCHAddressNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return bchaddr.Network.Mainnet
    case Network.Testnet:
      return bchaddr.Network.Testnet
  }
}

export const validateAddress = (address: string, network: Network): boolean => {
  const toAddress = toCashAddress(address)
  return bchaddr.isValidAddress(toAddress) && bchaddr.detectAddressNetwork(toAddress) === toBCHAddressNetwork(network)
}
