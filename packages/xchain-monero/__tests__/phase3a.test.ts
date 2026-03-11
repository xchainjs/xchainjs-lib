import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'

import { hashToPoint } from '../src/crypto/hashToPoint'
import { getH, commit, zeroCommit } from '../src/crypto/pedersen'
import { generateKeyImage } from '../src/crypto/keyImage'
import { deriveOutputKey, deriveInputKey, isOutputForUs } from '../src/crypto/stealth'
import { deriveSharedSecret, encryptAmount, decryptAmount } from '../src/crypto/ecdh'
import { bytesToHex } from '../src/utils'
import { deriveKeyPairs, secretKeyToPublicKey } from '../src/crypto/keys'
import { scReduce32 } from '../src/utils'

const ExtPoint = ed25519.ExtendedPoint

describe('Phase 3a: Core crypto primitives', () => {
  describe('hashToPoint', () => {
    it('Should match official Monero hash_to_ec test vectors', () => {
      // From monero/tests/crypto/tests.txt
      const vectors: [string, string][] = [
        ['da66e9ba613919dec28ef367a125bb310d6d83fb9052e71034164b6dc4f392d0', '52b3f38753b4e13b74624862e253072cf12f745d43fcfafbe8c217701a6e5875'],
        ['a7fbdeeccb597c2d5fdaf2ea2e10cbfcd26b5740903e7f6d46bcbf9a90384fc6', 'f055ba2d0d9828ce2e203d9896bfda494d7830e7e3a27fa27d5eaa825a79a19c'],
        ['ed6e6579368caba2cc4851672972e949c0ee586fee4d6d6a9476d4a908f64070', 'da3ceda9a2ef6316bf9272566e6dffd785ac71f57855c0202f422bbb86af4ec0'],
      ]

      for (const [inputHex, expectedHex] of vectors) {
        const input = new Uint8Array(Buffer.from(inputHex, 'hex'))
        const result = hashToPoint(input)
        expect(bytesToHex(result.toRawBytes())).toBe(expectedHex)
      }
    })

    it('Should return a point on the curve', () => {
      const data = new Uint8Array(32)
      data[0] = 42
      const point = hashToPoint(data)

      const bytes = point.toRawBytes()
      expect(bytes.length).toBe(32)
      const recovered = ExtPoint.fromHex(bytes)
      expect(recovered.equals(point)).toBe(true)
    })

    it('Should be deterministic', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const p1 = hashToPoint(data)
      const p2 = hashToPoint(data)
      expect(p1.equals(p2)).toBe(true)
    })

    it('Should produce different points for different inputs', () => {
      const d1 = new Uint8Array(32)
      d1[0] = 1
      const d2 = new Uint8Array(32)
      d2[0] = 2

      const p1 = hashToPoint(d1)
      const p2 = hashToPoint(d2)
      expect(p1.equals(p2)).toBe(false)
    })

    it('Should produce a prime-order subgroup point (cofactor cleared)', () => {
      const data = new Uint8Array([0xff, 0xfe, 0xfd])
      const point = hashToPoint(data)
      const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')

      // L*P = identity for points in the prime-order subgroup
      // @noble/curves doesn't allow multiply(L), so check (L-1)*P + P == identity
      const shouldBeNeg = point.multiply(L - BigInt(1))
      expect(shouldBeNeg.add(point).equals(ExtPoint.ZERO)).toBe(true)
    })
  })

  describe('Pedersen commitments', () => {
    it('Should get H generator matching known value', () => {
      const H = getH()
      expect(bytesToHex(H.toRawBytes())).toBe('8b655970153799af2aeadc9ff1add0ea6c7251d54154cfa92c173a0dd39c1f94')
    })

    it('Should create valid commitment C = mask*G + amount*H', () => {
      const mask = scReduce32(new Uint8Array(32).fill(1))
      const amount = BigInt(1000000000000) // 1 XMR

      const C = commit(mask, amount)
      expect(C.toRawBytes().length).toBe(32)

      // Verify: C = mask*G + amount*H
      const maskScalar = bytesToNumberLE(mask)
      const expected = ExtPoint.BASE.multiply(maskScalar).add(getH().multiply(amount))
      expect(C.equals(expected)).toBe(true)
    })

    it('Should create zero-mask commitment', () => {
      const amount = BigInt(500000000000)
      const C = zeroCommit(amount)

      // Should equal amount*H
      const expected = getH().multiply(amount)
      expect(C.equals(expected)).toBe(true)
    })

    it('Commitments should be additive (for balance verification)', () => {
      const mask1 = scReduce32(new Uint8Array(32).fill(1))
      const mask2 = scReduce32(new Uint8Array(32).fill(2))
      const amount1 = BigInt(3000000000000)
      const amount2 = BigInt(7000000000000)

      const C1 = commit(mask1, amount1)
      const C2 = commit(mask2, amount2)

      // C1 + C2 should equal commit(mask1+mask2, amount1+amount2)
      const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')
      const combinedMask = numberToBytesLE((bytesToNumberLE(mask1) + bytesToNumberLE(mask2)) % L, 32)
      const combinedC = commit(new Uint8Array(combinedMask), amount1 + amount2)

      expect(C1.add(C2).equals(combinedC)).toBe(true)
    })
  })

  describe('Key image', () => {
    it('Should generate a 32-byte key image', () => {
      const privKey = scReduce32(new Uint8Array(32).fill(0x42))
      const pubKey = secretKeyToPublicKey(privKey)

      const ki = generateKeyImage(privKey, pubKey)
      expect(ki.length).toBe(32)
    })

    it('Should be deterministic', () => {
      const privKey = scReduce32(new Uint8Array(32).fill(0x42))
      const pubKey = secretKeyToPublicKey(privKey)

      const ki1 = generateKeyImage(privKey, pubKey)
      const ki2 = generateKeyImage(privKey, pubKey)
      expect(bytesToHex(ki1)).toBe(bytesToHex(ki2))
    })

    it('Should produce a valid curve point', () => {
      const privKey = scReduce32(new Uint8Array(32).fill(0x42))
      const pubKey = secretKeyToPublicKey(privKey)

      const ki = generateKeyImage(privKey, pubKey)
      const point = ExtPoint.fromHex(ki) // Should not throw
      expect(point.toRawBytes().length).toBe(32)
    })

    it('Different keys should produce different key images', () => {
      const priv1 = scReduce32(new Uint8Array(32).fill(1))
      const pub1 = secretKeyToPublicKey(priv1)
      const priv2 = scReduce32(new Uint8Array(32).fill(2))
      const pub2 = secretKeyToPublicKey(priv2)

      const ki1 = generateKeyImage(priv1, pub1)
      const ki2 = generateKeyImage(priv2, pub2)
      expect(bytesToHex(ki1)).not.toBe(bytesToHex(ki2))
    })
  })

  describe('Stealth addresses', () => {
    // Set up test keys
    const recipSpendKey = scReduce32(new Uint8Array(32).fill(0x01))
    const recipKeys = deriveKeyPairs(recipSpendKey)
    const txPrivKey = scReduce32(new Uint8Array(32).fill(0xaa))
    const txPubKey = secretKeyToPublicKey(txPrivKey)

    it('Should derive a 32-byte output key', () => {
      const outputKey = deriveOutputKey(txPrivKey, recipKeys.publicViewKey, recipKeys.publicSpendKey, 0)
      expect(outputKey.length).toBe(32)
    })

    it('Should derive different keys for different output indices', () => {
      const key0 = deriveOutputKey(txPrivKey, recipKeys.publicViewKey, recipKeys.publicSpendKey, 0)
      const key1 = deriveOutputKey(txPrivKey, recipKeys.publicViewKey, recipKeys.publicSpendKey, 1)
      expect(bytesToHex(key0)).not.toBe(bytesToHex(key1))
    })

    it('Should allow recipient to derive the matching private key', () => {
      const outputIndex = 0
      const outputPubKey = deriveOutputKey(txPrivKey, recipKeys.publicViewKey, recipKeys.publicSpendKey, outputIndex)

      const inputPrivKey = deriveInputKey(txPubKey, recipKeys.privateViewKey, recipKeys.privateSpendKey, outputIndex)

      // The derived private key should correspond to the output public key
      const derivedPubKey = secretKeyToPublicKey(inputPrivKey)
      expect(bytesToHex(derivedPubKey)).toBe(bytesToHex(outputPubKey))
    })

    it('isOutputForUs should return true for our output', () => {
      const outputIndex = 0
      const outputKey = deriveOutputKey(txPrivKey, recipKeys.publicViewKey, recipKeys.publicSpendKey, outputIndex)

      const result = isOutputForUs(
        txPubKey,
        recipKeys.privateViewKey,
        recipKeys.publicSpendKey,
        outputKey,
        outputIndex,
      )
      expect(result).toBe(true)
    })

    it('isOutputForUs should return false for other output', () => {
      const otherSpendKey = scReduce32(new Uint8Array(32).fill(0x99))
      const otherKeys = deriveKeyPairs(otherSpendKey)
      const outputKey = deriveOutputKey(txPrivKey, otherKeys.publicViewKey, otherKeys.publicSpendKey, 0)

      const result = isOutputForUs(txPubKey, recipKeys.privateViewKey, recipKeys.publicSpendKey, outputKey, 0)
      expect(result).toBe(false)
    })
  })

  describe('ECDH amount encryption', () => {
    const txPrivKey = scReduce32(new Uint8Array(32).fill(0xbb))
    const recipSpendKey = scReduce32(new Uint8Array(32).fill(0xcc))
    const recipKeys = deriveKeyPairs(recipSpendKey)

    it('Should roundtrip encrypt/decrypt', () => {
      const amount = BigInt('2500000000000') // 2.5 XMR
      const sharedSecret = deriveSharedSecret(txPrivKey, recipKeys.publicViewKey)

      const encrypted = encryptAmount(amount, sharedSecret, 0)
      expect(encrypted.length).toBe(8)

      // Recipient derives same shared secret: a*R where R = r*G
      const txPubKey = secretKeyToPublicKey(txPrivKey)
      const recipSharedSecret = deriveSharedSecret(recipKeys.privateViewKey, txPubKey)

      const decrypted = decryptAmount(encrypted, recipSharedSecret, 0)
      expect(decrypted).toBe(amount)
    })

    it('Should produce different ciphertexts for different output indices', () => {
      const amount = BigInt('1000000000000')
      const sharedSecret = deriveSharedSecret(txPrivKey, recipKeys.publicViewKey)

      const enc0 = encryptAmount(amount, sharedSecret, 0)
      const enc1 = encryptAmount(amount, sharedSecret, 1)
      expect(bytesToHex(enc0)).not.toBe(bytesToHex(enc1))
    })

    it('Should produce different ciphertexts for different amounts', () => {
      const sharedSecret = deriveSharedSecret(txPrivKey, recipKeys.publicViewKey)

      const enc1 = encryptAmount(BigInt(1), sharedSecret, 0)
      const enc2 = encryptAmount(BigInt(2), sharedSecret, 0)
      expect(bytesToHex(enc1)).not.toBe(bytesToHex(enc2))
    })
  })
})
