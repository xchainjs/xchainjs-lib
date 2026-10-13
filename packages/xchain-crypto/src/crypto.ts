import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { bytesToHex } from '@noble/hashes/utils'
import crypto from 'crypto'
import { blake2b } from '@noble/hashes/blake2'
import { v4 as uuidv4 } from 'uuid'

import { pbkdf2Async } from './utils'

// Constants
const cipher = 'aes-256-ctr' // Encryption cipher (keystore v2). Legacy v1 keystores use aes-128-ctr.
const kdf = 'pbkdf2' // Key derivation function
const prf = 'hmac-sha256' // Pseudorandom function
const dklen = 64 // Derived key length: 32-byte AES-256 key + 32-byte independent MAC key
const c = 600000 // Iteration count (OWASP-recommended minimum for PBKDF2-HMAC-SHA256)
const hashFunction = 'sha256' // Hash function
const meta = 'xchain-keystore' // Metadata
const keystoreVersion = 2 // Keystore format version written by encryptToKeyStore

/**
 * Returns the AES key length in bytes for a supported keystore cipher.
 *
 * The keystore is self-describing: its `cipher` field determines how many of the
 * PBKDF2-derived bytes are the AES key; the remaining `dklen - keyLength` bytes are
 * the independent MAC key. This lets legacy v1 keystores (aes-128-ctr, 16-byte key,
 * dklen 32) stay decryptable alongside v2 (aes-256-ctr, 32-byte key, dklen 64).
 *
 * @param {string} cipherName The cipher name read from the keystore.
 * @returns {number} AES key length in bytes.
 * @throws {Error} Thrown if the cipher is not supported.
 */
const aesKeyLengthForCipher = (cipherName: string): number => {
  switch (cipherName) {
    case 'aes-256-ctr':
      return 32
    case 'aes-128-ctr':
      return 16
    default:
      throw new Error(`Unsupported keystore cipher: ${cipherName}`)
  }
}

/**
 * The Keystore interface.
 * Represents the structure of a keystore object.
 */
export type Keystore = {
  crypto: {
    cipher: string
    ciphertext: string
    cipherparams: {
      iv: string
    }
    kdf: string
    kdfparams: {
      prf: string
      dklen: number
      salt: string
      c: number
    }
    mac: string
  }
  id: string
  version: number
  meta: string
}

/**
 * Determines if the current environment is Node.js.
 * @returns {boolean} True if the current environment is Node.js.
 */
const _isNode = (): boolean => {
  return typeof window === 'undefined'
}

/**
 * Constant-time comparison of two equal-length buffers.
 *
 * Uses Node's `crypto.timingSafeEqual` when available, and falls back to a
 * manual constant-time comparison for browser/bundler environments whose
 * `crypto` polyfill (e.g. `crypto-browserify`) does not implement it.
 *
 * @param {Buffer} a First buffer.
 * @param {Buffer} b Second buffer.
 * @returns {boolean} True if the buffers are equal in constant time.
 */
const constantTimeEqual = (a: Buffer, b: Buffer): boolean => {
  if (a.length !== b.length) return false
  if (typeof crypto.timingSafeEqual === 'function') return crypto.timingSafeEqual(a, b)
  // Fallback for browser polyfills (crypto-browserify) that lack timingSafeEqual
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

/**
 * Generates a new mnemonic phrase.
 * @param {number} size The size of the phrase in words. Default is 12.
 * @returns {string} The generated mnemonic phrase.
 */
export const generatePhrase = (size = 12): string => {
  const strength = size === 12 ? 128 : 256
  return generateMnemonic(wordlist, strength)
}

/**
 * Validates the given mnemonic phrase.
 * @param {string} phrase The mnemonic phrase to validate.
 * @returns {boolean} True if the phrase is valid, otherwise false.
 */
export const validatePhrase = (phrase: string): boolean => {
  return validateMnemonic(phrase, wordlist)
}

/**
 * Derives the seed from the given mnemonic phrase.
 * @param {string} phrase The mnemonic phrase.
 * @returns {Buffer} The seed derived from the phrase.
 * @throws {"Invalid BIP39 phrase"} Thrown if the phrase is invalid.
 */
export const getSeed = (phrase: string): Uint8Array => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }
  return mnemonicToSeedSync(phrase)
}

/**
 * Convert a mnemonic phrase back into the entropy
 * @param {string} phrase - Phrase
 * @returns the entropy phrase
 */
export const phraseToEntropy = (phrase: string): string => {
  const entropyBytes = mnemonicToEntropy(phrase, wordlist) // Uint8Array
  return bytesToHex(entropyBytes) // convert to hex string
}
/**
 * Encrypts the given phrase to a keystore object using the provided password.
 * @param {string} phrase The mnemonic phrase to encrypt.
 * @param {string} password The password used for encryption.
 * @returns {Promise<Keystore>} A promise that resolves to the generated keystore object.
 * @throws {Error} Thrown if the phrase is invalid.
 */
export const encryptToKeyStore = async (phrase: string, password: string): Promise<Keystore> => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }

  const ID = _isNode() ? (await import('uuid')).v4() : uuidv4()
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const kdfParams = {
    prf: prf,
    dklen: dklen,
    salt: salt.toString('hex'),
    c: c,
  }
  const cipherParams = {
    iv: iv.toString('hex'),
  }

  const derivedKey = await pbkdf2Async(Buffer.from(password), salt, kdfParams.c, kdfParams.dklen, hashFunction)
  // Split the derived key into an AES key and an independent MAC key — the two key
  // materials must not overlap, so the MAC key is the bytes after the AES key.
  const aesKeyLength = aesKeyLengthForCipher(cipher)
  const encryptionKey = derivedKey.slice(0, aesKeyLength)
  const macKey = derivedKey.slice(aesKeyLength, kdfParams.dklen)
  const cipherIV = crypto.createCipheriv(cipher, encryptionKey, iv)
  const cipherText = Buffer.concat([cipherIV.update(Buffer.from(phrase, 'utf8')), cipherIV.final()])
  const mac_bytes: Uint8Array = blake2b(Buffer.concat([macKey, Buffer.from(cipherText)]), {
    dkLen: 32,
  })
  const mac: string = Buffer.from(mac_bytes).toString('hex')

  const cryptoStruct = {
    cipher: cipher,
    ciphertext: cipherText.toString('hex'),
    cipherparams: cipherParams,
    kdf: kdf,
    kdfparams: kdfParams,
    mac: mac,
  }

  const keystore = {
    crypto: cryptoStruct,
    id: ID,
    version: keystoreVersion,
    meta: meta,
  }

  return keystore
}

/**
 * Decrypts the mnemonic phrase from the provided keystore using the given password.
 * @param {Keystore} keystore The keystore object containing encrypted data.
 * @param {string} password The password used for decryption.
 * @returns {Keystore} A promise that resolves to the decrypted mnemonic phrase.
 * @throws {"Invalid password"} Thrown if the password is incorrect.
 */
export const decryptFromKeystore = async (keystore: Keystore, password: string): Promise<string> => {
  const kdfparams = keystore.crypto.kdfparams
  const derivedKey = await pbkdf2Async(
    Buffer.from(password),
    Buffer.from(kdfparams.salt, 'hex'),
    kdfparams.c,
    kdfparams.dklen,
    hashFunction,
  )

  const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex')
  // Derive the AES key / MAC key split from the keystore's own cipher and dklen, so
  // legacy v1 (aes-128-ctr, 16-byte key) and v2 (aes-256-ctr, 32-byte key) both decrypt.
  const aesKeyLength = aesKeyLengthForCipher(keystore.crypto.cipher)
  const encryptionKey = derivedKey.slice(0, aesKeyLength)
  const macKey = derivedKey.slice(aesKeyLength, kdfparams.dklen)
  const mac_bytes: Uint8Array = blake2b(Buffer.concat([macKey, ciphertext]), { dkLen: 32 })
  const computedMac = Buffer.from(mac_bytes)
  const expectedMac = Buffer.from(keystore.crypto.mac, 'hex')

  // Constant-time comparison to avoid leaking MAC bytes via timing
  if (computedMac.length !== expectedMac.length || !constantTimeEqual(computedMac, expectedMac))
    throw new Error('Invalid password')
  const decipher = crypto.createDecipheriv(
    keystore.crypto.cipher,
    encryptionKey,
    Buffer.from(keystore.crypto.cipherparams.iv, 'hex'),
  )

  const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return phrase.toString('utf8')
}
