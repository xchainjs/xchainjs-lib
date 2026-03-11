/**
 * Bulletproofs+ range proof implementation for Monero.
 * Proves amounts are in [0, 2^64) without revealing them.
 *
 * Reference: monero/src/ringct/bulletproofs_plus.cc
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'
import { keccak_256 } from '@noble/hashes/sha3'

import { hashToPoint } from './hashToPoint'
import { getH } from './pedersen'
import { scReduce32, concatBytes, hashToScalar, hexToBytes } from '../utils'
import type { BPPlusProof } from '../tx/types'

const ExtPoint = ed25519.ExtendedPoint
type Point = InstanceType<typeof ExtPoint>

// Ed25519 group order
const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')
const ZERO = BigInt(0)
const ONE = BigInt(1)
const TWO = BigInt(2)
const EIGHT = BigInt(8)

const maxN = 64 // bits per value
const maxM = 16 // max aggregated outputs

// INV_EIGHT = modular inverse of 8 mod l
const INV_EIGHT = bytesToNumberLE(hexToBytes('792fdce229e50661d0da1c7db39dd30700000000000000000000000000000006'))
const MINUS_INV_EIGHT = modL(L - INV_EIGHT)

function modL(x: bigint): bigint {
  const r = x % L
  return r < ZERO ? r + L : r
}

// Domain separator for generator derivation
const EXPONENT_TAG = new TextEncoder().encode('bulletproof_plus')
// Domain separator for transcript
const TRANSCRIPT_TAG = new TextEncoder().encode('bulletproof_plus_transcript')

// Varint encoding (same as tx/serialize)
function encodeVarint(n: number): Uint8Array {
  const bytes: number[] = []
  let val = n
  while (val >= 0x80) {
    bytes.push((val & 0x7f) | 0x80)
    val >>>= 7
  }
  bytes.push(val & 0x7f)
  return new Uint8Array(bytes)
}

// --- Generator cache ---
let _generators: { Gi: Point[]; Hi: Point[] } | null = null

function getExponent(base: Uint8Array, idx: number): Point {
  const data = concatBytes(base, EXPONENT_TAG, encodeVarint(idx))
  const hash = keccak_256(data)
  return hashToPoint(hash)
}

function getGenerators(count: number): { Gi: Point[]; Hi: Point[] } {
  if (_generators !== null && _generators.Gi.length >= count) return _generators
  const H = getH()
  const hBytes = H.toRawBytes()
  const Gi: Point[] = new Array(count)
  const Hi: Point[] = new Array(count)
  for (let i = 0; i < count; i++) {
    Hi[i] = getExponent(hBytes, i * 2)
    Gi[i] = getExponent(hBytes, i * 2 + 1)
  }
  _generators = { Gi, Hi }
  return _generators
}

// --- Initial transcript (cached) ---
let _initTranscript: Uint8Array | null = null

function getInitialTranscript(): Uint8Array {
  if (_initTranscript !== null) return _initTranscript
  const hash = keccak_256(TRANSCRIPT_TAG)
  const point = hashToPoint(hash)
  _initTranscript = point.toRawBytes()
  return _initTranscript
}

// --- Transcript updates ---
function transcriptUpdate1(transcript: Uint8Array, update0: Uint8Array): Uint8Array {
  return hashToScalar(concatBytes(transcript, update0))
}

function transcriptUpdate2(transcript: Uint8Array, update0: Uint8Array, update1: Uint8Array): Uint8Array {
  return hashToScalar(concatBytes(transcript, update0, update1))
}

// --- Scalar helpers ---
function scalarToBytes(s: bigint): Uint8Array {
  return new Uint8Array(numberToBytesLE(s, 32))
}

function randomScalar(): bigint {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return bytesToNumberLE(scReduce32(bytes))
}

function scalarInvert(x: bigint): bigint {
  // Fermat's little theorem: x^(l-2) mod l
  let result = ONE
  let base = modL(x)
  let exp = L - TWO
  while (exp > ZERO) {
    if (exp & ONE) result = modL(result * base)
    exp >>= ONE
    base = modL(base * base)
  }
  return result
}

function nextPow2(n: number): number {
  let p = 1
  while (p < n) p <<= 1
  return p
}

function log2(n: number): number {
  let r = 0
  let v = n
  while (v > 1) { v >>= 1; r++ }
  return r
}

// Weighted inner product: WIP(a, b, y) = sum(a[i] * b[i] * y^(i+1))
function weightedInnerProduct(a: bigint[], b: bigint[], y: bigint): bigint {
  let result = ZERO
  let yPow = ONE
  for (let i = 0; i < a.length; i++) {
    yPow = modL(yPow * y)
    result = modL(result + modL(modL(a[i] * b[i]) * yPow))
  }
  return result
}

// Compute L or R in the inner product argument
function computeLR(
  size: number,
  yFactor: bigint,
  G: Point[], gOff: number,
  H: Point[], hOff: number,
  a: bigint[], aOff: number,
  b: bigint[], bOff: number,
  c: bigint,
  d: bigint,
): Point {
  // Multi-scalar multiplication
  let result = ExtPoint.BASE.multiply(modL(d * INV_EIGHT))
    .add(getH().multiply(modL(c * INV_EIGHT)))

  for (let i = 0; i < size; i++) {
    const aScaled = modL(a[aOff + i] * modL(yFactor * INV_EIGHT))
    const bScaled = modL(b[bOff + i] * INV_EIGHT)
    result = result.add(G[gOff + i].multiply(aScaled))
    result = result.add(H[hOff + i].multiply(bScaled))
  }

  return result
}

/**
 * Generate a Bulletproofs+ range proof.
 *
 * @param amounts - Array of amounts (bigint, each < 2^64)
 * @param masks - Array of blinding factors (32-byte scalars)
 * @returns BP+ proof
 */
export function bulletproofPlusProve(amounts: bigint[], masks: Uint8Array[]): BPPlusProof {
  const m = amounts.length
  if (m === 0 || m > maxM) throw new Error(`BP+: invalid output count ${m}`)

  const M = nextPow2(m)
  const logM = log2(M)
  const MN = M * maxN
  const logMN = logM + log2(maxN)

  // Get generators
  const gens = getGenerators(MN)
  const { Gi, Hi } = gens

  // Compute V[i] = (gamma*INV_EIGHT)*G + (sv*INV_EIGHT)*H
  const V: Uint8Array[] = []
  const sv: bigint[] = []
  const gamma: bigint[] = []
  for (let i = 0; i < m; i++) {
    sv.push(amounts[i])
    gamma.push(bytesToNumberLE(masks[i]))
    const gScalar = modL(gamma[i] * INV_EIGHT)
    const hScalar = modL(sv[i] * INV_EIGHT)
    const point = ExtPoint.BASE.multiply(gScalar).add(getH().multiply(hScalar))
    V.push(point.toRawBytes())
  }

  // Bit decomposition
  const aL: bigint[] = new Array(MN)
  const aR: bigint[] = new Array(MN)
  const aL8: bigint[] = new Array(MN)
  const aR8: bigint[] = new Array(MN)

  for (let j = 0; j < M; j++) {
    for (let i = 0; i < maxN; i++) {
      const idx = j * maxN + i
      if (j < m && ((sv[j] >> BigInt(i)) & ONE) === ONE) {
        aL[idx] = ONE
        aR[idx] = ZERO
        aL8[idx] = INV_EIGHT
        aR8[idx] = ZERO
      } else {
        aL[idx] = ZERO
        aR[idx] = modL(L - ONE) // -1 mod l
        aL8[idx] = ZERO
        aR8[idx] = MINUS_INV_EIGHT
      }
    }
  }

  // Transcript initialization
  let transcript = getInitialTranscript()
  const vConcat = concatBytes(...V)
  transcript = scalarToBytes(bytesToNumberLE(transcriptUpdate1(transcript, hashToScalar(vConcat))))

  // Commitment A
  const alpha = randomScalar()

  // pre_A = sum(aL8[i]*Gi[i] + aR8[i]*Hi[i])
  let preA = ExtPoint.ZERO
  for (let i = 0; i < MN; i++) {
    if (aL8[i] !== ZERO) preA = preA.add(Gi[i].multiply(aL8[i]))
    if (aR8[i] !== ZERO) preA = preA.add(Hi[i].multiply(aR8[i]))
  }
  const A = preA.add(ExtPoint.BASE.multiply(modL(alpha * INV_EIGHT)))
  const ABytes = A.toRawBytes()

  // Challenge y
  const yBytes = transcriptUpdate1(transcript, ABytes)
  const y = bytesToNumberLE(yBytes)
  if (y === ZERO) throw new Error('BP+: y is zero')

  // Challenge z
  const zBytes = hashToScalar(yBytes)
  const z = bytesToNumberLE(zBytes)
  transcript = zBytes
  if (z === ZERO) throw new Error('BP+: z is zero')

  const zSq = modL(z * z)

  // d vector: d[j*N+i] = z^(2*(j+1)) * 2^i
  const d: bigint[] = new Array(MN)
  d[0] = zSq
  for (let i = 1; i < maxN; i++) {
    d[i] = modL(d[i - 1] * TWO)
  }
  for (let j = 1; j < M; j++) {
    for (let i = 0; i < maxN; i++) {
      d[j * maxN + i] = modL(d[(j - 1) * maxN + i] * zSq)
    }
  }

  // y powers: y^0 to y^(MN+1)
  const yPowers: bigint[] = new Array(MN + 2)
  yPowers[0] = ONE
  for (let i = 1; i <= MN + 1; i++) {
    yPowers[i] = modL(yPowers[i - 1] * y)
  }

  // aL1 = aL - z, aR1 = aR + z + d[i]*y^(MN-i)
  const aL1: bigint[] = new Array(MN)
  const aR1: bigint[] = new Array(MN)
  for (let i = 0; i < MN; i++) {
    aL1[i] = modL(aL[i] - z)
    aR1[i] = modL(modL(aR[i] + z) + modL(d[i] * yPowers[MN - i]))
  }

  // alpha1 = alpha + sum(y^(MN+1) * z^(2*(j+1)) * gamma[j])
  let alpha1 = alpha
  let temp = ONE
  for (let j = 0; j < m; j++) {
    temp = modL(temp * zSq)
    alpha1 = modL(alpha1 + modL(modL(yPowers[MN + 1] * temp) * gamma[j]))
  }

  // Inner-product argument
  let nprime = MN
  const Gprime: Point[] = Gi.slice(0, MN)
  const Hprime: Point[] = Hi.slice(0, MN)
  let aprime = aL1.slice()
  let bprime = aR1.slice()

  const yInv = scalarInvert(y)
  const yInvPow: bigint[] = new Array(MN)
  yInvPow[0] = ONE
  for (let i = 1; i < MN; i++) {
    yInvPow[i] = modL(yInvPow[i - 1] * yInv)
  }

  const Ls: Uint8Array[] = []
  const Rs: Uint8Array[] = []

  for (let round = 0; round < logMN; round++) {
    nprime = nprime >> 1

    const cL = weightedInnerProduct(
      aprime.slice(0, nprime),
      bprime.slice(nprime, nprime * 2),
      y,
    )

    // For cR: aprime[nprime..] scaled by y^nprime
    const aScaled: bigint[] = new Array(nprime)
    for (let i = 0; i < nprime; i++) {
      aScaled[i] = modL(aprime[nprime + i] * yPowers[nprime])
    }
    const cR = weightedInnerProduct(aScaled, bprime.slice(0, nprime), y)

    const dL = randomScalar()
    const dR = randomScalar()

    const LPoint = computeLR(nprime, yInvPow[nprime], Gprime, nprime, Hprime, 0,
      aprime, 0, bprime, nprime, cL, dL)
    const RPoint = computeLR(nprime, yPowers[nprime], Gprime, 0, Hprime, nprime,
      aprime, nprime, bprime, 0, cR, dR)

    const LBytes = LPoint.toRawBytes()
    const RBytes = RPoint.toRawBytes()
    Ls.push(LBytes)
    Rs.push(RBytes)

    const eBytes = transcriptUpdate2(transcript, LBytes, RBytes)
    const e = bytesToNumberLE(eBytes)
    if (e === ZERO) throw new Error('BP+: challenge is zero')
    transcript = eBytes

    const eInv = scalarInvert(e)

    // Fold generators
    const tempG = modL(yInvPow[nprime] * e)
    const newGprime: Point[] = new Array(nprime)
    const newHprime: Point[] = new Array(nprime)
    for (let i = 0; i < nprime; i++) {
      newGprime[i] = Gprime[i].multiply(eInv).add(Gprime[nprime + i].multiply(tempG))
      newHprime[i] = Hprime[i].multiply(e).add(Hprime[nprime + i].multiply(eInv))
    }

    // Fold scalar vectors
    const tempA = modL(eInv * yPowers[nprime])
    const newAprime: bigint[] = new Array(nprime)
    const newBprime: bigint[] = new Array(nprime)
    for (let i = 0; i < nprime; i++) {
      newAprime[i] = modL(modL(e * aprime[i]) + modL(tempA * aprime[nprime + i]))
      newBprime[i] = modL(modL(eInv * bprime[i]) + modL(e * bprime[nprime + i]))
    }

    // Update alpha1
    alpha1 = modL(alpha1 + modL(dL * modL(e * e)) + modL(dR * modL(eInv * eInv)))

    // Replace arrays
    Gprime.length = nprime
    Hprime.length = nprime
    for (let i = 0; i < nprime; i++) {
      Gprime[i] = newGprime[i]
      Hprime[i] = newHprime[i]
    }
    aprime = newAprime
    bprime = newBprime
  }

  // Final round
  const r = randomScalar()
  const s = randomScalar()
  const d_ = randomScalar()
  const eta = randomScalar()

  const rysb = modL(modL(r * modL(y * bprime[0])) + modL(s * modL(y * aprime[0])))
  const A1 = Gprime[0].multiply(modL(r * INV_EIGHT))
    .add(Hprime[0].multiply(modL(s * INV_EIGHT)))
    .add(ExtPoint.BASE.multiply(modL(d_ * INV_EIGHT)))
    .add(getH().multiply(modL(rysb * INV_EIGHT)))
  const A1Bytes = A1.toRawBytes()

  const B = ExtPoint.BASE.multiply(modL(eta * INV_EIGHT))
    .add(getH().multiply(modL(modL(r * modL(y * s)) * INV_EIGHT)))
  const BBytes = B.toRawBytes()

  // Final challenge
  const eFinalBytes = transcriptUpdate2(transcript, A1Bytes, BBytes)
  const eFinal = bytesToNumberLE(eFinalBytes)
  if (eFinal === ZERO) throw new Error('BP+: final challenge is zero')
  const eFinalSq = modL(eFinal * eFinal)

  const r1 = scalarToBytes(modL(modL(aprime[0] * eFinal) + r))
  const s1 = scalarToBytes(modL(modL(bprime[0] * eFinal) + s))
  const d1 = scalarToBytes(modL(eta + modL(d_ * eFinal) + modL(alpha1 * eFinalSq)))

  return { A: ABytes, A1: A1Bytes, B: BBytes, r1, s1, d1, L: Ls, R: Rs }
}

/**
 * Verify a Bulletproofs+ range proof.
 *
 * @param proof - BP+ proof to verify
 * @param commitments - Output commitments (the actual commitments, NOT /8)
 * @returns true if valid
 */
export function bulletproofPlusVerify(proof: BPPlusProof, commitments: Uint8Array[]): boolean {
  const m = commitments.length
  if (m === 0 || m > maxM) return false

  const M = nextPow2(m)
  const MN = M * maxN
  const logMN = log2(M) + log2(maxN)

  if (proof.L.length !== logMN || proof.R.length !== logMN) return false

  const gens = getGenerators(MN)

  // Recompute V as stored in proof (commitment / 8)
  const V: Uint8Array[] = []
  for (let i = 0; i < m; i++) {
    const point = ExtPoint.fromHex(commitments[i])
    V.push(point.multiply(INV_EIGHT).toRawBytes())
  }

  // Reconstruct transcript
  let transcript = getInitialTranscript()
  const vConcat = concatBytes(...V)
  transcript = scalarToBytes(bytesToNumberLE(transcriptUpdate1(transcript, hashToScalar(vConcat))))

  const y = bytesToNumberLE(transcriptUpdate1(transcript, proof.A))
  if (y === ZERO) return false

  const zBytes = hashToScalar(scalarToBytes(y))
  const z = bytesToNumberLE(zBytes)
  transcript = zBytes
  if (z === ZERO) return false

  const zSq = modL(z * z)
  const yInv = scalarInvert(y)

  // Reconstruct round challenges
  const challenges: bigint[] = []
  const challengesInv: bigint[] = []
  for (let j = 0; j < logMN; j++) {
    const eBytes = transcriptUpdate2(transcript, proof.L[j], proof.R[j])
    const e = bytesToNumberLE(eBytes)
    if (e === ZERO) return false
    transcript = eBytes
    challenges.push(e)
    challengesInv.push(scalarInvert(e))
  }

  // Final challenge e
  const eFinal = bytesToNumberLE(transcriptUpdate2(transcript, proof.A1, proof.B))
  if (eFinal === ZERO) return false
  const eSq = modL(eFinal * eFinal)

  // Recover proof scalars
  const r1 = bytesToNumberLE(proof.r1)
  const s1 = bytesToNumberLE(proof.s1)
  const d1 = bytesToNumberLE(proof.d1)

  // Build challenges_cache
  const challengesCache: bigint[] = new Array(MN)
  challengesCache[0] = challengesInv[0]
  challengesCache[1] = challenges[0]
  for (let j = 1; j < logMN; j++) {
    const slots = 1 << (j + 1)
    for (let s = slots - 1; s >= 0; s -= 2) {
      challengesCache[s] = modL(challengesCache[s >> 1] * challenges[j])
      challengesCache[s - 1] = modL(challengesCache[s >> 1] * challengesInv[j])
    }
  }

  // y powers
  const yPowers: bigint[] = [ONE]
  for (let i = 1; i <= MN + 1; i++) yPowers.push(modL(yPowers[i - 1] * y))

  // d vector
  const d: bigint[] = new Array(MN)
  d[0] = zSq
  for (let i = 1; i < maxN; i++) d[i] = modL(d[i - 1] * TWO)
  for (let j = 1; j < M; j++) {
    for (let i = 0; i < maxN; i++) d[j * maxN + i] = modL(d[(j - 1) * maxN + i] * zSq)
  }

  // sum_d = (2^64 - 1) * sum(z^(2*k) for k=1..M)
  const twoTo64 = ONE << BigInt(64)
  const twoTo64m1 = twoTo64 - ONE
  let sumZPow = ZERO
  let zp = ONE
  for (let k = 0; k < M; k++) {
    zp = modL(zp * zSq)
    sumZPow = modL(sumZPow + zp)
  }
  const sumD = modL(twoTo64m1 * sumZPow)

  // sum_y = sum(y^i for i=1..MN)
  let sumY = ZERO
  for (let i = 1; i <= MN; i++) sumY = modL(sumY + yPowers[i])

  // Verification: accumulate into a single multi-scalar multiplication
  // check: d1*G + (r1*y*s1 + e^2*(y^(MN+1)*z*sumD + (z^2-z)*sumY))*H
  //       - e^2*sum(z^(2*(j+1))*y^(MN+1)*V[j]*8)
  //       - B*8 - e*A1*8 - e^2*A*8
  //       + sum(gi_scalar*Gi[i]) + sum(hi_scalar*Hi[i])
  //       - e^2*sum(challenges[j]^2*L[j]*8) - e^2*sum(challengesInv[j]^2*R[j]*8)
  //       == identity

  let result = ExtPoint.BASE.multiply(d1)

  const hScalar = modL(
    modL(r1 * modL(y * s1)) +
    modL(eSq * modL(
      modL(yPowers[MN + 1] * modL(z * sumD)) +
      modL(modL(zSq - z) * sumY),
    )),
  )
  result = result.add(getH().multiply(hScalar))

  // V contributions
  let vTemp = modL(L - modL(eSq * yPowers[MN + 1]))
  let zPow = ONE
  for (let j = 0; j < m; j++) {
    zPow = modL(zPow * zSq)
    const scalar = modL(vTemp * zPow)
    result = result.add(ExtPoint.fromHex(commitments[j]).multiply(scalar))
  }

  // B, A1, A contributions
  result = result.subtract(ExtPoint.fromHex(proof.B).multiply(EIGHT))
  result = result.subtract(ExtPoint.fromHex(proof.A1).multiply(modL(eFinal * EIGHT)))
  result = result.subtract(ExtPoint.fromHex(proof.A).multiply(modL(eSq * EIGHT)))

  // L, R contributions
  const minusESq = modL(L - eSq)
  for (let j = 0; j < logMN; j++) {
    const lScalar = modL(minusESq * modL(challenges[j] * challenges[j]))
    const rScalar = modL(minusESq * modL(challengesInv[j] * challengesInv[j]))
    result = result.add(ExtPoint.fromHex(proof.L[j]).multiply(modL(lScalar * EIGHT)))
    result = result.add(ExtPoint.fromHex(proof.R[j]).multiply(modL(rScalar * EIGHT)))
  }

  // Gi, Hi contributions
  let eR1y = modL(eFinal * r1)
  const eS1 = modL(eFinal * s1)
  let eSqZ = modL(eSq * z)
  const minusESqZ = modL(L - eSqZ)
  let minusESqYMN = modL(L - modL(eSq * yPowers[MN]))

  for (let i = 0; i < MN; i++) {
    const giScalar = modL(modL(eR1y * challengesCache[i]) + eSqZ)
    const hiScalar = modL(
      modL(eS1 * challengesCache[(~i) & (MN - 1)]) +
      minusESqZ +
      modL(minusESqYMN * d[i]),
    )

    result = result.add(gens.Gi[i].multiply(giScalar))
    result = result.add(gens.Hi[i].multiply(hiScalar))

    eR1y = modL(eR1y * yInv)
    minusESqYMN = modL(minusESqYMN * yInv)
  }

  return result.equals(ExtPoint.ZERO)
}
