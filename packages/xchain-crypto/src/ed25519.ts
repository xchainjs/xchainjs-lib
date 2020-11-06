// origin from https://github.com/cosmos-client/cosmos-client-ts/blob/master/src/tendermint/types/ed25519.ts

import crypto from 'crypto'
import nacl from 'tweetnacl'

import { PubKey, PrivKey } from './key'

export class PubKeyEd25519 implements PubKey {
  private pubKey: Buffer

  constructor(pubKey: Buffer) {
    this.pubKey = pubKey
  }

  getAddress() {
    const hash = crypto.createHash('sha256').update(this.pubKey).digest()
    return hash.subarray(0, 20)
  }

  verify(signature: Buffer) {
    return nacl.sign.open(new Uint8Array(signature), new Uint8Array(this.pubKey)) !== null
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
    return new PubKeyEd25519(buffer)
  }

  static fromJSON(value: string) {
    return PubKeyEd25519.fromBase64(value)
  }
}

export class PrivKeyEd25519 implements PrivKey {
  private pubKey: PubKeyEd25519
  private privKey: Buffer

  constructor(privKey: Buffer) {
    const keypair = nacl.sign.keyPair.fromSeed(new Uint8Array(privKey))
    this.pubKey = new PubKeyEd25519(Buffer.from(keypair.publicKey))
    this.privKey = privKey
  }

  getPubKey() {
    return this.pubKey
  }

  sign(message: Buffer) {
    const keypair = nacl.sign.keyPair.fromSeed(new Uint8Array(this.privKey))
    return Buffer.from(nacl.sign(new Uint8Array(message), new Uint8Array(keypair.secretKey)))
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
    return new PrivKeyEd25519(buffer)
  }

  static fromJSON(value: string) {
    return PrivKeyEd25519.fromBase64(value)
  }
}
