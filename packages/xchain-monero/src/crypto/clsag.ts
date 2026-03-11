/**
 * CLSAG (Concise Linkable Spontaneous Anonymous Group) signature.
 * Used in Monero RingCT for input authorization + commitment balance proof.
 *
 * Reference: monero/src/ringct/rctSigs.cpp (CLSAG_Gen, verRctCLSAGSimple)
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE } from '@noble/curves/abstract/utils'

import { hashToPoint } from './hashToPoint'
import { concatBytes, hashToScalar, hexToBytes, scMul, scMulAdd, scMulSub, scReduce32 } from '../utils'
import type { ClsagSig, RingMember } from '../tx/types'

const ExtPoint = ed25519.ExtendedPoint

// Domain separators (ASCII zero-padded to 32 bytes)
function domainTag(s: string): Uint8Array {
  const tag = new Uint8Array(32)
  const encoded = new TextEncoder().encode(s)
  tag.set(encoded)
  return tag
}
const CLSAG_AGG_0 = domainTag('CLSAG_agg_0')
const CLSAG_AGG_1 = domainTag('CLSAG_agg_1')
const CLSAG_ROUND = domainTag('CLSAG_round')

// INV_EIGHT: modular inverse of 8 mod l (ed25519 group order)
const INV_EIGHT_HEX = '792fdce229e50661d0da1c7db39dd30700000000000000000000000000000006'
const INV_EIGHT = hexToBytes(INV_EIGHT_HEX)

/**
 * Generate a random 32-byte scalar reduced mod l.
 */
function randomScalar(): Uint8Array {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return scReduce32(bytes)
}

/**
 * CLSAG signing.
 *
 * @param message - 32-byte transaction prefix hash
 * @param ring - Ring members (dest + mask for each)
 * @param Cout - Pseudo-output commitment (C_offset)
 * @param secretKey - Signer's one-time private key (p)
 * @param secretMask - Commitment mask difference: z = input_mask - pseudo_out_mask
 * @param realIndex - Index of real signer in ring
 * @param keyImage - Pre-computed key image (p * Hp(P[l]))
 * @returns CLSAG signature
 */
export function clsagSign(
  message: Uint8Array,
  ring: RingMember[],
  Cout: Uint8Array,
  secretKey: Uint8Array,
  secretMask: Uint8Array,
  realIndex: number,
  keyImage: Uint8Array,
): ClsagSig {
  const n = ring.length
  const I = ExtPoint.fromHex(keyImage)

  // Hp(P[l]) — hash of real signer's public key
  const H = hashToPoint(ring[realIndex].dest)

  // D_full = z * Hp(P[l])
  const zScalar = bytesToNumberLE(secretMask)
  const D_full = H.multiply(zScalar)

  // sig.D = (1/8) * D_full
  const invEightScalar = bytesToNumberLE(INV_EIGHT)
  const D = D_full.multiply(invEightScalar)
  const DBytes = D.toRawBytes()

  // Extract ring keys as byte arrays
  const P = ring.map((m) => m.dest)
  const C_nonzero = ring.map((m) => m.mask)

  // Compute aggregation coefficients mu_P, mu_C
  const aggParts = [...P.map((p) => p), ...C_nonzero.map((c) => c), keyImage, DBytes, Cout]

  const muP = hashToScalar(concatBytes(CLSAG_AGG_0, ...aggParts))
  const muC = hashToScalar(concatBytes(CLSAG_AGG_1, ...aggParts))

  // Round hash prefix (constant across all rounds)
  const roundPrefix = concatBytes(CLSAG_ROUND, ...P, ...C_nonzero, Cout, message)

  // Step 3: Generate nonce
  const alpha = randomScalar()
  const alphaScalar = bytesToNumberLE(alpha)
  const aG = ExtPoint.BASE.multiply(alphaScalar)
  const aH = H.multiply(alphaScalar)

  // Initial challenge at signer's position
  let c = hashToScalar(concatBytes(roundPrefix, aG.toRawBytes(), aH.toRawBytes()))

  // Precompute C_offset point
  const CoutPoint = ExtPoint.fromHex(Cout)

  // Ring loop
  const s: Uint8Array[] = new Array(n)
  let c1: Uint8Array | undefined

  let i = (realIndex + 1) % n
  if (i === 0) c1 = c

  while (i !== realIndex) {
    s[i] = randomScalar()
    const sScalar = bytesToNumberLE(s[i])

    const cP = scMul(c, muP)
    const cC = scMul(c, muC)
    const cPScalar = bytesToNumberLE(cP)
    const cCScalar = bytesToNumberLE(cC)

    const Pi = ExtPoint.fromHex(P[i])
    const Ci = ExtPoint.fromHex(C_nonzero[i]).subtract(CoutPoint)

    // L = s[i]*G + c_p*P[i] + c_c*C[i]
    const L = ExtPoint.BASE.multiply(sScalar).add(Pi.multiply(cPScalar)).add(Ci.multiply(cCScalar))

    // R = s[i]*Hp(P[i]) + c_p*I + c_c*D_full
    const HpPi = hashToPoint(P[i])
    const R = HpPi.multiply(sScalar).add(I.multiply(cPScalar)).add(D_full.multiply(cCScalar))

    c = hashToScalar(concatBytes(roundPrefix, L.toRawBytes(), R.toRawBytes()))

    i = (i + 1) % n
    if (i === 0) c1 = c
  }

  // Final response: s[l] = alpha - c * (mu_P * p + mu_C * z)
  const muPp = scMul(muP, secretKey)
  const combined = scMulAdd(muC, secretMask, muPp)
  s[realIndex] = scMulSub(c, combined, alpha)

  if (c1 === undefined) c1 = c

  return { s, c1, D: DBytes }
}

/**
 * CLSAG verification.
 *
 * @param message - 32-byte transaction prefix hash
 * @param ring - Ring members (dest + mask for each)
 * @param Cout - Pseudo-output commitment
 * @param keyImage - Key image
 * @param sig - CLSAG signature to verify
 * @returns true if valid
 */
export function clsagVerify(
  message: Uint8Array,
  ring: RingMember[],
  Cout: Uint8Array,
  keyImage: Uint8Array,
  sig: ClsagSig,
): boolean {
  const n = ring.length
  const { s, c1, D: DBytes } = sig

  const I = ExtPoint.fromHex(keyImage)
  const D = ExtPoint.fromHex(DBytes)
  const D8 = D.multiply(BigInt(8))
  const CoutPoint = ExtPoint.fromHex(Cout)

  const P = ring.map((m) => m.dest)
  const C_nonzero = ring.map((m) => m.mask)

  // Recompute aggregation coefficients
  const aggParts = [...P, ...C_nonzero, keyImage, DBytes, Cout]

  const muP = hashToScalar(concatBytes(CLSAG_AGG_0, ...aggParts))
  const muC = hashToScalar(concatBytes(CLSAG_AGG_1, ...aggParts))

  const roundPrefix = concatBytes(CLSAG_ROUND, ...P, ...C_nonzero, Cout, message)

  let c = c1

  for (let i = 0; i < n; i++) {
    const sScalar = bytesToNumberLE(s[i])

    const cP = scMul(c, muP)
    const cC = scMul(c, muC)
    const cPScalar = bytesToNumberLE(cP)
    const cCScalar = bytesToNumberLE(cC)

    const Pi = ExtPoint.fromHex(P[i])
    const Ci = ExtPoint.fromHex(C_nonzero[i]).subtract(CoutPoint)

    const L = ExtPoint.BASE.multiply(sScalar).add(Pi.multiply(cPScalar)).add(Ci.multiply(cCScalar))

    const HpPi = hashToPoint(P[i])
    const R = HpPi.multiply(sScalar).add(I.multiply(cPScalar)).add(D8.multiply(cCScalar))

    c = hashToScalar(concatBytes(roundPrefix, L.toRawBytes(), R.toRawBytes()))
  }

  // Verify ring closure
  if (c.length !== c1.length) return false
  for (let i = 0; i < c.length; i++) {
    if (c[i] !== c1[i]) return false
  }
  return true
}
