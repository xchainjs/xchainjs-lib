import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE } from '@noble/curves/abstract/utils'
import { keccak_256 } from '@noble/hashes/sha3'

import { scReduce32 } from '../utils'

/**
 * Derives an ed25519 public key from a raw private key scalar.
 * Unlike standard EdDSA (which applies SHA-512 + clamping), Monero uses the raw scalar directly.
 */
export const secretKeyToPublicKey = (privateKey: Uint8Array): Uint8Array => {
  const scalar = bytesToNumberLE(privateKey)
  return ed25519.ExtendedPoint.BASE.multiply(scalar).toRawBytes()
}

/**
 * Derives the private view key from a private spend key.
 * view_key = sc_reduce32(keccak256(spend_key))
 */
export const derivePrivateViewKey = (privateSpendKey: Uint8Array): Uint8Array => {
  const hash = keccak_256(privateSpendKey)
  return scReduce32(hash)
}

/**
 * Derives all four Monero keys from a private spend key.
 */
export const deriveKeyPairs = (
  privateSpendKey: Uint8Array,
): {
  privateSpendKey: Uint8Array
  publicSpendKey: Uint8Array
  privateViewKey: Uint8Array
  publicViewKey: Uint8Array
} => {
  const publicSpendKey = secretKeyToPublicKey(privateSpendKey)
  const privateViewKey = derivePrivateViewKey(privateSpendKey)
  const publicViewKey = secretKeyToPublicKey(privateViewKey)

  return {
    privateSpendKey,
    publicSpendKey,
    privateViewKey,
    publicViewKey,
  }
}
