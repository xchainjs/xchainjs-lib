/**
 * Monero transaction binary serialization.
 * Reference: monero/src/cryptonote_basic/cryptonote_format_utils.cpp
 */

import { keccak_256 } from '@noble/hashes/sha3'

import type { MoneroTransaction, TxInput, TxOutput, RctSignatures, ClsagSig, BPPlusProof } from './types'

/**
 * Encode a number as a Monero varint (7 bits per byte, MSB = continuation flag).
 */
export function writeVarint(n: bigint | number): Uint8Array {
  let val = typeof n === 'number' ? BigInt(n) : n
  const bytes: number[] = []
  while (val >= BigInt(0x80)) {
    bytes.push(Number(val & BigInt(0x7f)) | 0x80)
    val >>= BigInt(7)
  }
  bytes.push(Number(val & BigInt(0x7f)))
  return new Uint8Array(bytes)
}

/**
 * Helper class for building binary buffers.
 */
class TxWriter {
  private parts: Uint8Array[] = []

  writeBytes(data: Uint8Array): void {
    this.parts.push(data)
  }

  writeVarint(n: bigint | number): void {
    this.parts.push(writeVarint(n))
  }

  writeKey(key: Uint8Array): void {
    if (key.length !== 32) throw new Error(`Expected 32-byte key, got ${key.length}`)
    this.parts.push(key)
  }

  writeByte(b: number): void {
    this.parts.push(new Uint8Array([b]))
  }

  toBytes(): Uint8Array {
    const totalLen = this.parts.reduce((sum, p) => sum + p.length, 0)
    const result = new Uint8Array(totalLen)
    let offset = 0
    for (const part of this.parts) {
      result.set(part, offset)
      offset += part.length
    }
    return result
  }
}

function serializeInput(w: TxWriter, input: TxInput): void {
  w.writeByte(0x02) // txin_to_key tag
  w.writeVarint(input.amount)
  w.writeVarint(input.keyOffsets.length)
  for (const offset of input.keyOffsets) {
    w.writeVarint(offset)
  }
  w.writeKey(input.keyImage)
}

function serializeOutput(w: TxWriter, output: TxOutput): void {
  w.writeVarint(output.amount)
  w.writeByte(0x03) // txout_to_tagged_key variant tag
  w.writeKey(output.key)
  w.writeByte(output.viewTag) // 1-byte view tag for fast scanning
}

/**
 * Serialize the transaction prefix (everything except RingCT signatures).
 */
export function serializeTxPrefix(tx: MoneroTransaction): Uint8Array {
  const w = new TxWriter()

  w.writeVarint(tx.version)
  w.writeVarint(tx.unlockTime)

  // Inputs
  w.writeVarint(tx.inputs.length)
  for (const input of tx.inputs) {
    serializeInput(w, input)
  }

  // Outputs
  w.writeVarint(tx.outputs.length)
  for (const output of tx.outputs) {
    serializeOutput(w, output)
  }

  // Extra
  w.writeVarint(tx.extra.length)
  w.writeBytes(tx.extra)

  return w.toBytes()
}

/**
 * Compute the transaction prefix hash (keccak256 of serialized prefix).
 * This is the message signed by CLSAG.
 */
export function txPrefixHash(tx: MoneroTransaction): Uint8Array {
  return keccak_256(serializeTxPrefix(tx))
}

/**
 * Serialize the RCT signature base (type, fee, encrypted amounts, output commitments).
 */
export function serializeRctBase(rct: RctSignatures): Uint8Array {
  const w = new TxWriter()

  w.writeByte(rct.type)
  w.writeVarint(rct.txnFee)

  // Encrypted amounts (8 bytes each for v2)
  for (const ecdh of rct.ecdhInfo) {
    w.writeBytes(ecdh)
  }

  // Output commitments
  for (const outPk of rct.outPk) {
    w.writeKey(outPk)
  }

  return w.toBytes()
}

/**
 * Serialize a CLSAG signature.
 */
export function serializeClsag(sig: ClsagSig): Uint8Array {
  const w = new TxWriter()

  // s scalars
  for (const s of sig.s) {
    w.writeKey(s)
  }

  // c1 challenge
  w.writeKey(sig.c1)

  // D (commitment key image, already scaled by 1/8)
  w.writeKey(sig.D)

  return w.toBytes()
}

/**
 * Serialize a Bulletproofs+ proof.
 */
export function serializeBPPlus(proof: BPPlusProof): Uint8Array {
  const w = new TxWriter()

  w.writeKey(proof.A)
  w.writeKey(proof.A1)
  w.writeKey(proof.B)
  w.writeKey(proof.r1)
  w.writeKey(proof.s1)
  w.writeKey(proof.d1)

  // L and R vectors
  w.writeVarint(proof.L.length)
  for (const l of proof.L) {
    w.writeKey(l)
  }
  for (const r of proof.R) {
    w.writeKey(r)
  }

  return w.toBytes()
}

/**
 * Serialize the prunable RCT data (pseudo-outputs, CLSAGs, BP+ proofs).
 */
export function serializeRctPrunable(rct: RctSignatures): Uint8Array {
  const w = new TxWriter()

  // BP+ proofs count + data
  w.writeVarint(rct.bppProofs.length)
  for (const proof of rct.bppProofs) {
    w.writeBytes(serializeBPPlus(proof))
  }

  // CLSAGs
  for (const clsag of rct.clsags) {
    w.writeBytes(serializeClsag(clsag))
  }

  // Pseudo-outputs
  for (const po of rct.pseudoOuts) {
    w.writeKey(po)
  }

  return w.toBytes()
}

/**
 * Compute the RCT signature hash (message for CLSAG signing).
 * hash = keccak256(prefixHash || keccak256(rctBase) || keccak256(rctPrunable))
 */
export function rctSigHash(prefixHash: Uint8Array, rctBase: Uint8Array, rctPrunable: Uint8Array): Uint8Array {
  const combined = new Uint8Array(96)
  combined.set(prefixHash, 0)
  combined.set(keccak_256(rctBase), 32)
  combined.set(keccak_256(rctPrunable), 64)
  return keccak_256(combined)
}

/**
 * Serialize a complete transaction.
 */
export function serializeTransaction(tx: MoneroTransaction): Uint8Array {
  const w = new TxWriter()

  w.writeBytes(serializeTxPrefix(tx))
  w.writeBytes(serializeRctBase(tx.rctSignatures))
  w.writeBytes(serializeRctPrunable(tx.rctSignatures))

  return w.toBytes()
}
