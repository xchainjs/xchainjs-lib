import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { blake2bFinal, blake2bInit, blake2bUpdate } from 'blakejs'
import crypto from 'crypto'

const blake256 = (initData: Buffer | string): string => {
  let data = initData

  if (!(data instanceof Buffer)) {
    data = Buffer.from(data, 'hex')
  }

  const context = blake2bInit(32)
  blake2bUpdate(context, data)

  return Array.from(blake2bFinal(context))
    .map((byte) => (byte < 0x10 ? `0${byte.toString(16)}` : byte.toString(16)))
    .join('')
}

const pbkdf2Async = (
  passphrase: string | Buffer,
  salt: string | Buffer,
  iterations: number,
  keylen: number,
  digest: string,
) =>
  new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, iterations, keylen, digest, (error, drived) => {
      if (error) {
        reject(error)
      } else {
        resolve(drived)
      }
    })
  })

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
  version: number
  meta: string
}

/**
 * Generates a new mnemonic phrase.
 * @param {number} size The size of the phrase in words. Default is 12.
 * @returns {string} The generated mnemonic phrase.
 */
export const generatePhrase = (size = 12): string => {
  const entropy = size == 12 ? 128 : 256
  const phrase = generateMnemonic(wordlist, entropy)
  return phrase
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
export const getSeed = (phrase: string): Buffer => {
  if (!validatePhrase(phrase)) {
    throw new Error('Invalid BIP39 phrase')
  }
  return Buffer.from(mnemonicToSeedSync(phrase))
}

/**
 * Encrypts the given phrase to a keystore object using the provided password.
 * @param {string} phrase The mnemonic phrase to encrypt.
 * @param {string} password The password used for encryption.
 * @returns {Promise<Keystore>} A promise that resolves to the generated keystore object.
 * @throws {Error} Thrown if the phrase is invalid.
 */
export const encryptToKeyStore = async (phrase: string, password: string): Promise<Keystore> => {
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const kdfParams = { c: 262144, prf: 'hmac-sha256', dklen: 32, salt: salt.toString('hex') }
  const cipher = 'aes-128-ctr'

  const derivedKey = await pbkdf2Async(Buffer.from(password), salt, kdfParams.c, kdfParams.dklen, 'sha256')
  const cipherIV = crypto.createCipheriv(cipher, derivedKey.subarray(0, 16), iv)
  const ciphertext = Buffer.concat([cipherIV.update(Buffer.from(phrase, 'utf8')), cipherIV.final()])

  return {
    meta: 'xchain-keystore',
    version: 1,
    crypto: {
      cipher,
      cipherparams: { iv: iv.toString('hex') },
      ciphertext: ciphertext.toString('hex'),
      kdf: 'pbkdf2',
      kdfparams: kdfParams,
      mac: blake256(Buffer.concat([derivedKey.subarray(16, 32), Buffer.from(ciphertext)])),
    },
  }
}

/**
 * Decrypts the mnemonic phrase from the provided keystore using the given password.
 * @param {Keystore} keystore The keystore object containing encrypted data.
 * @param {string} password The password used for decryption.
 * @returns {Keystore} A promise that resolves to the decrypted mnemonic phrase.
 * @throws {"Invalid password"} Thrown if the password is incorrect.
 */
export const decryptFromKeystore = async (keystore: Keystore, password: string): Promise<string> => {
  switch (keystore.version) {
    case 1: {
      const kdfparams = keystore.crypto.kdfparams
      const derivedKey = await pbkdf2Async(
        Buffer.from(password),
        Buffer.from(kdfparams.salt, 'hex'),
        kdfparams.c,
        kdfparams.dklen,
        'sha256',
      )

      const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex')
      const mac = blake256(Buffer.concat([derivedKey.subarray(16, 32), ciphertext]))

      if (mac !== keystore.crypto.mac) throw new Error('Invalid password')
      const decipher = crypto.createDecipheriv(
        keystore.crypto.cipher,
        derivedKey.subarray(0, 16),
        Buffer.from(keystore.crypto.cipherparams.iv, 'hex'),
      )

      const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()])
      return phrase.toString('utf8')
    }

    default:
      throw new Error('Unsupported keystore version')
  }
}
