import { Address, FeeRate, Network } from '@xchainjs/xchain-client'

export type NormalTxParams = { addressTo: Address; amount: number; feeRate: FeeRate }
export type VaultTxParams = NormalTxParams & { memo: string }

export type GetChangeParams = {
  valueOut: number
  sochainUrl: string
  network: Network
  address: Address
}

export type ClientUrl = Record<Network, string>
