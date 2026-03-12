import { keccak_256 } from '@noble/hashes/sha3'

import { cnBase58Encode, cnBase58Decode } from './base58monero'

/** Network address prefixes (byte value) */
const NETWORK_PREFIXES: Record<number, number> = {
  0: 0x12, // mainnet (18)
  1: 0x35, // testnet (53)
  2: 0x18, // stagenet (24)
}

/**
 * Encodes a standard Monero address from public spend/view keys.
 * Format: [1-byte prefix][32-byte pubSpend][32-byte pubView][4-byte checksum]
 * Result is 69 bytes → 95 base58 characters.
 */
export const encodeAddress = (publicSpendKey: Uint8Array, publicViewKey: Uint8Array, networkType: number): string => {
  const prefix = NETWORK_PREFIXES[networkType]
  if (prefix === undefined) throw new Error(`Unknown network type: ${networkType}`)

  // Build the 65-byte payload: prefix + pubSpend + pubView
  const payload = new Uint8Array(1 + 32 + 32)
  payload[0] = prefix
  payload.set(publicSpendKey, 1)
  payload.set(publicViewKey, 33)

  // Checksum: first 4 bytes of keccak256(payload)
  const checksum = keccak_256(payload).slice(0, 4)

  // Full data: payload + checksum = 69 bytes
  const full = new Uint8Array(69)
  full.set(payload, 0)
  full.set(checksum, 65)

  return cnBase58Encode(full)
}

/**
 * Decodes a standard Monero address into its public spend/view keys.
 * Validates the checksum.
 */
export const decodeAddress = (
  address: string,
): { publicSpendKey: Uint8Array; publicViewKey: Uint8Array; networkType: number } => {
  const data = cnBase58Decode(address)
  if (data.length !== 69) throw new Error(`Invalid address length: ${data.length}`)

  const payload = data.slice(0, 65)
  const checksum = data.slice(65, 69)

  // Verify checksum
  const expected = keccak_256(payload).slice(0, 4)
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expected[i]) throw new Error('Invalid address checksum')
  }

  const prefix = data[0]
  let networkType: number
  if (prefix === 0x12) networkType = 0 // mainnet
  else if (prefix === 0x35) networkType = 1 // testnet
  else if (prefix === 0x18) networkType = 2 // stagenet
  else throw new Error(`Unknown address prefix: ${prefix}`)

  return {
    publicSpendKey: data.slice(1, 33),
    publicViewKey: data.slice(33, 65),
    networkType,
  }
}
