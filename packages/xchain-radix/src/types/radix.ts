import { FungibleResourcesCollection, NonFungibleResourcesCollection } from '@radixdlt/babylon-gateway-api-sdk'

type LedgerState = {
  network: string
  state_version: number
  proposer_round_timestamp: string
  epoch: number
  round: number
}

type EntityDetails = {
  address: string
  fungible_resources: FungibleResourcesCollection
  non_fungible_resources: NonFungibleResourcesCollection
  metadata: any
  details: any
}

export type EntityDetailsResponse = {
  ledger_state: LedgerState
  items: EntityDetails[]
}

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
