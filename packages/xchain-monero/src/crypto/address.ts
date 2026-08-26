import { keccak_256 } from '@noble/hashes/sha3'

import { cnBase58Encode, cnBase58Decode } from './base58monero'

/** Network address prefixes (byte value) for standard (primary) addresses */
const NETWORK_PREFIXES: Record<number, number> = {
  0: 0x12, // mainnet (18)
  1: 0x35, // testnet (53)
  2: 0x18, // stagenet (24)
}

export type MoneroAddressKind = 'standard' | 'subaddress' | 'integrated'

const PREFIX_META: Record<number, { networkType: number; kind: MoneroAddressKind }> = {
  0x12: { networkType: 0, kind: 'standard' },
  0x13: { networkType: 0, kind: 'integrated' },
  0x2a: { networkType: 0, kind: 'subaddress' },
  0x35: { networkType: 1, kind: 'standard' },
  0x36: { networkType: 1, kind: 'integrated' },
  0x3f: { networkType: 1, kind: 'subaddress' },
  0x18: { networkType: 2, kind: 'standard' },
  0x19: { networkType: 2, kind: 'integrated' },
  0x24: { networkType: 2, kind: 'subaddress' },
}

export interface DecodedMoneroAddress {
  publicSpendKey: Uint8Array
  publicViewKey: Uint8Array
  networkType: number
  kind: MoneroAddressKind
  paymentId?: Uint8Array
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
 * Decodes a Monero address (standard, subaddress, or integrated) and checks the keccak checksum.
 */
export const decodeAddress = (address: string): DecodedMoneroAddress => {
  const data = cnBase58Decode(address)
  if (data.length !== 69 && data.length !== 77) {
    throw new Error(`Invalid address length: ${data.length}`)
  }

  const payload = data.slice(0, data.length - 4)
  const checksum = data.slice(data.length - 4)
  const expected = keccak_256(payload).slice(0, 4)
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expected[i]) throw new Error('Invalid address checksum')
  }

  const meta = PREFIX_META[data[0]]
  if (!meta) throw new Error(`Unknown address prefix: ${data[0]}`)
  if (meta.kind === 'integrated' && data.length !== 77) {
    throw new Error(`Invalid integrated address length: ${data.length}`)
  }
  if (meta.kind !== 'integrated' && data.length !== 69) {
    throw new Error(`Invalid ${meta.kind} address length: ${data.length}`)
  }

  return {
    publicSpendKey: data.slice(1, 33),
    publicViewKey: data.slice(33, 65),
    networkType: meta.networkType,
    kind: meta.kind,
    paymentId: meta.kind === 'integrated' ? data.slice(65, 73) : undefined,
  }
}
