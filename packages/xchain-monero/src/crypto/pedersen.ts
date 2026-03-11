/**
 * Pedersen commitment scheme for Monero.
 * C = mask*G + amount*H
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE } from '@noble/curves/abstract/utils'

const ExtPoint = ed25519.ExtendedPoint
type Point = InstanceType<typeof ExtPoint>

// Monero's second generator H, hardcoded from rctTypes.h.
// Historically derived via toPoint(cn_fast_hash(G)), now a consensus constant.
const H_HEX = '8b655970153799af2aeadc9ff1add0ea6c7251d54154cfa92c173a0dd39c1f94'
let _H: Point | null = null

/**
 * Get the Pedersen generator H.
 */
export function getH(): Point {
  if (_H === null) {
    _H = ExtPoint.fromHex(H_HEX)
  }
  return _H
}

/**
 * Create a Pedersen commitment: C = mask*G + amount*H
 * @param mask - Blinding factor (32-byte scalar LE)
 * @param amount - Amount to commit to (bigint)
 */
export function commit(mask: Uint8Array, amount: bigint): Point {
  const maskScalar = bytesToNumberLE(mask)
  const H = getH()

  const maskG = ExtPoint.BASE.multiply(maskScalar)
  const amountH = H.multiply(amount)

  return maskG.add(amountH)
}

/**
 * Create a zero-mask commitment for fees: C = 0*G + amount*H = amount*H
 * Used for fee commitments where the mask is publicly known to be 0.
 */
export function zeroCommit(amount: bigint): Point {
  return getH().multiply(amount)
}
