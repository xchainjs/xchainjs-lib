const unorm = require('unorm')
import RNSimple from 'react-native-simple-crypto'

function salt(password: string) {
  return 'mnemonic' + (unorm.nfkd(password) || '') // Use unorm until String.prototype.normalize gets better browser support
}

function lpad(str: string, padString: string, length: number) {
  while (str.length < length) str = padString + str
  return str
}

function bytesToBinary(bytes: ArrayBuffer): string {
  return [...Buffer.from(bytes)]
    .map(function (x) {
      return lpad(x.toString(2), '0', 8)
    })
    .join('')
}

async function checksumBits(entropyBuffer: Buffer) {
  const hash = await RNSimple.SHA.sha256(entropyBuffer)

  // Calculated constants from BIP39
  const ENT = entropyBuffer.length * 8
  const CS = ENT / 32

  return bytesToBinary(hash.slice(0)).slice(0, CS)
}

import { generateSecureRandom } from 'react-native-securerandom'
import { WORDLIST } from './wordlist'

declare type RandomNumberGenerator = (size: number, callback: (err: Error | null, buf: Buffer) => void) => void

export async function mnemonicToSeed(mnemonic: string, password?: string): Promise<Buffer> {
  const mnemonicBuffer = Buffer.from(mnemonic, 'utf8')
  const saltBuffer = Buffer.from(salt(password || '').normalize('NFKD'), 'utf8')
  const res = await RNSimple.PBKDF2.hash(mnemonicBuffer, saltBuffer, 2048, 64, 'SHA512')
  return Buffer.from(res)
}

async function mnemonicToEntropy(mnemonic: string) {
  const words = mnemonic.split(' ')
  if (words.length % 3 !== 0) {
    throw new Error('Invalid mnemonic')
  }

  const belongToList = words.every(function (word) {
    return WORDLIST.indexOf(word) > -1
  })

  if (!belongToList) {
    throw new Error('Invalid mnemonic')
  }

  // convert word indices to 11 bit binary strings
  const bits = words
    .map(function (word) {
      const index = WORDLIST.indexOf(word)
      return lpad(index.toString(2), '0', 11)
    })
    .join('')

  // split the binary string into ENT/CS
  const dividerIndex = Math.floor(bits.length / 33) * 32
  const entropy = bits.slice(0, dividerIndex)
  const checksum = bits.slice(dividerIndex)

  // calculate the checksum and compare
  const entropyBytes = (entropy.match(/(.{1,8})/g) as Array<string>).map(function (bin) {
    return parseInt(bin, 2)
  })
  const entropyBuffer = Buffer.from(entropyBytes)
  const newChecksum = await checksumBits(entropyBuffer)

  if (newChecksum !== checksum) {
    throw new Error('Invalid mnemonic checksum')
  }

  return entropyBuffer.toString('hex')
}

async function entropyToMnemonic(entropy: string, wordlist: string[]) {
  wordlist = wordlist || WORDLIST

  const entropyBuffer = Buffer.from(entropy, 'hex')
  const entropyBits = bytesToBinary(entropyBuffer.slice(0))
  const checksum = await checksumBits(entropyBuffer)

  const bits = entropyBits + checksum
  const chunks = bits.match(/(.{1,11})/g)

  if (!chunks) {
    throw new Error('has no chunks')
  }

  const words = chunks.map(function (binary: string) {
    const index = parseInt(binary, 2)

    return wordlist[index]
  })

  return words.join(' ')
}

export function generateMnemonic(strength?: number, rng?: RandomNumberGenerator, wordlist?: string[]) {
  return new Promise<string>((resolve, reject) => {
    strength = strength || 128
    rng = rng || generateSecureRandom
    generateSecureRandom(strength / 8)
      .then((bytes) => {
        if (!wordlist) {
          throw new Error('No wordlist')
        }
        const hexBuffer = Buffer.from(bytes).toString('hex')
        resolve(entropyToMnemonic(hexBuffer, wordlist))
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export async function validateMnemonic(mnemonic: string) {
  try {
    await mnemonicToEntropy(mnemonic)
  } catch (e) {
    return false
  }
  return true
}

//=========== helper methods from bitcoinjs-lib ========
