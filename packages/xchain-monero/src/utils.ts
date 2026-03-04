import { Network } from '@xchainjs/xchain-client'

/**
 * Monero network type values matching monero-ts MoneroNetworkType enum
 */
export const MoneroNetworkType = {
  MAINNET: 0,
  TESTNET: 1,
  STAGENET: 2,
} as const

/**
 * Maps XChainJS Network to Monero network type
 */
export const getMoneroNetworkType = (network: Network): number => {
  const networkMap: Record<Network, number> = {
    [Network.Mainnet]: MoneroNetworkType.MAINNET,
    [Network.Stagenet]: MoneroNetworkType.STAGENET,
    [Network.Testnet]: MoneroNetworkType.STAGENET,
  }
  return networkMap[network]
}

/**
 * Validates a Monero address format.
 * Standard addresses are 95 chars, integrated addresses are 106 chars.
 * Uses base58 character set and prefix validation.
 */
export const validateMoneroAddress = (address: string): boolean => {
  const base58Chars = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
  if (!base58Chars.test(address)) return false

  // Standard address (95 chars): primary starts with 4/5/9, subaddress starts with 8/7/B
  if (address.length === 95) return /^[45789B]/.test(address)
  // Integrated address (106 chars): starts with 4/5/A
  if (address.length === 106) return /^[45A]/.test(address)

  return false
}

/**
 * Ed25519 group order (l) for sc_reduce32
 */
const ED25519_ORDER = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')

/**
 * Reduces a 32-byte value modulo the ed25519 group order.
 * Required to produce valid Monero private keys from arbitrary 32-byte seeds.
 */
export const scReduce32 = (bytes: Uint8Array): Uint8Array => {
  // Interpret as little-endian integer
  let value = BigInt(0)
  for (let i = 31; i >= 0; i--) {
    value = (value << BigInt(8)) | BigInt(bytes[i])
  }

  // Reduce mod l
  value = value % ED25519_ORDER

  // Convert back to little-endian bytes
  const result = new Uint8Array(32)
  let tmp = value
  for (let i = 0; i < 32; i++) {
    result[i] = Number(tmp & BigInt(0xff))
    tmp >>= BigInt(8)
  }

  return result
}

/**
 * Converts a Uint8Array to hex string
 */
export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
