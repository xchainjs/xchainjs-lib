'use strict'

// See: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// See: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
import RNSimple from 'react-native-simple-crypto'

import { ExternallyOwnedAccount } from '@ethersproject/abstract-signer'
import { Base58 } from '@ethersproject/basex'
import { arrayify, BytesLike, concat, hexDataSlice, hexZeroPad, hexlify } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'
import { toUtf8Bytes, UnicodeNormalizationForm } from '@ethersproject/strings'
import { defineReadOnly } from '@ethersproject/properties'
import { ripemd160 } from '@ethersproject/sha2'
import { Wordlist, wordlists } from '@ethersproject/wordlists'

import { Logger } from '@ethersproject/logger'
import { bip32 } from '@thorwallet/xchain-crypto'
import { SigningKey } from '../signingkey'
import { computeAddress as ethersComputeAddress } from 'ethers/lib/utils'
import { computeAddress } from '../signingkey/address'
const version = 'hdnode/5.3.0'

const logger = new Logger(version)

function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export async function sha256(data: BytesLike): Promise<string> {
  const hash = await RNSimple.SHA.sha256(Buffer.from(arrayify(data)))
  return '0x' + buf2hex(hash)
}

function getWordlist(wordlist: string | Wordlist): Wordlist {
  if (wordlist == null) {
    return wordlists['en']
  }

  if (typeof wordlist === 'string') {
    const words = wordlists[wordlist]
    if (words == null) {
      logger.throwArgumentError('unknown locale', 'wordlist', wordlist)
    }
    return words
  }

  return wordlist
}

const N = BigNumber.from('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')

// "Bitcoin seed"
const MasterSecret = toUtf8Bytes('Bitcoin seed')

const HardenedBit = 0x80000000

// Returns a byte with the MSB bits set
function getUpperMask(bits: number): number {
  return ((1 << bits) - 1) << (8 - bits)
}

// Returns a byte with the LSB bits set
function getLowerMask(bits: number): number {
  return (1 << bits) - 1
}

export async function mnemonicToSeed(mnemonic: string, password?: string): Promise<Buffer> {
  if (!password) {
    password = ''
  }

  const salt = toUtf8Bytes('mnemonic' + password, UnicodeNormalizationForm.NFKD)

  const buf = await RNSimple.PBKDF2.hash(toUtf8Bytes(mnemonic, UnicodeNormalizationForm.NFKD), salt, 2048, 64, 'SHA512')
  return Buffer.from(buf)
}

export async function mnemonicToEntropy(mnemonic: string, wordlist?: string | Wordlist): Promise<string> {
  wordlist = getWordlist(wordlist)

  logger.checkNormalize()

  const words = wordlist.split(mnemonic)
  if (words.length % 3 !== 0) {
    throw new Error('invalid mnemonic')
  }

  const entropy = arrayify(new Uint8Array(Math.ceil((11 * words.length) / 8)))

  let offset = 0
  for (let i = 0; i < words.length; i++) {
    const index = wordlist.getWordIndex(words[i].normalize('NFKD'))
    if (index === -1) {
      throw new Error('invalid mnemonic')
    }

    for (let bit = 0; bit < 11; bit++) {
      if (index & (1 << (10 - bit))) {
        entropy[offset >> 3] |= 1 << (7 - (offset % 8))
      }
      offset++
    }
  }

  const entropyBits = (32 * words.length) / 3

  const checksumBits = words.length / 3
  const checksumMask = getUpperMask(checksumBits)

  const checksum = new Uint8Array(await RNSimple.SHA.sha256(entropy.slice(0, entropyBits / 8)))[0] & checksumMask

  if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
    throw new Error('invalid checksum')
  }

  return hexlify(entropy.slice(0, entropyBits / 8))
}

export async function entropyToMnemonic(entropy: BytesLike, wordlist?: string | Wordlist): Promise<string> {
  wordlist = getWordlist(wordlist)

  entropy = arrayify(entropy)

  if (entropy.length % 4 !== 0 || entropy.length < 16 || entropy.length > 32) {
    throw new Error('invalid entropy')
  }

  const indices: Array<number> = [0]

  let remainingBits = 11
  for (let i = 0; i < entropy.length; i++) {
    // Consume the whole byte (with still more to go)
    if (remainingBits > 8) {
      indices[indices.length - 1] <<= 8
      indices[indices.length - 1] |= entropy[i]

      remainingBits -= 8

      // This byte will complete an 11-bit index
    } else {
      indices[indices.length - 1] <<= remainingBits
      indices[indices.length - 1] |= entropy[i] >> (8 - remainingBits)

      // Start the next word
      indices.push(entropy[i] & getLowerMask(8 - remainingBits))

      remainingBits += 3
    }
  }

  // Compute the checksum bits
  const checksumBits = entropy.length / 4
  const checksum = arrayify(await sha256(entropy))[0] & getUpperMask(checksumBits)

  // Shift the checksum into the word indices
  indices[indices.length - 1] <<= checksumBits
  indices[indices.length - 1] |= checksum >> (8 - checksumBits)

  return wordlist.join(indices.map((index) => (<Wordlist>wordlist).getWord(index)))
}

function bytes32(value: BigNumber | Uint8Array): string {
  return hexZeroPad(hexlify(value), 32)
}

async function base58check(data: Uint8Array): Promise<Promise<string>> {
  return Base58.encode(concat([data, hexDataSlice(await sha256(await sha256(data)), 0, 4)]))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _constructorGuard: any = {}

export const defaultPath = "m/44'/60'/0'/0/0"

export interface Mnemonic {
  readonly phrase: string
  readonly path: string
  readonly locale: string
}

const cache: { [key: string]: { priv: string; pub: string } } = {}

const getKeysCached = (privateKey: string) => {
  if (!cache[privateKey]) {
    const signingKey = new SigningKey(privateKey)
    cache[privateKey] = {
      priv: signingKey.privateKey,
      pub: signingKey.compressedPublicKey,
    }
  }
  return cache[privateKey]
}

const isIos = require('react-native').Platform.OS === 'ios'
const getAddressFromPublicKey = (publicKey: string) => {
  if (isIos) {
    return computeAddress(publicKey)
  }
  return ethersComputeAddress(publicKey)
}

export class HDNode implements ExternallyOwnedAccount {
  readonly privateKey: string
  readonly publicKey: string

  readonly fingerprint: () => Promise<string>
  readonly parentFingerprint: string

  readonly address: string

  readonly mnemonic?: Mnemonic
  readonly path: string

  readonly chainCode: string

  readonly index: number
  readonly depth: number

  /**
   *  This constructor should not be called directly.
   *
   *  Please use:
   *   - fromMnemonic
   *   - fromSeed
   */
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructorGuard: any,
    privateKey: string,
    publicKey: string,
    parentFingerprint: string,
    chainCode: string,
    index: number,
    depth: number,
    mnemonicOrPath: Mnemonic | string,
  ) {
    logger.checkNew(new.target, HDNode)

    /* istanbul ignore if */
    if (constructorGuard !== _constructorGuard) {
      throw new Error('HDNode constructor cannot be called directly')
    }

    if (privateKey) {
      const signingKey = getKeysCached(privateKey)
      defineReadOnly(this, 'privateKey', signingKey.priv)
      defineReadOnly(this, 'publicKey', signingKey.pub)
    } else {
      defineReadOnly(this, 'privateKey', null)
      defineReadOnly(this, 'publicKey', hexlify(publicKey))
    }

    defineReadOnly(this, 'parentFingerprint', parentFingerprint)
    defineReadOnly(this, 'fingerprint', async () => hexDataSlice(ripemd160(await sha256(this.publicKey)), 0, 4))

    defineReadOnly(this, 'address', getAddressFromPublicKey(this.publicKey))

    defineReadOnly(this, 'chainCode', chainCode)

    defineReadOnly(this, 'index', index)
    defineReadOnly(this, 'depth', depth)

    if (mnemonicOrPath == null) {
      // From a source that does not preserve the path (e.g. extended keys)
      defineReadOnly(this, 'mnemonic', null)
      defineReadOnly(this, 'path', null)
    } else if (typeof mnemonicOrPath === 'string') {
      // From a source that does not preserve the mnemonic (e.g. neutered)
      defineReadOnly(this, 'mnemonic', null)
      defineReadOnly(this, 'path', mnemonicOrPath)
    } else {
      // From a fully qualified source
      defineReadOnly(this, 'mnemonic', mnemonicOrPath)
      defineReadOnly(this, 'path', mnemonicOrPath.path)
    }
  }

  async extendedKey(): Promise<string> {
    // We only support the mainnet values for now, but if anyone needs
    // testnet values, let me know. I believe current senitment is that
    // we should always use mainnet, and use BIP-44 to derive the network
    //   - Mainnet: public=0x0488B21E, private=0x0488ADE4
    //   - Testnet: public=0x043587CF, private=0x04358394

    if (this.depth >= 256) {
      throw new Error('Depth too large!')
    }

    return base58check(
      concat([
        this.privateKey != null ? '0x0488ADE4' : '0x0488B21E',
        hexlify(this.depth),
        this.parentFingerprint,
        hexZeroPad(hexlify(this.index), 4),
        this.chainCode,
        this.privateKey != null ? concat(['0x00', this.privateKey]) : this.publicKey,
      ]),
    )
  }

  neuter(): HDNode {
    return new HDNode(
      _constructorGuard,
      null,
      this.publicKey,
      this.parentFingerprint,
      this.chainCode,
      this.index,
      this.depth,
      this.path,
    )
  }

  private async _derive(index: number): Promise<HDNode> {
    if (index > 0xffffffff) {
      throw new Error('invalid index - ' + String(index))
    }

    // Base path
    let path = this.path
    if (path) {
      path += '/' + (index & ~HardenedBit)
    }

    const data = new Uint8Array(37)

    if (index & HardenedBit) {
      if (!this.privateKey) {
        throw new Error('cannot derive child of neutered node')
      }

      // Data = 0x00 || ser_256(k_par)
      data.set(arrayify(this.privateKey), 1)

      // Hardened path
      if (path) {
        path += "'"
      }
    } else {
      // Data = ser_p(point(k_par))
      data.set(arrayify(this.publicKey))
    }

    // Data += ser_32(i)
    for (let i = 24; i >= 0; i -= 8) {
      data[33 + (i >> 3)] = (index >> (24 - i)) & 0xff
    }

    const hmac: Uint8Array = new Uint8Array(
      await bip32.hmacSHA512(Buffer.from(arrayify(this.chainCode)), Buffer.from(data)),
    )

    const IL = hmac.slice(0, 32)
    const IR = hmac.slice(32)

    // The private key
    let ki: string = null

    // The public key
    const Ki: string = null

    if (this.privateKey) {
      ki = bytes32(BigNumber.from(IL).add(this.privateKey).mod(N))
    } else {
      throw new Error('[thorwallert] this is not implemented - oops!')
    }

    let mnemonicOrPath: Mnemonic | string = path

    const srcMnemonic = this.mnemonic
    if (srcMnemonic) {
      mnemonicOrPath = Object.freeze({
        phrase: srcMnemonic.phrase,
        path: path,
        locale: srcMnemonic.locale || 'en',
      })
    }

    return new HDNode(
      _constructorGuard,
      ki,
      Ki,
      await this.fingerprint(),
      bytes32(IR),
      index,
      this.depth + 1,
      mnemonicOrPath,
    )
  }

  async derivePath(path: string): Promise<Promise<HDNode>> {
    const components = path.split('/')

    if (components.length === 0 || (components[0] === 'm' && this.depth !== 0)) {
      throw new Error('invalid path - ' + path)
    }

    if (components[0] === 'm') {
      components.shift()
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let result: HDNode = this
    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      if (component.match(/^[0-9]+'$/)) {
        const index = parseInt(component.substring(0, component.length - 1))
        if (index >= HardenedBit) {
          throw new Error('invalid path index - ' + component)
        }
        result = await result._derive(HardenedBit + index)
      } else if (component.match(/^[0-9]+$/)) {
        const index = parseInt(component)
        if (index >= HardenedBit) {
          throw new Error('invalid path index - ' + component)
        }
        result = await result._derive(index)
      } else {
        throw new Error('invalid path component - ' + component)
      }
    }

    return result
  }

  static async _fromSeed(seed: BytesLike, mnemonic: Mnemonic): Promise<HDNode> {
    const seedArray: Uint8Array = arrayify(seed)
    if (seedArray.length < 16 || seedArray.length > 64) {
      throw new Error('invalid seed')
    }

    const hmac: Uint8Array = new Uint8Array(await bip32.hmacSHA512(Buffer.from(MasterSecret), Buffer.from(seedArray)))

    return new HDNode(
      _constructorGuard,
      bytes32(hmac.slice(0, 32)),
      null,
      '0x00000000',
      bytes32(hmac.slice(32)),
      0,
      0,
      mnemonic,
    )
  }

  static async fromMnemonic(mnemonic: string, password?: string, wordlist?: string | Wordlist): Promise<HDNode> {
    // If a locale name was passed in, find the associated wordlist
    wordlist = getWordlist(wordlist)

    // Normalize the case and spacing in the mnemonic (throws if the mnemonic is invalid)
    mnemonic = await entropyToMnemonic(await mnemonicToEntropy(mnemonic, wordlist), wordlist)

    return HDNode._fromSeed(await mnemonicToSeed(mnemonic, password), {
      phrase: mnemonic,
      path: 'm',
      locale: wordlist.locale,
    })
  }

  static fromSeed(seed: BytesLike): Promise<HDNode> {
    return HDNode._fromSeed(seed, null)
  }

  static async fromExtendedKey(extendedKey: string): Promise<HDNode> {
    const bytes = Base58.decode(extendedKey)

    if (bytes.length !== 82 || (await base58check(bytes.slice(0, 78))) !== extendedKey) {
      logger.throwArgumentError('invalid extended key', 'extendedKey', '[REDACTED]')
    }

    const depth = bytes[4]
    const parentFingerprint = hexlify(bytes.slice(5, 9))
    const index = parseInt(hexlify(bytes.slice(9, 13)).substring(2), 16)
    const chainCode = hexlify(bytes.slice(13, 45))
    const key = bytes.slice(45, 78)

    switch (hexlify(bytes.slice(0, 4))) {
      // Public Key
      case '0x0488b21e':
      case '0x043587cf':
        return new HDNode(_constructorGuard, null, hexlify(key), parentFingerprint, chainCode, index, depth, null)

      // Private Key
      case '0x0488ade4':
      case '0x04358394 ':
        if (key[0] !== 0) {
          break
        }
        return new HDNode(
          _constructorGuard,
          hexlify(key.slice(1)),
          null,
          parentFingerprint,
          chainCode,
          index,
          depth,
          null,
        )
    }

    return logger.throwArgumentError('invalid extended key', 'extendedKey', '[REDACTED]')
  }
}

export async function isValidMnemonic(mnemonic: string, wordlist?: Wordlist): Promise<boolean> {
  try {
    await mnemonicToEntropy(mnemonic, wordlist)
    return true
  } catch (error) {}
  return false
}

export function getAccountPath(index: number): string {
  if (typeof index !== 'number' || index < 0 || index >= HardenedBit || index % 1) {
    logger.throwArgumentError('invalid account index', 'index', index)
  }
  return `m/44'/60'/${index}'/0/0`
}
