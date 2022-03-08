import { Address, FeeRate, Network } from '@xchainjs/xchain-client'

export type NormalTxParams = { addressTo: Address; amount: number; feeRate: FeeRate }
export type VaultTxParams = NormalTxParams & { memo: string }

export type GetChangeParams = {
  valueOut: number
  dcrdataUrl: string
  network: Network
  address: Address
}
