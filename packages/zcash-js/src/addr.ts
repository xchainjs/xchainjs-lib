import { secp256k1 } from '@noble/curves/secp256k1'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha256 } from '@noble/hashes/sha2'
import bs58check from 'bs58check'

export const testnetPrefix = [0x1d, 0x25]
export const mainnetPrefix = [0x1c, 0xb8]

export function isValidAddr(address: string, prefix: Buffer | Uint8Array): boolean {
  try {
    const addrb = bs58check.decode(address)
    if (Buffer.from(addrb.slice(0, 2)).compare(Buffer.from(prefix)) != 0) {
      throw new Error('Invalid prefix')
    }
    return true
  } catch {
    return false
  }
}

export function skToAddr(sk: Uint8Array, prefix: number[] | Uint8Array): string {
  const pk = secp256k1.getPublicKey(sk, true)
  return pkToAddr(pk, prefix)
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
