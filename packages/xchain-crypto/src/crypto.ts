import crypto from 'crypto'
import { pbkdf2Async, createAddress } from './utils'
import { PubKeySecp256k1, PrivKeySecp256k1 } from './secp256k1'
import { PubKeyEd25519, PrivKeyEd25519 } from './ed25519'

const bip39 = require('bip39')
const HDKey = require('hdkey')
const { blake256 } = require('foundry-primitives')
const { v4: uuidv4 } = require('uuid')

// Constants
const XChainBIP39Phrase = 'xchain'
const BIP44Path = "m/44'/931'/0'/0/0"
const cipher = 'aes-128-ctr'
const kdf = 'pbkdf2'
const prf = 'hmac-sha256'
const dklen = 32
const c = 262144
const hashFunction = 'sha256'
const meta = 'xchain-keystore'

// Interfaces

export type PublicKeyPair = {
  secp256k1: PubKeySecp256k1
  ed25519: PubKeyEd25519
}

export type Keystore = {
  publickeys: PublicKeyPair
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

export const getSeed = (phrase: string): string => {
  const words = phrase.split(' ')
  if (words.length != 12 && words.length != 24) {
    throw new Error('invalid phrase')
  }
  const seed = bip39.mnemonicToSeedSync(phrase, XChainBIP39Phrase)
  return seed
}

export const getAddress = (phrase: string): string => {
  const seed = getSeed(phrase)
  const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
  const childkey = hdkey.derive(BIP44Path)
  const address = createAddress(childkey._publicKey)
  return address
}

export const getPublicKeyPair = (phrase: string): PublicKeyPair => {
  const seed = getSeed(phrase)
  const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
  const childkey = hdkey.derive(BIP44Path)

  return {
    secp256k1: new PrivKeySecp256k1(childkey.privateKey).getPubKey(),
    ed25519: new PrivKeyEd25519(childkey.privateKey).getPubKey(),
  }
}

export const encryptToKeyStore = async (phrase: string, password: string): Promise<Keystore> => {
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
    publickeys: getPublicKeyPair(phrase),
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
