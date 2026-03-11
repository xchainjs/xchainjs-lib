/**
 * ECDH-based amount encryption/decryption for Monero RingCT.
 *
 * Shared secret: ss = 8 * r * A (or 8 * a * R)
 * Amount mask: first 8 bytes of keccak256("amount" || Hs(ss || index))
 * Encrypted amount: XOR of 8-byte LE amount with mask
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'
import { keccak_256 } from '@noble/hashes/sha3'

import { scReduce32 } from '../utils'

const ExtPoint = ed25519.ExtendedPoint

/**
 * Derive the shared secret scalar for amount encryption.
 * Hs(r*A || i) — same derivation as stealth address.
 */
function derivationToScalar(sharedSecret: Uint8Array, outputIndex: number): Uint8Array {
  const indexBytes = encodeVarint(outputIndex)
  const combined = new Uint8Array(sharedSecret.length + indexBytes.length)
  combined.set(sharedSecret, 0)
  combined.set(indexBytes, sharedSecret.length)
  return scReduce32(keccak_256(combined))
}

function encodeVarint(n: number): Uint8Array {
  const bytes: number[] = []
  while (n >= 0x80) {
    bytes.push((n & 0x7f) | 0x80)
    n >>>= 7
  }
  bytes.push(n & 0x7f)
  return new Uint8Array(bytes)
}

/**
 * Generate the amount mask for XOR encryption.
 * mask = keccak256("amount" || scalar)[0..8]
 */
function amountMask(scalar: Uint8Array): Uint8Array {
  const prefix = new TextEncoder().encode('amount')
  const data = new Uint8Array(prefix.length + scalar.length)
  data.set(prefix, 0)
  data.set(scalar, prefix.length)
  return keccak_256(data).slice(0, 8)
}

/**
 * Derive ECDH shared secret point from tx private key and recipient's public view key.
 * Returns the compressed point bytes of r*A.
 */
export function deriveSharedSecret(txPrivKey: Uint8Array, pubViewKey: Uint8Array): Uint8Array {
  const rScalar = bytesToNumberLE(txPrivKey)
  const A = ExtPoint.fromHex(pubViewKey)
  // Monero derivation: 8*r*A (cofactor multiplication)
  return A.multiply(rScalar).multiply(BigInt(8)).toRawBytes()
}

/**
 * Encrypt an amount using ECDH-derived mask.
 * @param amount - Amount in piconero (bigint)
 * @param sharedSecret - ECDH shared secret (r*A compressed bytes)
 * @param outputIndex - Output index for key derivation
 * @returns 8-byte encrypted amount
 */
export function encryptAmount(amount: bigint, sharedSecret: Uint8Array, outputIndex: number): Uint8Array {
  const scalar = derivationToScalar(sharedSecret, outputIndex)
  const mask = amountMask(scalar)
  const amountBytes = numberToBytesLE(amount, 8)

  const encrypted = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    encrypted[i] = amountBytes[i] ^ mask[i]
  }
  return encrypted
}

/**
 * Decrypt an amount using ECDH-derived mask.
 * @param encrypted - 8-byte encrypted amount
 * @param sharedSecret - ECDH shared secret (a*R compressed bytes)
 * @param outputIndex - Output index for key derivation
 * @returns Decrypted amount in piconero
 */
export function decryptAmount(encrypted: Uint8Array, sharedSecret: Uint8Array, outputIndex: number): bigint {
  const scalar = derivationToScalar(sharedSecret, outputIndex)
  const mask = amountMask(scalar)

  const decrypted = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    decrypted[i] = encrypted[i] ^ mask[i]
  }

  return bytesToNumberLE(decrypted)
}
