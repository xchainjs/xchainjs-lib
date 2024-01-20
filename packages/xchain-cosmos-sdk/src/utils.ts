import { HdPath, Slip10RawIndex } from '@cosmjs/crypto'
import { toBech32 } from '@cosmjs/encoding'
import { Uint53 } from '@cosmjs/math'
import { base64, bech32 } from '@scure/base'

/**
 * Transform string path in HdPath compatible with cosmjs
 *
 * @example
 * makeClientPath(`44'/118'/0'/0/0`) // returns [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(118), Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0), Slip10RawIndex.normal(0) ]
 * @param fullDerivationPath
 * @returns {HdPath}
 */
export function makeClientPath(fullDerivationPath: string): HdPath {
  const out = new Array<Slip10RawIndex>()
  let path = `/${fullDerivationPath}`
  while (path) {
    const match = path.match(/^\/([0-9]+)('?)/)
    if (!match) throw new Error('Syntax error while reading path component')
    const [fullMatch, numberString, apostrophe] = match
    const value = Uint53.fromString(numberString).toNumber()
    if (value >= 2 ** 31) throw new Error('Component value too high. Must not exceed 2**31-1.')
    if (apostrophe) out.push(Slip10RawIndex.hardened(value))
    else out.push(Slip10RawIndex.normal(value))
    path = path.slice(fullMatch.length)
  }
  return out
}

/**
 * Transform address from Bech32 to Base64
 *
 * @param {string} address The address to change the format
 * @returns the address in Base64 format
 */
export const bech32ToBase64 = (address: string) =>
  base64.encode(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)))

/**
 * Transform address from Base64 to Bech32
 *
 * @param {string} address The address to change the format
 * @returns the address in Bech32 format
 */
export const base64ToBech32 = (address: string, prefix: string) => toBech32(prefix, base64.decode(address))
