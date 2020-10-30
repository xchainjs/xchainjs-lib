import crypto from 'crypto'
const bech32 = require('bech32')
const sha256 = require('crypto-js/sha256')
const ripemd160 = require('crypto-js/ripemd160')
const hexEncoding = require('crypto-js/enc-hex')

export const getBytes = (string: string): number[] => {
  const arrayBytes: number[] = []
  const buffer = Buffer.from(string, 'utf16le')
  for (let i = 0; i < buffer.length; i++) {
    arrayBytes.push(buffer[i])
  }
  return arrayBytes
}

export const ab2hexstring = (arr: number[]) => {
  let result = ''
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16)
    str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str
    result += str
  }
  return result
}

export const sha256ripemd160 = (hex: string): string => {
  if (typeof hex !== 'string') throw new Error('sha256ripemd160 expects a string')
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`)
  const hexEncoded = hexEncoding.parse(hex)
  const ProgramSha256 = sha256(hexEncoded)
  return ripemd160(ProgramSha256).toString()
}

export const encodeAddress = (value: string | Buffer, prefix = 'thor', type: BufferEncoding = 'hex'): string => {
  let words
  if (Buffer.isBuffer(value)) {
    words = bech32.toWords(Buffer.from(value))
  } else {
    words = bech32.toWords(Buffer.from(value, type))
  }
  return bech32.encode(prefix, words)
}

export const createAddress = (publicKey: number[]): string => {
  const hexed = ab2hexstring(publicKey)
  const hash = sha256ripemd160(hexed)
  const address = encodeAddress(hash, 'thor')
  return address
}

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
