import * as bip39 from 'bip39'
import crypto from 'crypto'
import { blake256 } from 'foundry-primitives-xchainjs'
import { v4 as uuidv4 } from 'uuid'

import { pbkdf2Async } from './utils'

// Constants
const cipher = 'aes-128-ctr' // Encryption cipher
const kdf = 'pbkdf2' // Key derivation function
const prf = 'hmac-sha256' // Pseudorandom function
const dklen = 32 // Derived key length
const c = 262144 // Iteration count
const hashFunction = 'sha256' // Hash function
const meta = 'xchain-keystore' // Metadata

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
 * Generates a new mnemonic phrase.
 * @param {number} size The size of the phrase in words. Default is 12.
 * @returns {string} The generated mnemonic phrase.
 */
export const generatePhrase = (size = 12): string => {
  if (_isNode()) {
    const bytes = crypto.randomBytes((size == 12 ? 128 : 256) / 8)
    const phrase = bip39.entropyToMnemonic(bytes)
    return phrase
  } else {
    const entropy = size == 12 ? 128 : 256
    const phrase = bip39.generateMnemonic(entropy)
    return phrase
  }
}

/**
 * Validates the given mnemonic phrase.
 * @param {string} phrase The mnemonic phrase to validate.
 * @returns {boolean} True if the phrase is valid, otherwise false.
 */
export const validatePhrase = (phrase: string): boolean => {
  return bip39.validateMnemonic(phrase)
}

/**
 * Derives the seed from the given mnemonic phrase.
 * @param {string} phrase The mnemonic phrase.
 * @returns {Buffer} The seed derived from the phrase.
 * @throws {"Invalid BIP39 phrase"} Thrown if the phrase is invalid.
 */
export const getSeed = (phrase: string): Buffer => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }
  return bip39.mnemonicToSeedSync(phrase)
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

  const ID = _isNode() ? require('uuid').v4() : uuidv4()
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
  const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(cipherText)]))

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
    version: 1,
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
  const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))

  if (mac !== keystore.crypto.mac) throw new Error('Invalid password')
  const decipher = crypto.createDecipheriv(
    keystore.crypto.cipher,
    derivedKey.slice(0, 16),
    Buffer.from(keystore.crypto.cipherparams.iv, 'hex'),
  )

  const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return phrase.toString('utf8')
}
