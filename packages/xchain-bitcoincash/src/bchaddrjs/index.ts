/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
// @ts-nocheck

/***
 * @license
 * https://github.com/ealmansi/bchaddrjs
 * Copyright (c) 2018-2020 Emilio Almansi
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */

import bs58check from 'bs58check'
import * as cashaddr from 'cashaddrjs'

const Format = {} as any
Format.Legacy = 'legacy'
Format.Bitpay = 'bitpay'
Format.Cashaddr = 'cashaddr'

const Network = {} as any
Network.Mainnet = 'mainnet'
Network.Testnet = 'testnet'

const Type = {} as any
Type.P2PKH = 'p2pkh'
Type.P2SH = 'p2sh'

function isValidAddress(input) {
  try {
    decodeAddress(input)
    return true
  } catch (_error) {
    return false
  }
}

function detectAddressFormat(address) {
  return decodeAddress(address).format
}

function detectAddressNetwork(address) {
  return decodeAddress(address).network
}

function detectAddressType(address) {
  return decodeAddress(address).type
}

function toLegacyAddress(address) {
  const decoded = decodeAddress(address)
  if (decoded.format === Format.Legacy) {
    return address
  }
  return encodeAsLegacy(decoded)
}

function toBitpayAddress(address) {
  const decoded = decodeAddress(address)
  if (decoded.format === Format.Bitpay) {
    return address
  }
  return encodeAsBitpay(decoded)
}

function toCashAddress(address) {
  const decoded = decodeAddress(address)
  return encodeAsCashaddr(decoded)
}

/** Version byte table for base58 formats. */
const VERSION_BYTE = {} as any
VERSION_BYTE[Format.Legacy] = {}
VERSION_BYTE[Format.Legacy][Network.Mainnet] = {}
VERSION_BYTE[Format.Legacy][Network.Mainnet][Type.P2PKH] = 0
VERSION_BYTE[Format.Legacy][Network.Mainnet][Type.P2SH] = 5
VERSION_BYTE[Format.Legacy][Network.Testnet] = {}
VERSION_BYTE[Format.Legacy][Network.Testnet][Type.P2PKH] = 111
VERSION_BYTE[Format.Legacy][Network.Testnet][Type.P2SH] = 196
VERSION_BYTE[Format.Bitpay] = {}
VERSION_BYTE[Format.Bitpay][Network.Mainnet] = {}
VERSION_BYTE[Format.Bitpay][Network.Mainnet][Type.P2PKH] = 28
VERSION_BYTE[Format.Bitpay][Network.Mainnet][Type.P2SH] = 40
VERSION_BYTE[Format.Bitpay][Network.Testnet] = {}
VERSION_BYTE[Format.Bitpay][Network.Testnet][Type.P2PKH] = 111
VERSION_BYTE[Format.Bitpay][Network.Testnet][Type.P2SH] = 196

function decodeAddress(address) {
  try {
    return decodeBase58Address(address)
  } catch (_error) {}
  try {
    return decodeCashAddress(address)
  } catch (_error) {}
  throw new InvalidAddressError()
}

/** 1 version byte plus 20-byte RIPEMD-160 hash. */
const BASE_58_CHECK_PAYLOAD_LENGTH = 21

function decodeBase58Address(address) {
  try {
    const payload = bs58check.decode(address)
    if (payload.length !== BASE_58_CHECK_PAYLOAD_LENGTH) {
      throw new InvalidAddressError()
    }
    const versionByte = payload[0]
    const hash = Array.prototype.slice.call(payload, 1)
    switch (versionByte) {
      case VERSION_BYTE[Format.Legacy][Network.Mainnet][Type.P2PKH]:
        return {
          hash: hash,
          format: Format.Legacy,
          network: Network.Mainnet,
          type: Type.P2PKH,
        }
      case VERSION_BYTE[Format.Legacy][Network.Mainnet][Type.P2SH]:
        return {
          hash: hash,
          format: Format.Legacy,
          network: Network.Mainnet,
          type: Type.P2SH,
        }
      case VERSION_BYTE[Format.Legacy][Network.Testnet][Type.P2PKH]:
        return {
          hash: hash,
          format: Format.Legacy,
          network: Network.Testnet,
          type: Type.P2PKH,
        }
      case VERSION_BYTE[Format.Legacy][Network.Testnet][Type.P2SH]:
        return {
          hash: hash,
          format: Format.Legacy,
          network: Network.Testnet,
          type: Type.P2SH,
        }
      case VERSION_BYTE[Format.Bitpay][Network.Mainnet][Type.P2PKH]:
        return {
          hash: hash,
          format: Format.Bitpay,
          network: Network.Mainnet,
          type: Type.P2PKH,
        }
      case VERSION_BYTE[Format.Bitpay][Network.Mainnet][Type.P2SH]:
        return {
          hash: hash,
          format: Format.Bitpay,
          network: Network.Mainnet,
          type: Type.P2SH,
        }
    }
  } catch (_error) {}
  throw new InvalidAddressError()
}

function decodeCashAddress(address) {
  if (address.indexOf(':') !== -1) {
    try {
      return decodeCashAddressWithPrefix(address)
    } catch (_error) {}
  } else {
    const prefixes = ['bitcoincash', 'bchtest', 'bchreg']
    for (let i = 0; i < prefixes.length; ++i) {
      try {
        const prefix = prefixes[i]
        return decodeCashAddressWithPrefix(prefix + ':' + address)
      } catch (_error) {}
    }
  }
  throw new InvalidAddressError()
}

function decodeCashAddressWithPrefix(address) {
  try {
    const decoded = cashaddr.decode(address)
    const hash = Array.prototype.slice.call(decoded.hash, 0)
    const type = decoded.type === 'P2PKH' ? Type.P2PKH : Type.P2SH
    switch (decoded.prefix) {
      case 'bitcoincash':
        return {
          hash: hash,
          format: Format.Cashaddr,
          network: Network.Mainnet,
          type: type,
        }
      case 'bchtest':
      case 'bchreg':
        return {
          hash: hash,
          format: Format.Cashaddr,
          network: Network.Testnet,
          type: type,
        }
    }
  } catch (_error) {}
  throw new InvalidAddressError()
}

function encodeAsLegacy(decoded) {
  const versionByte = VERSION_BYTE[Format.Legacy][decoded.network][decoded.type]
  const buffer = Buffer.alloc(1 + decoded.hash.length)
  buffer[0] = versionByte
  buffer.set(decoded.hash, 1)
  return bs58check.encode(buffer)
}

function encodeAsBitpay(decoded) {
  const versionByte = VERSION_BYTE[Format.Bitpay][decoded.network][decoded.type]
  const buffer = Buffer.alloc(1 + decoded.hash.length)
  buffer[0] = versionByte
  buffer.set(decoded.hash, 1)
  return bs58check.encode(buffer)
}

function encodeAsCashaddr(decoded) {
  const prefix = decoded.network === Network.Mainnet ? 'bitcoincash' : 'bchtest'
  const type = decoded.type === Type.P2PKH ? 'P2PKH' : 'P2SH'
  const hash = new Uint8Array(decoded.hash)
  return cashaddr.encode(prefix, type, hash)
}

function isLegacyAddress(address) {
  return detectAddressFormat(address) === Format.Legacy
}

function isBitpayAddress(address) {
  return detectAddressFormat(address) === Format.Bitpay
}

function isCashAddress(address) {
  return detectAddressFormat(address) === Format.Cashaddr
}

function isMainnetAddress(address) {
  return detectAddressNetwork(address) === Network.Mainnet
}

function isTestnetAddress(address) {
  return detectAddressNetwork(address) === Network.Testnet
}

function isP2PKHAddress(address) {
  return detectAddressType(address) === Type.P2PKH
}

function isP2SHAddress(address) {
  return detectAddressType(address) === Type.P2SH
}

function InvalidAddressError() {
  const error = new Error()
  this.name = error.name = 'InvalidAddressError'
  this.message = error.message = 'Received an invalid Bitcoin Cash address as input.'
  this.stack = error.stack
}

InvalidAddressError.prototype = Object.create(Error.prototype)

export {
  Format,
  Network,
  Type,
  isValidAddress,
  detectAddressFormat,
  detectAddressNetwork,
  detectAddressType,
  toLegacyAddress,
  toBitpayAddress,
  toCashAddress,
  isLegacyAddress,
  isBitpayAddress,
  isCashAddress,
  isMainnetAddress,
  isTestnetAddress,
  isP2PKHAddress,
  isP2SHAddress,
  InvalidAddressError,
}
