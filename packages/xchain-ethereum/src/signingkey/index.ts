'use strict'

import { EC } from './elliptic'

import { BytesLike, hexlify, arrayify } from '@ethersproject/bytes'
import { defineReadOnly } from '@ethersproject/properties'

let _curve: EC = null
function getCurve() {
  if (!_curve) {
    _curve = new EC('secp256k1')
  }
  return _curve
}

const fromPrivateCache: { [key: string]: string } = {}

const getPublicFromPrivate = (bytes: Uint8Array | string, compressed: boolean) => {
  const key = bytes.toString() + String(compressed)
  if (!fromPrivateCache[key]) {
    fromPrivateCache[key] = getCurve().keyFromPrivate(arrayify(bytes)).getPublic(compressed, 'hex')
  }
  return fromPrivateCache[key]
}

export class SigningKey {
  readonly curve: string

  readonly privateKey: string
  readonly compressedPublicKey: string

  readonly _isSigningKey: boolean

  constructor(privateKey: BytesLike) {
    defineReadOnly(this, 'curve', 'secp256k1')

    defineReadOnly(this, 'privateKey', hexlify(privateKey))

    defineReadOnly(this, 'compressedPublicKey', '0x' + getPublicFromPrivate(this.privateKey, true))

    defineReadOnly(this, '_isSigningKey', true)
  }
}
