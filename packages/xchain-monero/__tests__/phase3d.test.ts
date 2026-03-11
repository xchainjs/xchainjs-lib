import { selectDecoys, buildRingIndices, toRelativeOffsets } from '../src/tx/decoySelection'
import { encodeAddress, decodeAddress } from '../src/crypto/address'
import { deriveKeyPairs, secretKeyToPublicKey } from '../src/crypto/keys'
import { scReduce32, bytesToHex } from '../src/utils'

describe('Phase 3d: Decoy selection', () => {
  // Fake output distribution: 100 blocks, increasing linearly
  const distribution: number[] = []
  for (let i = 0; i < 100; i++) {
    distribution.push((i + 1) * 100) // 100, 200, ..., 10000
  }

  it('Should select correct number of decoys', () => {
    const decoys = selectDecoys(5000, 10000, 99, distribution, 0)
    expect(decoys.length).toBe(15) // ring size 16 - 1 real
  })

  it('Should not include the real index in decoys', () => {
    const realIdx = 5000
    const decoys = selectDecoys(realIdx, 10000, 99, distribution, 0)
    expect(decoys.includes(realIdx)).toBe(false)
  })

  it('Should return sorted decoy indices', () => {
    const decoys = selectDecoys(5000, 10000, 99, distribution, 0)
    for (let i = 1; i < decoys.length; i++) {
      expect(decoys[i]).toBeGreaterThan(decoys[i - 1])
    }
  })

  it('Should have no duplicate decoys', () => {
    const decoys = selectDecoys(5000, 10000, 99, distribution, 0)
    const unique = new Set(decoys)
    expect(unique.size).toBe(decoys.length)
  })
})

describe('Phase 3d: Ring index building', () => {
  it('Should build sorted ring with correct real index', () => {
    const decoys = [10, 30, 50]
    const { indices, realIndex } = buildRingIndices(25, decoys)
    expect(indices).toEqual([10, 25, 30, 50])
    expect(realIndex).toBe(1) // 25 is at position 1
  })

  it('Should handle real index at start', () => {
    const { indices, realIndex } = buildRingIndices(5, [10, 20, 30])
    expect(indices).toEqual([5, 10, 20, 30])
    expect(realIndex).toBe(0)
  })

  it('Should handle real index at end', () => {
    const { indices, realIndex } = buildRingIndices(40, [10, 20, 30])
    expect(indices).toEqual([10, 20, 30, 40])
    expect(realIndex).toBe(3)
  })
})

describe('Phase 3d: Relative offsets', () => {
  it('Should convert absolute to relative offsets', () => {
    const offsets = toRelativeOffsets([10, 25, 30, 50])
    expect(offsets).toEqual([BigInt(10), BigInt(15), BigInt(5), BigInt(20)])
  })

  it('Should handle single element', () => {
    const offsets = toRelativeOffsets([42])
    expect(offsets).toEqual([BigInt(42)])
  })
})

describe('Phase 3d: Address encode/decode roundtrip', () => {
  it('Should roundtrip encode/decode standard mainnet address', () => {
    const spendKey = scReduce32(new Uint8Array(32).fill(0x01))
    const keys = deriveKeyPairs(spendKey)

    const address = encodeAddress(keys.publicSpendKey, keys.publicViewKey, 0) // mainnet
    expect(address.length).toBe(95)

    const decoded = decodeAddress(address)
    expect(decoded.networkType).toBe(0)
    expect(bytesToHex(decoded.publicSpendKey)).toBe(bytesToHex(keys.publicSpendKey))
    expect(bytesToHex(decoded.publicViewKey)).toBe(bytesToHex(keys.publicViewKey))
  })

  it('Should roundtrip encode/decode stagenet address', () => {
    const spendKey = scReduce32(new Uint8Array(32).fill(0x42))
    const keys = deriveKeyPairs(spendKey)

    const address = encodeAddress(keys.publicSpendKey, keys.publicViewKey, 2) // stagenet
    const decoded = decodeAddress(address)
    expect(decoded.networkType).toBe(2)
    expect(bytesToHex(decoded.publicSpendKey)).toBe(bytesToHex(keys.publicSpendKey))
  })

  it('Should reject address with wrong checksum', () => {
    const spendKey = scReduce32(new Uint8Array(32).fill(0x01))
    const keys = deriveKeyPairs(spendKey)
    const address = encodeAddress(keys.publicSpendKey, keys.publicViewKey, 0)

    // Tamper with last character
    const chars = address.split('')
    chars[chars.length - 1] = chars[chars.length - 1] === 'a' ? 'b' : 'a'
    const tampered = chars.join('')

    expect(() => decodeAddress(tampered)).toThrow()
  })
})
