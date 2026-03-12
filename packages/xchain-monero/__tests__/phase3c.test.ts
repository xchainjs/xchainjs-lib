import { bulletproofPlusProve, bulletproofPlusVerify } from '../src/crypto/bulletproofsPlus'
import { commit } from '../src/crypto/pedersen'
import { scReduce32 } from '../src/utils'

describe('Phase 3c: Bulletproofs+ range proofs', () => {
  // Helper to generate a random mask
  function randomMask(): Uint8Array {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return scReduce32(bytes)
  }

  it('Should prove and verify a single-output proof', () => {
    const amount = BigInt('1000000000000') // 1 XMR
    const mask = randomMask()
    const commitment = commit(mask, amount)

    const proof = bulletproofPlusProve([amount], [mask])
    expect(proof.A.length).toBe(32)
    expect(proof.A1.length).toBe(32)
    expect(proof.B.length).toBe(32)
    expect(proof.r1.length).toBe(32)
    expect(proof.s1.length).toBe(32)
    expect(proof.d1.length).toBe(32)
    // Single output -> M=1, logMN = 0+6 = 6
    expect(proof.L.length).toBe(6)
    expect(proof.R.length).toBe(6)

    const valid = bulletproofPlusVerify(proof, [commitment.toRawBytes()])
    expect(valid).toBe(true)
  }, 60000)

  it('Should prove and verify a two-output proof', () => {
    const amount1 = BigInt('500000000000')
    const amount2 = BigInt('300000000000')
    const mask1 = randomMask()
    const mask2 = randomMask()
    const c1 = commit(mask1, amount1)
    const c2 = commit(mask2, amount2)

    const proof = bulletproofPlusProve([amount1, amount2], [mask1, mask2])
    // Two outputs -> M=2, logMN = 1+6 = 7
    expect(proof.L.length).toBe(7)
    expect(proof.R.length).toBe(7)

    const valid = bulletproofPlusVerify(proof, [c1.toRawBytes(), c2.toRawBytes()])
    expect(valid).toBe(true)
  }, 120000)

  it('Should reject proof with wrong commitment', () => {
    const amount = BigInt('1000000000000')
    const mask = randomMask()
    const wrongMask = randomMask()
    const wrongCommitment = commit(wrongMask, amount)

    const proof = bulletproofPlusProve([amount], [mask])
    const valid = bulletproofPlusVerify(proof, [wrongCommitment.toRawBytes()])
    expect(valid).toBe(false)
  }, 60000)

  it('Should reject proof with wrong amount in commitment', () => {
    const amount = BigInt('1000000000000')
    const mask = randomMask()
    const wrongCommitment = commit(mask, BigInt('2000000000000'))

    const proof = bulletproofPlusProve([amount], [mask])
    const valid = bulletproofPlusVerify(proof, [wrongCommitment.toRawBytes()])
    expect(valid).toBe(false)
  }, 60000)

  it('Should work with max 64-bit amount', () => {
    const amount = (BigInt(1) << BigInt(64)) - BigInt(1) // 2^64 - 1
    const mask = randomMask()
    const commitment = commit(mask, amount)

    const proof = bulletproofPlusProve([amount], [mask])
    const valid = bulletproofPlusVerify(proof, [commitment.toRawBytes()])
    expect(valid).toBe(true)
  }, 60000)

  it('Should work with small amounts', () => {
    const amount = BigInt(1)
    const mask = randomMask()
    const commitment = commit(mask, amount)

    const proof = bulletproofPlusProve([amount], [mask])
    const valid = bulletproofPlusVerify(proof, [commitment.toRawBytes()])
    expect(valid).toBe(true)
  }, 60000)

  it('Should produce deterministic proof structure sizes', () => {
    const mask = randomMask()
    const proof = bulletproofPlusProve([BigInt(42)], [mask])

    // L and R should each have exactly log2(64) = 6 entries for single output
    expect(proof.L.length).toBe(6)
    expect(proof.R.length).toBe(6)
    for (const l of proof.L) expect(l.length).toBe(32)
    for (const r of proof.R) expect(r.length).toBe(32)
  }, 60000)
})
