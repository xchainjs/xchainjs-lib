import { HdPath, stringToPath } from '@cosmjs/crypto'
import { toBech32 } from '@cosmjs/encoding'
import { base64, bech32 } from '@scure/base'

/**
 * Transform string path in HdPath compatible with cosmjs
 *
 * @example
 * makeClientPath(`44'/118'/0'/0/0`) // returns [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(118), Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0), Slip10RawIndex.normal(0) ]
 *  * @example
 * makeClientPath(`m/44'/118'/0'/0/0`) // returns [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(118), Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0), Slip10RawIndex.normal(0) ]
 * @param fullDerivationPath
 * @returns {HdPath}
 */
export function makeClientPath(fullDerivationPath: string): HdPath {
  const path = fullDerivationPath.startsWith('m/') ? fullDerivationPath : `m/${fullDerivationPath}` // To be compatible with previous versions
  return stringToPath(path)
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
