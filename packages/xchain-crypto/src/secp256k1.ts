// origin from https://github.com/cosmos-client/cosmos-client-ts/blob/master/src/tendermint/types/secp256k1.ts

const crypto = require('crypto')
const secp256k1 = require('tiny-secp256k1')
import { PubKey, PrivKey } from './key'

export class PubKeySecp256k1 implements PubKey {
  private pubKey: Buffer

  constructor(pubKey: Buffer) {
    this.pubKey = pubKey
  }

  hash160(buffer: Buffer): Buffer {
    const sha256Hash: Buffer = crypto.createHash('sha256').update(buffer).digest()
    try {
      return crypto.createHash('rmd160').update(sha256Hash).digest()
    } catch (err) {
      return crypto.createHash('ripemd160').update(sha256Hash).digest()
    }
  }

  getAddress() {
    return this.hash160(this.pubKey)
  }

  verify(signature: Buffer, message: Buffer) {
    const hash = crypto.createHash('sha256').update(message).digest()

    return secp256k1.verify(hash, signature, this.pubKey)
  }

  toBuffer() {
    return Buffer.from(this.pubKey)
  }

  toBase64() {
    return this.pubKey.toString('base64')
  }

  toJSONInCodec() {
    return this.toBase64()
  }

  static fromBase64(value: string) {
    const buffer = Buffer.from(value, 'base64')
    return new PubKeySecp256k1(buffer)
  }

  static fromJSON(value: string) {
    return PubKeySecp256k1.fromBase64(value)
  }
}

export class PrivKeySecp256k1 implements PrivKey {
  private pubKey: PubKeySecp256k1
  private privKey: Buffer

  constructor(privKey: Buffer) {
    this.pubKey = new PubKeySecp256k1(secp256k1.pointFromScalar(privKey))
    this.privKey = privKey
  }

  getPubKey() {
    return this.pubKey
  }

  sign(message: Buffer) {
    const hash = crypto.createHash('sha256').update(message).digest()
    const signature = secp256k1.sign(hash, this.privKey)

    return signature
  }

  toBuffer() {
    return Buffer.from(this.privKey)
  }

  toBase64() {
    return this.privKey.toString('base64')
  }

  toJSONInCodec() {
    return this.toBase64()
  }

  static fromBase64(value: string) {
    const buffer = Buffer.from(value, 'base64')
    return new PrivKeySecp256k1(buffer)
  }

  static fromJSON(value: string) {
    return PrivKeySecp256k1.fromBase64(value)
  }
}
