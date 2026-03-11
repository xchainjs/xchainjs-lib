/**
 * Monero transaction types for RCTTypeCLSAG transactions.
 */

/** A transaction input (key input) */
export interface TxInput {
  amount: bigint
  keyOffsets: bigint[]
  keyImage: Uint8Array // 32 bytes
}

/** A transaction output */
export interface TxOutput {
  amount: bigint
  key: Uint8Array // 32-byte one-time public key
  viewTag: number // 1-byte view tag for fast scanning
}

/** CLSAG signature for one input */
export interface ClsagSig {
  s: Uint8Array[] // n response scalars (32 bytes each)
  c1: Uint8Array // 32-byte initial challenge
  D: Uint8Array // 32-byte commitment key image (scaled by 1/8)
}

/** Bulletproofs+ range proof */
export interface BPPlusProof {
  A: Uint8Array
  A1: Uint8Array
  B: Uint8Array
  r1: Uint8Array
  s1: Uint8Array
  d1: Uint8Array
  L: Uint8Array[]
  R: Uint8Array[]
}

/** RingCT signatures (type 6 = RCTTypeBulletproofPlus) */
export interface RctSignatures {
  type: number // 6 for RCTTypeBulletproofPlus
  txnFee: bigint
  ecdhInfo: Uint8Array[] // 8-byte encrypted amounts
  outPk: Uint8Array[] // 32-byte output commitments
  pseudoOuts: Uint8Array[] // 32-byte pseudo-output commitments
  clsags: ClsagSig[]
  bppProofs: BPPlusProof[]
}

/** Complete Monero transaction */
export interface MoneroTransaction {
  version: number // 2
  unlockTime: bigint
  inputs: TxInput[]
  outputs: TxOutput[]
  extra: Uint8Array
  rctSignatures: RctSignatures
}

/** Ring member (decoy or real) with public key and commitment */
export interface RingMember {
  dest: Uint8Array // 32-byte one-time public key
  mask: Uint8Array // 32-byte commitment
}
