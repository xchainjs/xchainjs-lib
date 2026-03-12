import { getSeed } from '@xchainjs/xchain-crypto'
import slip10 from 'micro-key-producer/slip10.js'

import { encodeAddress } from '../src/crypto/address'
import { cnBase58Decode, cnBase58Encode } from '../src/crypto/base58monero'
import { deriveKeyPairs, derivePrivateViewKey, secretKeyToPublicKey } from '../src/crypto/keys'
import { bytesToHex, hexToBytes, scReduce32 } from '../src/utils'

const TEST_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('Monero Crypto (pure JS)', () => {
  describe('scReduce32', () => {
    it('Should reduce a 32-byte value mod ed25519 order', () => {
      const input = new Uint8Array(32).fill(0xff)
      const reduced = scReduce32(input)
      expect(reduced.length).toBe(32)
      // Should not be all 0xff anymore
      expect(bytesToHex(reduced)).not.toBe(bytesToHex(input))
    })

    it('Should be a no-op for a value already below the order', () => {
      const small = new Uint8Array(32)
      small[0] = 1
      const reduced = scReduce32(small)
      expect(bytesToHex(reduced)).toBe(bytesToHex(small))
    })

    it('Should throw for wrong length', () => {
      expect(() => scReduce32(new Uint8Array(16))).toThrow('scReduce32 expects 32 bytes')
    })
  })

  describe('secretKeyToPublicKey', () => {
    it('Should derive a 32-byte public key from a private key', () => {
      const privateKey = scReduce32(new Uint8Array(32).fill(1))
      const publicKey = secretKeyToPublicKey(privateKey)
      expect(publicKey.length).toBe(32)
    })
  })

  describe('derivePrivateViewKey', () => {
    it('Should derive a 32-byte view key from a spend key', () => {
      const spendKey = scReduce32(new Uint8Array(32).fill(1))
      const viewKey = derivePrivateViewKey(spendKey)
      expect(viewKey.length).toBe(32)
      // View key should differ from spend key
      expect(bytesToHex(viewKey)).not.toBe(bytesToHex(spendKey))
    })
  })

  describe('deriveKeyPairs', () => {
    it('Should derive all four keys', () => {
      const spendKey = scReduce32(new Uint8Array(32).fill(1))
      const keys = deriveKeyPairs(spendKey)

      expect(keys.privateSpendKey.length).toBe(32)
      expect(keys.publicSpendKey.length).toBe(32)
      expect(keys.privateViewKey.length).toBe(32)
      expect(keys.publicViewKey.length).toBe(32)

      // Public keys should differ from private keys
      expect(bytesToHex(keys.publicSpendKey)).not.toBe(bytesToHex(keys.privateSpendKey))
      expect(bytesToHex(keys.publicViewKey)).not.toBe(bytesToHex(keys.privateViewKey))
    })
  })

  describe('base58monero', () => {
    it('Should roundtrip encode/decode', () => {
      const data = new Uint8Array(69)
      data[0] = 0x12 // mainnet prefix
      for (let i = 1; i < 69; i++) data[i] = i & 0xff

      const encoded = cnBase58Encode(data)
      const decoded = cnBase58Decode(encoded)
      expect(bytesToHex(decoded)).toBe(bytesToHex(data))
    })

    it('Should produce 95-char address for 69 bytes', () => {
      const data = new Uint8Array(69)
      data[0] = 0x12
      const encoded = cnBase58Encode(data)
      expect(encoded.length).toBe(95)
    })
  })

  describe('encodeAddress', () => {
    it('Should encode a 95-character address', () => {
      const pubSpend = new Uint8Array(32)
      const pubView = new Uint8Array(32)
      pubSpend[0] = 1
      pubView[0] = 2

      const address = encodeAddress(pubSpend, pubView, 0) // mainnet
      expect(address.length).toBe(95)
      expect(address[0]).toBe('4') // mainnet primary addresses start with 4
    })
  })

  describe('Full derivation from mnemonic', () => {
    it('Should derive the known address for abandon mnemonic', () => {
      const seed = getSeed(TEST_PHRASE)
      const hd = slip10.fromMasterSeed(seed)
      const derivedKey = hd.derive("m/44'/128'/0'").privateKey

      const spendKey = scReduce32(derivedKey)
      const keys = deriveKeyPairs(spendKey)

      const address = encodeAddress(keys.publicSpendKey, keys.publicViewKey, 0)

      expect(address).toBe(
        '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
      )
    })

    it('Should produce consistent spend/view key hex values', () => {
      const seed = getSeed(TEST_PHRASE)
      const hd = slip10.fromMasterSeed(seed)
      const derivedKey = hd.derive("m/44'/128'/0'").privateKey

      const spendKey = scReduce32(derivedKey)
      const keys = deriveKeyPairs(spendKey)

      // These are deterministic — any change would break address derivation
      const spendKeyHex = bytesToHex(keys.privateSpendKey)
      const viewKeyHex = bytesToHex(keys.privateViewKey)

      expect(spendKeyHex.length).toBe(64)
      expect(viewKeyHex.length).toBe(64)
      // Re-derive to ensure consistency
      const keys2 = deriveKeyPairs(hexToBytes(spendKeyHex))
      expect(bytesToHex(keys2.publicSpendKey)).toBe(bytesToHex(keys.publicSpendKey))
      expect(bytesToHex(keys2.publicViewKey)).toBe(bytesToHex(keys.publicViewKey))
    })
  })
})
