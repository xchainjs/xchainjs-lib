/**
 * Monero's hash_to_ec / ge_fromfe_frombytes_vartime implementation.
 * Ported from CoinSpace/monerolib (pure JS Monero library).
 *
 * Maps arbitrary data to an ed25519 point. This is NOT standard hash-to-curve
 * (RFC 9380) — it matches Monero's specific algorithm from crypto-ops.c.
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'
import { keccak_256 } from '@noble/hashes/sha3'

const ExtPoint = ed25519.ExtendedPoint
type Point = InstanceType<typeof ExtPoint>

// ed25519 field prime: 2^255 - 19
const P = BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819949')

function mod(a: bigint): bigint {
  const r = a % P
  return r >= BigInt(0) ? r : r + P
}

const A = BigInt(486662)
const A_SQUARED = mod(A * A)

// Precomputed constants (big-endian hex from monerolib/Monero C code)
const SQRTM1 = BigInt('0x547cdb7fb03e20f4d4b2ff66c2042858d0bce7f952d01b873b11e4d8b5f15f3d')
const FFFB1 = BigInt('0x7e71fbefdad61b1720a9c53741fb19e3d19404a8b92a738d22a76975321c41ee')
const FFFB2 = BigInt('0x32f9e1f5fba5d3096e2bae483fe9a041ae21fcb9fba908202d219b7c9f83650d')
const FFFB3 = BigInt('0x1a43f3031067dbf926c0f4887ef7432eee46fc08a13f4a49853d1903b6b39186')
const FFFB4 = BigInt('0x674a110d14c208efb89546403f0da2ed4024ff4ea5964229581b7d8717302c66')

function modPow(base: bigint, exp: bigint): bigint {
  let result = BigInt(1)
  base = mod(base)
  while (exp > BigInt(0)) {
    if (exp & BigInt(1)) {
      result = mod(result * base)
    }
    exp >>= BigInt(1)
    base = mod(base * base)
  }
  return result
}

/**
 * fe_divpowm1: computes (u/v)^((p+3)/8)
 * Formula: u * v^3 * (u * v^7)^((p-5)/8)
 */
function divPowM1(u: bigint, v: bigint): bigint {
  const v3 = mod(v * mod(v * v))
  const v7 = mod(v3 * mod(v3 * v))
  const uv7 = mod(u * v7)
  const exp = (P - BigInt(5)) >> BigInt(3) // (p-5)/8
  const t = modPow(uv7, exp)
  return mod(u * mod(v3 * t))
}

/**
 * Hash arbitrary data to an ed25519 point (Monero's hash_to_ec).
 * Algorithm: ge_fromfe_frombytes_vartime
 */
export function hashToPoint(data: Uint8Array): Point {
  const hash = keccak_256(data)
  const u = mod(bytesToNumberLE(hash))

  // v = 2*u^2
  const v = mod(BigInt(2) * mod(u * u))
  // w = 1 + 2*u^2
  const w = mod(v + BigInt(1))
  // t = w^2 - A^2*v
  const t = mod(mod(w * w) - mod(A_SQUARED * v))

  // x = (w/t)^((p+3)/8) via divPowM1
  let x = divPowM1(w, t)

  let negative = false

  // Check: w - x^2*t == 0?
  let check = mod(w - mod(mod(x * x) * t))

  if (check !== BigInt(0)) {
    // Check: w + x^2*t == 0?
    check = mod(w + mod(mod(x * x) * t))
    if (check !== BigInt(0)) {
      negative = true
    } else {
      x = mod(x * FFFB1)
    }
  } else {
    x = mod(x * FFFB2)
  }

  let odd: boolean
  let r: bigint

  if (!negative) {
    odd = false
    r = mod(P - mod(A * v)) // r = -A*v
    x = mod(x * u) // x *= u
  } else {
    odd = true
    r = mod(P - A) // r = -A

    // Check with sqrtm1
    check = mod(w - mod(mod(mod(x * x) * t) * SQRTM1))
    if (check !== BigInt(0)) {
      check = mod(w + mod(mod(mod(x * x) * t) * SQRTM1))
      if (check !== BigInt(0)) {
        throw new Error('hashToPoint: invalid point (should never happen)')
      } else {
        x = mod(x * FFFB3)
      }
    } else {
      x = mod(x * FFFB4)
    }
  }

  // Adjust sign
  const xIsOdd = (x & BigInt(1)) === BigInt(1)
  if (xIsOdd !== odd) {
    x = mod(P - x)
  }

  // Projective coordinates: (X, Y, Z) where affine = (X/Z, Y/Z)
  const z = mod(r + w)
  const y = mod(r - w)
  const X = mod(x * z)

  // Convert projective (X, Y, Z) to affine and encode
  const zInv = modPow(z, P - BigInt(2))
  const xAff = mod(X * zInv)
  const yAff = mod(y * zInv)

  // Encode as ed25519 point bytes
  const yBytes = numberToBytesLE(yAff, 32)
  if (xAff & BigInt(1)) {
    yBytes[31] |= 0x80
  }

  const point = ExtPoint.fromHex(yBytes)

  // Cofactor clearing: multiply by 8 (Monero's hash_to_ec = ge_fromfe + mul8)
  return point.multiply(BigInt(8))
}
