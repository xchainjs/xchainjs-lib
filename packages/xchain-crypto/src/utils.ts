import { bech32 } from 'bech32'
import crypto from 'crypto'
import cryptojs from 'crypto-js'

const ripemd160 = cryptojs.RIPEMD160,
  sha256 = cryptojs.SHA256,
  hexEncoding = cryptojs.enc.Hex

/**
 * Convert a string to an array of bytes.
 *
 * @param {string} string The input string to be converted.
 * @returns {number[]} The bytes representing the input string.
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
 * Convert a Buffer to a hexadecimal string.
 *
 * @param {Buffer} arr The input Buffer to be converted.
 * @returns {string} The hexadecimal string representing the input Buffer.
 */
export const ab2hexstring = (arr: Buffer): string => {
  let result = ''
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16)
    str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str
    result += str
  }
  return result
}

/**
 * Calculate `ripemd160(sha256(hex))` from a hexadecimal string.
 *
 * @param {string} hex The input hexadecimal string.
 * @returns {string} The result of the hash operation.
 *
 * @throws {"sha256ripemd160 expects a string"} Thrown if a non-string input is provided.
 * @throws {"invalid hex string length"} Thrown if the input hexadecimal string has an invalid length.
 */
export const sha256ripemd160 = (hex: string): string => {
  if (typeof hex !== 'string') throw new Error('sha256ripemd160 expects a string')
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`)
  const hexEncoded = hexEncoding.parse(hex)
  const ProgramSha256 = sha256(hexEncoded)
  return ripemd160(ProgramSha256).toString()
}

/**
 * Encode an address from a string or Buffer.
 *
 * @param {string | Buffer} value The input string or Buffer to be encoded.
 * @param {string} prefix The prefix of the address. (optional)
 * @param {BufferEncoding} type The buffer encoding type. It is used when a string is provided. (optional)
 * @returns {string} The address generated from the input string or Buffer.
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

/**
 * Create an address from a public key.
 *
 * @param {Buffer} publicKey The public key in Buffer format.
 * @returns {string} The address generated from the input public key (Buffer format).
 */
export const createAddress = (publicKey: Buffer): string => {
  const hexed = ab2hexstring(publicKey)
  const hash = sha256ripemd160(hexed)
  const address = encodeAddress(hash, 'thor')
  return address
}

/**
 * Calculate pbkdf2 (Password-Based Key Derivation Function 2).
 *
 * @param {string | Buffer | NodeJS.TypedArray | DataView} passphrase The passphrase.
 * @param {string | Buffer | NodeJS.TypedArray | DataView} salt The salt.
 * @param {number} iterations The number of iterations.
 * @param {number} keylen The length of the derived key.
 * @param {string} digest The digest algorithm.
 * @returns {Buffer} The derived key.
 */
export const pbkdf2Async = async (
  passphrase: string | Buffer | NodeJS.TypedArray | DataView,
  salt: string | Buffer | NodeJS.TypedArray | DataView,
  iterations: number,
  keylen: number,
  digest: string,
): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, iterations, keylen, digest, (err, drived) => {
      if (err) {
        reject(err)
      } else {
        resolve(drived)
      }
    })
  })
}
