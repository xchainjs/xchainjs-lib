/**
 * Monero stealth address (one-time address) derivation.
 *
 * Output key: P = Hs(r*A || i)*G + B
 * - r: tx private key
 * - A: recipient's public view key
 * - B: recipient's public spend key
 * - i: output index
 * - Hs: keccak256 -> sc_reduce32 (hash to scalar)
 *
 * Input key recovery: x = Hs(a*R || i) + b
 * - a: recipient's private view key
 * - R: tx public key (r*G)
 * - b: recipient's private spend key
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'
import { keccak_256 } from '@noble/hashes/sha3'

import { scReduce32 } from '../utils'

const ExtPoint = ed25519.ExtendedPoint
type Point = InstanceType<typeof ExtPoint>

/**
 * Hash to scalar: Hs(data) = sc_reduce32(keccak256(data))
 */
function hashToScalar(data: Uint8Array): Uint8Array {
  return scReduce32(keccak_256(data))
}

/**
 * Concatenate buffers with a varint output index.
 */
function deriveKeyData(sharedSecret: Point, outputIndex: number): Uint8Array {
  const secretBytes = sharedSecret.toRawBytes()
  // Encode output index as varint (simple case: single byte for index < 128)
  const indexBytes = encodeVarint(outputIndex)
  const combined = new Uint8Array(secretBytes.length + indexBytes.length)
  combined.set(secretBytes, 0)
  combined.set(indexBytes, secretBytes.length)
  return combined
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
 * Derive the one-time output public key for a transaction output.
 * P = Hs(r*A || i)*G + B
 *
 * @param txPrivKey - Transaction private key r (32 bytes)
 * @param recipPubViewKey - Recipient's public view key A (32 bytes)
 * @param recipPubSpendKey - Recipient's public spend key B (32 bytes)
 * @param outputIndex - Output index i
 * @returns One-time public key P (32 bytes)
 */
export function deriveOutputKey(
  txPrivKey: Uint8Array,
  recipPubViewKey: Uint8Array,
  recipPubSpendKey: Uint8Array,
  outputIndex: number,
): Uint8Array {
  const rScalar = bytesToNumberLE(txPrivKey)
  const A = ExtPoint.fromHex(recipPubViewKey)
  const B = ExtPoint.fromHex(recipPubSpendKey)

  // Monero derivation: 8*r*A (cofactor multiplication)
  const rA = A.multiply(rScalar).multiply(BigInt(8))

  // Hs(r*A || i)
  const keyData = deriveKeyData(rA, outputIndex)
  const hsBytes = hashToScalar(keyData)
  const hs = bytesToNumberLE(hsBytes)

  // P = Hs(r*A || i)*G + B
  const hsG = ExtPoint.BASE.multiply(hs)
  return hsG.add(B).toRawBytes()
}

/**
 * Derive the one-time private key for spending a received output.
 * x = Hs(a*R || i) + b
 *
 * @param txPubKey - Transaction public key R = r*G (32 bytes)
 * @param privViewKey - Recipient's private view key a (32 bytes)
 * @param privSpendKey - Recipient's private spend key b (32 bytes)
 * @param outputIndex - Output index i
 * @returns One-time private key x (32 bytes)
 */
export function deriveInputKey(
  txPubKey: Uint8Array,
  privViewKey: Uint8Array,
  privSpendKey: Uint8Array,
  outputIndex: number,
): Uint8Array {
  const aScalar = bytesToNumberLE(privViewKey)
  const R = ExtPoint.fromHex(txPubKey)

  // Monero derivation: 8*a*R (cofactor multiplication)
  const aR = R.multiply(aScalar).multiply(BigInt(8))

  // Hs(8*a*R || i)
  const keyData = deriveKeyData(aR, outputIndex)
  const hsBytes = hashToScalar(keyData)
  const hs = bytesToNumberLE(hsBytes)

  // x = Hs(8*a*R || i) + b
  const b = bytesToNumberLE(privSpendKey)
  const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')
  const x = (hs + b) % L

  return numberToBytesLE(x, 32)
}

/**
 * Check if an output belongs to us.
 * Computes P' = Hs(a*R || i)*G + B and checks if P' == P.
 *
 * @param txPubKey - Transaction public key R (32 bytes)
 * @param privViewKey - Our private view key a (32 bytes)
 * @param pubSpendKey - Our public spend key B (32 bytes)
 * @param outputKey - The output's public key P (32 bytes)
 * @param outputIndex - Output index i
 * @returns true if the output belongs to us
 */
export function isOutputForUs(
  txPubKey: Uint8Array,
  privViewKey: Uint8Array,
  pubSpendKey: Uint8Array,
  outputKey: Uint8Array,
  outputIndex: number,
): boolean {
  const aScalar = bytesToNumberLE(privViewKey)
  const R = ExtPoint.fromHex(txPubKey)
  const B = ExtPoint.fromHex(pubSpendKey)

  // Monero derivation: 8*a*R (cofactor multiplication)
  const aR = R.multiply(aScalar).multiply(BigInt(8))
  const keyData = deriveKeyData(aR, outputIndex)
  const hsBytes = hashToScalar(keyData)
  const hs = bytesToNumberLE(hsBytes)

  const expectedP = ExtPoint.BASE.multiply(hs).add(B)
  const actualP = ExtPoint.fromHex(outputKey)

  return expectedP.equals(actualP)
}
