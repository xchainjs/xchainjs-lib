import { HdPath, stringToPath } from '@cosmjs/crypto'
import { toBech32 } from '@cosmjs/encoding'
import { base64, bech32 } from '@scure/base'

/**
 * Converts a string path into an HdPath compatible with cosmjs.
 * @param {string} fullDerivationPath The full derivation path to convert.
 * @returns {HdPath} The HdPath representation of the provided string path.
 * makeClientPath(`44'/118'/0'/0/0`) // returns [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(118), Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0), Slip10RawIndex.normal(0) ]
 *  * @example
 * makeClientPath(`m/44'/118'/0'/0/0`) // returns [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(118), Slip10RawIndex.hardened(0), Slip10RawIndex.normal(0), Slip10RawIndex.normal(0) ]
 */
export function makeClientPath(fullDerivationPath: string): HdPath {
  // Ensure the path starts with 'm/' for compatibility
  const path = fullDerivationPath.startsWith('m/') ? fullDerivationPath : `m/${fullDerivationPath}`
  return stringToPath(path)
}

/**
 * Transforms an address from Bech32 to Base64 format.
 * @param {string} address The address to convert.
 * @returns {string} The address in Base64 format.
 */
export const bech32ToBase64 = (address: string): string =>
  base64.encode(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)))

/**
 * Transforms an address from Base64 to Bech32 format.
 * @param {string} address The address to convert.
 * @param {string} prefix The Bech32 prefix to use.
 * @returns {string} The address in Bech32 format.
 */
export const base64ToBech32 = (address: string, prefix: string): string => toBech32(prefix, base64.decode(address))
