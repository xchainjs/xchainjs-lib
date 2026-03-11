import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'

import { clsagSign, clsagVerify } from '../src/crypto/clsag'
import { generateKeyImage } from '../src/crypto/keyImage'
import { commit } from '../src/crypto/pedersen'
import { secretKeyToPublicKey, deriveKeyPairs } from '../src/crypto/keys'
import { bytesToHex, scReduce32, scMul, scMulAdd, scMulSub, hashToScalar, concatBytes } from '../src/utils'
import {
  writeVarint,
  serializeTxPrefix,
  txPrefixHash,
  serializeRctBase,
  serializeClsag,
  serializeRctPrunable,
  rctSigHash,
} from '../src/tx/serialize'
import type { MoneroTransaction, RingMember, RctSignatures } from '../src/tx/types'

const ExtPoint = ed25519.ExtendedPoint
const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')

describe('Phase 3b: Scalar arithmetic', () => {
  it('scMul should multiply scalars mod l', () => {
    const a = scReduce32(new Uint8Array(32).fill(0x03))
    const b = scReduce32(new Uint8Array(32).fill(0x05))
    const result = scMul(a, b)

    const aVal = bytesToNumberLE(a)
    const bVal = bytesToNumberLE(b)
    const expected = (aVal * bVal) % L
    expect(bytesToNumberLE(result)).toBe(expected)
  })

  it('scMulAdd should compute a*b + c mod l', () => {
    const a = scReduce32(new Uint8Array(32).fill(0x02))
    const b = scReduce32(new Uint8Array(32).fill(0x03))
    const c = scReduce32(new Uint8Array(32).fill(0x07))
    const result = scMulAdd(a, b, c)

    const expected = (bytesToNumberLE(a) * bytesToNumberLE(b) + bytesToNumberLE(c)) % L
    expect(bytesToNumberLE(result)).toBe(expected)
  })

  it('scMulSub should compute c - a*b mod l', () => {
    const a = scReduce32(new Uint8Array(32).fill(0x02))
    const b = scReduce32(new Uint8Array(32).fill(0x03))
    const c = scReduce32(new Uint8Array(32).fill(0xff))
    const result = scMulSub(a, b, c)

    let expected = (bytesToNumberLE(c) - bytesToNumberLE(a) * bytesToNumberLE(b)) % L
    if (expected < BigInt(0)) expected += L
    expect(bytesToNumberLE(result)).toBe(expected)
  })

  it('hashToScalar should return a reduced scalar', () => {
    const data = new Uint8Array([1, 2, 3, 4])
    const scalar = hashToScalar(data)
    expect(scalar.length).toBe(32)
    expect(bytesToNumberLE(scalar) < L).toBe(true)
  })

  it('concatBytes should concatenate arrays', () => {
    const a = new Uint8Array([1, 2])
    const b = new Uint8Array([3, 4, 5])
    const result = concatBytes(a, b)
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('Phase 3b: CLSAG sign/verify', () => {
  // Create test ring of size 4 (small for tests)
  const ringSize = 4
  const realIndex = 1

  // Generate real signer's keys
  const realPrivKey = scReduce32(new Uint8Array(32).fill(0x42))
  const realPubKey = secretKeyToPublicKey(realPrivKey)

  // Real input commitment: mask_in * G + amount * H
  const realMask = scReduce32(new Uint8Array(32).fill(0x11))
  const amount = BigInt(1000000000000) // 1 XMR
  const realCommitment = commit(realMask, amount)

  // Pseudo-output commitment: mask_out * G + amount * H (same amount, different mask)
  const pseudoMask = scReduce32(new Uint8Array(32).fill(0x22))
  const pseudoOut = commit(pseudoMask, amount)
  const pseudoOutBytes = pseudoOut.toRawBytes()

  // Secret mask difference: z = realMask - pseudoMask (mod l)
  const z = (() => {
    let diff = (bytesToNumberLE(realMask) - bytesToNumberLE(pseudoMask)) % L
    if (diff < BigInt(0)) diff += L
    return new Uint8Array(numberToBytesLE(diff, 32))
  })()

  // Key image
  const keyImage = generateKeyImage(realPrivKey, realPubKey)

  // Build ring
  const ring: RingMember[] = []
  for (let i = 0; i < ringSize; i++) {
    if (i === realIndex) {
      ring.push({
        dest: realPubKey,
        mask: realCommitment.toRawBytes(),
      })
    } else {
      const decoyPriv = scReduce32(new Uint8Array(32).fill(0x50 + i))
      const decoyMask = scReduce32(new Uint8Array(32).fill(0x60 + i))
      ring.push({
        dest: secretKeyToPublicKey(decoyPriv),
        mask: commit(decoyMask, BigInt(2000000000000 + i)).toRawBytes(),
      })
    }
  }

  const message = new Uint8Array(32).fill(0xaa) // mock tx prefix hash

  it('Should produce a valid CLSAG signature', () => {
    const sig = clsagSign(message, ring, pseudoOutBytes, realPrivKey, z, realIndex, keyImage)

    expect(sig.s.length).toBe(ringSize)
    expect(sig.c1.length).toBe(32)
    expect(sig.D.length).toBe(32)

    for (const s of sig.s) {
      expect(s.length).toBe(32)
    }
  })

  it('Should verify a valid CLSAG signature', () => {
    const sig = clsagSign(message, ring, pseudoOutBytes, realPrivKey, z, realIndex, keyImage)
    const valid = clsagVerify(message, ring, pseudoOutBytes, keyImage, sig)
    expect(valid).toBe(true)
  })

  it('Should reject a signature with wrong message', () => {
    const sig = clsagSign(message, ring, pseudoOutBytes, realPrivKey, z, realIndex, keyImage)
    const wrongMessage = new Uint8Array(32).fill(0xbb)
    const valid = clsagVerify(wrongMessage, ring, pseudoOutBytes, keyImage, sig)
    expect(valid).toBe(false)
  })

  it('Should reject a signature with wrong key image', () => {
    const sig = clsagSign(message, ring, pseudoOutBytes, realPrivKey, z, realIndex, keyImage)
    const wrongKI = generateKeyImage(
      scReduce32(new Uint8Array(32).fill(0x99)),
      secretKeyToPublicKey(scReduce32(new Uint8Array(32).fill(0x99))),
    )
    const valid = clsagVerify(message, ring, pseudoOutBytes, wrongKI, sig)
    expect(valid).toBe(false)
  })

  it('Should reject a signature with tampered s value', () => {
    const sig = clsagSign(message, ring, pseudoOutBytes, realPrivKey, z, realIndex, keyImage)
    const tampered = { ...sig, s: [...sig.s] }
    tampered.s[0] = scReduce32(new Uint8Array(32).fill(0xff))
    const valid = clsagVerify(message, ring, pseudoOutBytes, keyImage, tampered)
    expect(valid).toBe(false)
  })

  it('Should work with ring size 16 (Monero default)', () => {
    const bigRing: RingMember[] = []
    const bigRealIndex = 7
    for (let i = 0; i < 16; i++) {
      if (i === bigRealIndex) {
        bigRing.push({ dest: realPubKey, mask: realCommitment.toRawBytes() })
      } else {
        const dp = scReduce32(new Uint8Array(32).fill(0x70 + i))
        const dm = scReduce32(new Uint8Array(32).fill(0x80 + i))
        bigRing.push({
          dest: secretKeyToPublicKey(dp),
          mask: commit(dm, BigInt(3000000000000 + i)).toRawBytes(),
        })
      }
    }

    const sig = clsagSign(message, bigRing, pseudoOutBytes, realPrivKey, z, bigRealIndex, keyImage)
    expect(sig.s.length).toBe(16)
    const valid = clsagVerify(message, bigRing, pseudoOutBytes, keyImage, sig)
    expect(valid).toBe(true)
  })
})

describe('Phase 3b: Varint encoding', () => {
  it('Should encode small numbers', () => {
    expect(Array.from(writeVarint(0))).toEqual([0])
    expect(Array.from(writeVarint(1))).toEqual([1])
    expect(Array.from(writeVarint(127))).toEqual([127])
  })

  it('Should encode multi-byte numbers', () => {
    expect(Array.from(writeVarint(128))).toEqual([0x80, 0x01])
    expect(Array.from(writeVarint(256))).toEqual([0x80, 0x02])
  })

  it('Should encode bigint values', () => {
    const result = writeVarint(BigInt(300))
    expect(result.length).toBeGreaterThan(1)
  })
})

describe('Phase 3b: Transaction serialization', () => {
  const mockTx: MoneroTransaction = {
    version: 2,
    unlockTime: BigInt(0),
    inputs: [
      {
        amount: BigInt(0),
        keyOffsets: [BigInt(100), BigInt(50), BigInt(30), BigInt(20)],
        keyImage: new Uint8Array(32).fill(0x01),
      },
    ],
    outputs: [
      {
        amount: BigInt(0),
        key: new Uint8Array(32).fill(0x02),
      },
      {
        amount: BigInt(0),
        key: new Uint8Array(32).fill(0x03),
      },
    ],
    extra: new Uint8Array([0x01, 0x02, 0x03]),
    rctSignatures: {
      type: 6,
      txnFee: BigInt(30000000),
      ecdhInfo: [new Uint8Array(8).fill(0xaa), new Uint8Array(8).fill(0xbb)],
      outPk: [new Uint8Array(32).fill(0x04), new Uint8Array(32).fill(0x05)],
      pseudoOuts: [new Uint8Array(32).fill(0x06)],
      clsags: [],
      bppProofs: [],
    },
  }

  it('Should serialize tx prefix deterministically', () => {
    const bytes1 = serializeTxPrefix(mockTx)
    const bytes2 = serializeTxPrefix(mockTx)
    expect(bytesToHex(bytes1)).toBe(bytesToHex(bytes2))
  })

  it('Should produce a 32-byte prefix hash', () => {
    const hash = txPrefixHash(mockTx)
    expect(hash.length).toBe(32)
  })

  it('Should serialize RCT base', () => {
    const base = serializeRctBase(mockTx.rctSignatures)
    expect(base.length).toBeGreaterThan(0)
    expect(base[0]).toBe(6) // RCTTypeBulletproofPlus
  })

  it('rctSigHash should produce 32-byte hash', () => {
    const prefix = txPrefixHash(mockTx)
    const base = serializeRctBase(mockTx.rctSignatures)
    const prunable = serializeRctPrunable(mockTx.rctSignatures)
    const hash = rctSigHash(prefix, base, prunable)
    expect(hash.length).toBe(32)
  })
})
