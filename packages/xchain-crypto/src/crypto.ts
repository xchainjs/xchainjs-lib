import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { bytesToHex } from '@noble/hashes/utils'
import crypto from 'crypto'
import { blake2b } from '@noble/hashes/blake2'
import { v4 as uuidv4 } from 'uuid'

import { pbkdf2Async } from './utils'

const cipher = 'aes-128-ctr'
const kdf = 'pbkdf2'
const prf = 'hmac-sha256'
const dklen = 32
const c = 600000 // OWASP-recommended minimum for PBKDF2-HMAC-SHA256
const hashFunction = 'sha256'
const meta = 'xchain-keystore'
/** Keystore version written by `encryptToKeyStore`. v2 adds the IV to the MAC input. */
export const KEYSTORE_VERSION = 2
const SUPPORTED_VERSIONS = [1, 2]
const IV_LENGTH = 16
// Accepted PBKDF2 iteration range. The upper bound stops a crafted keystore from hanging the unlock.
// The lower bound is deliberately just 1 (not the current default of 600,000): the iteration count is
// stored in each keystore and older files were written with much lower counts (e.g. 262,144), and
// possibly lower still in the earliest releases. Raising the floor would lock users out of legacy files.
const MIN_PBKDF2_ITERATIONS = 1
const MAX_PBKDF2_ITERATIONS = 10_000_000

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

const _isNode = (): boolean => {
  return typeof window === 'undefined'
}

const constantTimeEqual = (a: Buffer, b: Buffer): boolean => {
  if (a.length !== b.length) return false
  if (typeof crypto.timingSafeEqual === 'function') return crypto.timingSafeEqual(a, b)
  // Fallback for browser polyfills (crypto-browserify) that lack timingSafeEqual
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

const isHex = (value: unknown): value is string =>
  typeof value === 'string' && value.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(value)

// Compute the keystore MAC. macKey is the second half of the derived key (bytes 16..32).
// v1: blake2b(macKey || ciphertext); v2+: blake2b(macKey || iv || ciphertext).
const computeMac = (version: number, macKey: Buffer, iv: Buffer, ciphertext: Buffer): Buffer => {
  const parts = version >= 2 ? [macKey, iv, ciphertext] : [macKey, ciphertext]
  return Buffer.from(blake2b(Buffer.concat(parts), { dkLen: 32 }))
}

/**
 * Strictly validate the untrusted keystore parameters before any key derivation happens.
 * Throws a descriptive error if anything is unexpected.
 */
const validateKeystore = (keystore: Keystore): { version: number; iv: Buffer; salt: Buffer } => {
  const cryptoSection = keystore?.crypto
  if (!cryptoSection || typeof cryptoSection !== 'object') throw new Error('Invalid keystore: missing crypto section')
  const version = keystore.version
  if (typeof version !== 'number' || !SUPPORTED_VERSIONS.includes(version))
    throw new Error(`Invalid keystore: unsupported version ${String(version)}`)
  if (cryptoSection.cipher !== cipher)
    throw new Error(`Invalid keystore: unsupported cipher ${String(cryptoSection.cipher)}`)
  if (cryptoSection.kdf !== kdf) throw new Error(`Invalid keystore: unsupported kdf ${String(cryptoSection.kdf)}`)
  const kdfparams = cryptoSection.kdfparams
  if (!kdfparams || typeof kdfparams !== 'object') throw new Error('Invalid keystore: missing kdfparams')
  if (kdfparams.prf !== prf) throw new Error(`Invalid keystore: unsupported prf ${String(kdfparams.prf)}`)
  if (kdfparams.dklen !== dklen) throw new Error(`Invalid keystore: dklen must be ${dklen}`)
  if (!Number.isInteger(kdfparams.c) || kdfparams.c < MIN_PBKDF2_ITERATIONS || kdfparams.c > MAX_PBKDF2_ITERATIONS)
    throw new Error(
      `Invalid keystore: iteration count must be an integer between ${MIN_PBKDF2_ITERATIONS} and ${MAX_PBKDF2_ITERATIONS}`,
    )
  if (typeof kdfparams.salt !== 'string' || kdfparams.salt.length === 0 || !isHex(kdfparams.salt))
    throw new Error('Invalid keystore: missing or malformed salt')
  const ivHex = cryptoSection.cipherparams?.iv
  if (!isHex(ivHex) || ivHex.length !== IV_LENGTH * 2)
    throw new Error(`Invalid keystore: iv must be ${IV_LENGTH} bytes`)
  if (!isHex(cryptoSection.ciphertext) || cryptoSection.ciphertext.length === 0)
    throw new Error('Invalid keystore: missing or malformed ciphertext')
  if (!isHex(cryptoSection.mac) || cryptoSection.mac.length === 0)
    throw new Error('Invalid keystore: missing or malformed mac')
  return { version, iv: Buffer.from(ivHex, 'hex'), salt: Buffer.from(kdfparams.salt, 'hex') }
}

/**
 * Whether the keystore was written in an older format and should be re-encrypted
 * (via `encryptToKeyStore`) after a successful unlock.
 */
export const keystoreNeedsUpgrade = (keystore: Pick<Keystore, 'version'>): boolean =>
  typeof keystore.version !== 'number' || keystore.version < KEYSTORE_VERSION

export const generatePhrase = (size = 12): string => {
  const strength = size === 12 ? 128 : 256
  return generateMnemonic(wordlist, strength)
}

export const validatePhrase = (phrase: string): boolean => {
  return validateMnemonic(phrase, wordlist)
}

export const getSeed = (phrase: string): Uint8Array => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }
  return mnemonicToSeedSync(phrase)
}

export const phraseToEntropy = (phrase: string): string => {
  const entropyBytes = mnemonicToEntropy(phrase, wordlist)
  return bytesToHex(entropyBytes)
}

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
  const cipherIV = crypto.createCipheriv(cipher, derivedKey.slice(0, 16), iv)
  const cipherText = Buffer.concat([cipherIV.update(Buffer.from(phrase, 'utf8')), cipherIV.final()])
  const mac: string = computeMac(KEYSTORE_VERSION, derivedKey.slice(16, 32), iv, cipherText).toString('hex')

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
    version: KEYSTORE_VERSION,
    meta: meta,
  }

  return keystore
}

export const decryptFromKeystore = async (keystore: Keystore, password: string): Promise<string> => {
  const { version, iv, salt } = validateKeystore(keystore)
  const kdfparams = keystore.crypto.kdfparams
  const derivedKey = await pbkdf2Async(Buffer.from(password), salt, kdfparams.c, dklen, hashFunction)

  const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex')
  const computedMac = computeMac(version, derivedKey.slice(16, 32), iv, ciphertext)
  const expectedMac = Buffer.from(keystore.crypto.mac, 'hex')

  // Constant-time comparison to avoid leaking MAC bytes via timing
  if (!constantTimeEqual(computedMac, expectedMac)) throw new Error('Invalid password')
  const decipher = crypto.createDecipheriv(cipher, derivedKey.slice(0, 16), iv)

  const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return phrase.toString('utf8')
}
