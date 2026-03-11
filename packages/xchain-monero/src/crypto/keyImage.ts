/**
 * Key image generation for Monero ring signatures.
 * KI = x * Hp(P) where x is the private key and P is the public key.
 */

import { bytesToNumberLE } from '@noble/curves/abstract/utils'

import { hashToPoint } from './hashToPoint'

/**
 * Generate a key image from a private/public key pair.
 * KI = x * Hp(P)
 * @param privKey - Private key (32-byte scalar LE)
 * @param pubKey - Corresponding public key (32-byte compressed point)
 * @returns Key image as 32-byte compressed point
 */
export function generateKeyImage(privKey: Uint8Array, pubKey: Uint8Array): Uint8Array {
  const hp = hashToPoint(pubKey)
  const scalar = bytesToNumberLE(privKey)
  return hp.multiply(scalar).toRawBytes()
}
