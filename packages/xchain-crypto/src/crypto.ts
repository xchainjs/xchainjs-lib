import crypto from 'crypto'
import { pbkdf2Async } from './utils'

import * as bip39 from 'bip39'
import { blake256 } from 'foundry-primitives'
import { v4 as uuidv4 } from 'uuid'

// Constants
const cipher = 'aes-128-ctr'
const kdf = 'pbkdf2'
const prf = 'hmac-sha256'
const dklen = 32
const c = 262144
const hashFunction = 'sha256'
const meta = 'xchain-keystore'

/**
 * The Keystore interface
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
 * Determines if the current environment is node
 *
 * @returns {boolean} True if current environment is node
 */
 const _isNode = (): boolean => {
  return typeof window === 'undefined'
}

/**
 * Generate a new phrase.
 *
 * @param {string} size The new phrase size.
 * @returns {string} The generated phrase based on the size.
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
 * Validate the given phrase.
 *
 * @param {string} phrase
 * @returns {boolean} `true` or `false`
 */
export const validatePhrase = (phrase: string): boolean => {
  return bip39.validateMnemonic(phrase)
}

/**
 * Get the seed from the given phrase.
 *
 * @param {string} phrase
 * @returns {Buffer} The seed from the given phrase.
 *
 * @throws {"Invalid BIP39 phrase"} Thrown if phrase is an invalid one.
 */
export const getSeed = (phrase: string): Buffer => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }

  return bip39.mnemonicToSeedSync(phrase)
}

/**
 * Get the Keystore interface from the given phrase and password.
 *
 * @param {string} phrase
 * @param {string} password
 * @returns {Keystore} The keystore interface generated from the given phrase and password.
 *
 * @throws {"Invalid BIP39 phrase"} Thrown if phrase is an invalid one.
 */
export const encryptToKeyStore = async (phrase: string, password: string): Promise<Keystore> => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }

  const ID = uuidv4()
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
 * Get the phrase from the keystore
 *
 * @param {Keystore} keystore
 * @param {string} password
 * @returns {Keystore} The phrase from the keystore.
 *
 * @throws {"Invalid password"} Thrown if password is an incorrect one.
 */
export const decryptFromKeystore = async (keystore: Keystore, password: string): Promise<string> => {
  const kdfparams = keystore.crypto.kdfparams
  try {
    const derivedKey = await pbkdf2Async(
      Buffer.from(password),
      Buffer.from(kdfparams.salt, 'hex'),
      kdfparams.c,
      kdfparams.dklen,
      hashFunction,
    )

    const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex')
    const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))

    if (mac !== keystore.crypto.mac) {
      return Promise.reject('Invalid password')
    }
    const decipher = crypto.createDecipheriv(
      keystore.crypto.cipher,
      derivedKey.slice(0, 16),
      Buffer.from(keystore.crypto.cipherparams.iv, 'hex'),
    )

    const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return Promise.resolve(phrase.toString('utf8'))
  } catch (error) {
    return Promise.reject(error)
  }
}
