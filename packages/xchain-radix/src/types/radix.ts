import { Value } from '@radixdlt/radix-engine-toolkit'
import {
  Balance as BaseBalance,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxParams as BaseTxParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Address, Asset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset

export type Transaction = {
  manifest: string
  start_epoch_inclusive: number
  end_epoch_exclusive: number
  tip_percentage: number
  nonce: number
  signer_public_keys: SignerPublicKey[]
  flags: TransactionFlag
}

type SignerPublicKey = {
  key_type: string
  key_hex: string
}

type TransactionFlag = {
  use_free_credit: boolean
  assume_all_signature_proofs: boolean
  skip_epoch_check: boolean
}

export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

export type TxFrom = BaseTxFrom & {
  asset?: CompatibleAsset
}

export type TxTo = BaseTxTo & {
  asset?: CompatibleAsset
}

export type Tx = BaseTx & {
  asset: CompatibleAsset
  from: TxFrom[]
  to: TxTo[]
}

export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}

export type MethodToCall = {
  address: Address
  methodName: string
  params: Value[]
}

export type TxParams = BaseTxParams & {
  asset?: CompatibleAsset
  methodToCall?: MethodToCall
}
