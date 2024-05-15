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
