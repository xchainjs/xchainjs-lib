import { FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

export type NormalTxParams = { addressTo: Address; amount: number; feeRate: FeeRate }
export type VaultTxParams = NormalTxParams & { memo: string }

export type GetChangeParams = {
  valueOut: number
  sochainUrl: string
  network: Network
  address: Address
}

export type ClientUrl = Record<Network, string>

export enum AddressFormat {
  P2WPKH,
  P2TR,
  P2PKH, // BIP44 legacy, addresses starting with "1..."
  P2SH_P2WPKH, // BIP49 nested segwit, addresses starting with "3..."
}
