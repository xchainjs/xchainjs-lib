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

// Interfaces

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

export const generatePhrase = (size = 12): string => {
  const entropy = size == 12 ? 128 : 256
  const phrase = bip39.generateMnemonic(entropy)
  return phrase
}

export const validatePhrase = (phrase: string): boolean => {
  return bip39.validateMnemonic(phrase)
}

export const getSeed = (phrase: string): Buffer => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }

  return bip39.mnemonicToSeedSync(phrase)
}

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
      return Promise.reject('invalid password')
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
