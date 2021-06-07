import crypto from 'crypto'
import * as bech32 from 'bech32'
import sha256 from 'crypto-js/sha256'
import ripemd160 from 'crypto-js/ripemd160'
import hexEncoding from 'crypto-js/enc-hex'

/**
 * Convert string to bytes.
 *
 * @param {string} string
 * @returns {number[]} The bytes from the given string.
 */
export const getBytes = (string: string): number[] => {
  const arrayBytes: number[] = []
  const buffer = Buffer.from(string, 'utf16le')
  for (let i = 0; i < buffer.length; i++) {
    arrayBytes.push(buffer[i])
  }
  return arrayBytes
}

/**
 * Convert Buffer to hex string.
 *
 * @param {Buffer} arr
 * @returns {string} The hex string from the given buffer.
 */
export const ab2hexstring = (arr: Buffer) => {
  let result = ''
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16)
    str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str
    result += str
  }
  return result
}

/**
 * Calculate `ripemd160(sha256(hex))` from the hex string
 *
 * @param {string} hex The hex encoded string.
 * @returns {string} The hex string from the given buffer.
 *
 * @throws {"sha256ripemd160 expects a string"} Thrown if non-string is provided.
 * @throws {"invalid hex string length"} Thrown if the given hex string is an invalid one.
 */
export const sha256ripemd160 = (hex: string): string => {
  if (typeof hex !== 'string') throw new Error('sha256ripemd160 expects a string')
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`)
  const hexEncoded = hexEncoding.parse(hex)
  const ProgramSha256 = sha256(hexEncoded)
  return ripemd160(ProgramSha256).toString()
}

/**
 * Encode address from the string or Buffer.
 *
 * @param {string|Buffer} value The string or Buffer to be encoded.
 * @param {string} prefix The prefix of the address. (optional)
 * @param {BufferEncoding} type The buffer encoding type. It will be used when string is provided. (optional)
 * @returns {string} The address generated from the given string or buffer.
 */
export const encodeAddress = (value: string | Buffer, prefix = 'thor', type: BufferEncoding = 'hex'): string => {
  let words
  if (Buffer.isBuffer(value)) {
    words = bech32.toWords(Buffer.from(value))
  } else {
    words = bech32.toWords(Buffer.from(value, type))
  }
  return bech32.encode(prefix, words)
}

const addrKey: { [key: string]: string } = {}

/**
 * Create address from the public key.
 *
 * @param {Buffer} publicKey The public key in Buffer format.
 * @returns {string} The address generated from the given public key(buffer format).
 */
export const createAddress = (publicKey: Buffer): string => {
  if (addrKey[publicKey.toString()]) {
    return addrKey[publicKey.toString()]
  }
  const hexed = ab2hexstring(publicKey)
  const hash = sha256ripemd160(hexed)
  const address = encodeAddress(hash, 'thor')

  addrKey[publicKey.toString()] = address
  return address
}

const pkbCache: { [key: string]: Buffer } = {}

/**
 * Calculate pbkdf2 (Password-Based Key Derivation Function 2).
 *
 * @param {string|Buffer|Array|DataView} passphrase.
 * @param {string|Buffer|Array|DataView} salt
 * @param {number} iterations
 * @param {number} keylen
 * @param {string} digest
 * @returns {Buffer} The pbkdf2 value from the given options.
 */
export const pbkdf2Async = async (
  passphrase: string | Buffer | NodeJS.TypedArray | DataView,
  salt: string | Buffer | NodeJS.TypedArray | DataView,
  iterations: number,
  keylen: number,
  digest: string,
): Promise<Buffer> => {
  const cacheKey = passphrase + String(salt) + iterations + keylen + digest
  if (pkbCache[cacheKey]) {
    return pkbCache[cacheKey]
  }
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, iterations, keylen, digest, (err, drived) => {
      if (err) {
        reject(err)
      } else {
        pkbCache[cacheKey] = drived
        resolve(drived)
      }
    })
  })
}
