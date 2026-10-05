import { secp256k1 } from '@noble/curves/secp256k1'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha256 } from '@noble/hashes/sha2'
import { bech32m } from '@scure/base'
import bs58check from 'bs58check'

export const testnetPrefix = [0x1d, 0x25]
export const mainnetPrefix = [0x1c, 0xb8]

const PKH_LENGTH = 20
const MAINNET_TEX_HRP = 'tex'
const TESTNET_TEX_HRP = 'textest'

type Prefix = number[] | Buffer | Uint8Array

/**
 * ZIP 320 HRP for a transparent P2PKH version prefix.
 * Mainnet `0x1cb8` is `tex`; testnet `0x1d25` is `textest`.
 */
function texHrpForPrefix(prefix: Buffer): string | undefined {
  if (prefix.length === mainnetPrefix.length && prefix[0] === mainnetPrefix[0] && prefix[1] === mainnetPrefix[1]) {
    return MAINNET_TEX_HRP
  }
  if (prefix.length === testnetPrefix.length && prefix[0] === testnetPrefix[0] && prefix[1] === testnetPrefix[1]) {
    return TESTNET_TEX_HRP
  }
  return undefined
}

/** HRP claimed by a ZIP 320 string, or undefined when it is not a TEX address. */
function texHrpOf(address: string): string | undefined {
  const lower = address.toLowerCase()
  if (lower.startsWith(`${TESTNET_TEX_HRP}1`)) return TESTNET_TEX_HRP
  if (lower.startsWith(`${MAINNET_TEX_HRP}1`)) return MAINNET_TEX_HRP
  return undefined
}

function decodeBase58Pkh(address: string, prefix: Buffer): Uint8Array | undefined {
  try {
    const decoded = Buffer.from(bs58check.decode(address))
    if (decoded.length !== prefix.length + PKH_LENGTH) return undefined
    if (decoded.subarray(0, prefix.length).compare(prefix) !== 0) return undefined
    return decoded.subarray(prefix.length)
  } catch {
    return undefined
  }
}

/** Bech32m-decode a ZIP 320 address. The payload is the 20-byte validating key hash. */
function decodeTexPkh(address: string, hrp: string): Uint8Array | undefined {
  try {
    const decoded = bech32m.decode(address)
    if (decoded.prefix !== hrp) return undefined
    const payload = bech32m.fromWords(decoded.words)
    if (payload.length !== PKH_LENGTH) return undefined
    return payload
  } catch {
    return undefined
  }
}

/**
 * 20-byte validating key hash of a transparent P2PKH address.
 * Accepts Base58Check (`t1` / `tm`) and ZIP 320 Bech32m (`tex1` / `textest1`) for `prefix`.
 */
export function transparentPkh(address: string, prefix: Prefix): Uint8Array | undefined {
  const prefixBuf = Buffer.from(prefix)
  const claimedHrp = texHrpOf(address)
  if (claimedHrp) {
    if (claimedHrp !== texHrpForPrefix(prefixBuf)) return undefined
    return decodeTexPkh(address, claimedHrp)
  }
  return decodeBase58Pkh(address, prefixBuf)
}

export function isValidAddr(address: string, prefix: Prefix): boolean {
  return transparentPkh(address, prefix) !== undefined
}

export function pkToAddr(pk: Uint8Array, prefix: number[] | Uint8Array): string {
  const hash = sha256(pk)
  const pkh = ripemd160(hash)
  const addrb = Buffer.alloc(22)
  Buffer.from(prefix).copy(addrb)
  Buffer.from(pkh).copy(addrb, 2)
  const addr = bs58check.encode(addrb)
  return addr
}

export function skToAddr(sk: Uint8Array, prefix: number[] | Uint8Array): string {
  const pk = secp256k1.getPublicKey(sk, true)
  return pkToAddr(pk, prefix)
}
