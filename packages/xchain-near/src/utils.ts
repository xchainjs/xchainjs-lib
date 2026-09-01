import { Network } from '@xchainjs/xchain-client'

import { NearClientParams } from './types'

const IMPLICIT_ACCOUNT_REGEX = /^[0-9a-f]{64}$/

/**
 * NEAR account ID rules (named + implicit):
 * - 2–64 chars
 * - lowercase alphanumeric with `.` `_` `-` separators
 * - no leading/trailing/consecutive separators
 * Implicit accounts are exactly 64 lowercase hex chars.
 */
const NAMED_ACCOUNT_REGEX = /^(?=.{2,64}$)(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/

export const isImplicitAccount = (address: string): boolean => IMPLICIT_ACCOUNT_REGEX.test(address)

export const validateNearAddress = (address: string): boolean => {
  if (!address) return false
  if (isImplicitAccount(address)) return true
  return NAMED_ACCOUNT_REGEX.test(address)
}

/**
 * Convert an ed25519 public key to a NEAR implicit account id (64-char hex).
 * Accepts raw 32-byte keys or SLIP-0010 keys with a leading 0x00 version byte.
 */
export const publicKeyToImplicitAccount = (publicKey: Uint8Array): string => {
  const raw = publicKey.length === 33 && publicKey[0] === 0 ? publicKey.subarray(1) : publicKey
  if (raw.length !== 32) {
    throw new Error(`Invalid ed25519 public key length: ${publicKey.length}`)
  }
  return Buffer.from(raw).toString('hex')
}

export const getNearNetworkId = (network: Network): 'mainnet' | 'testnet' => {
  const networkMap: { [key in Network]: 'mainnet' | 'testnet' } = {
    [Network.Mainnet]: 'mainnet',
    [Network.Stagenet]: 'mainnet',
    [Network.Testnet]: 'testnet',
  }
  return networkMap[network]
}

/** Default public JSON-RPC endpoints (failover order). */
export const getDefaultClientUrls = (network: Network): string[] => {
  const networkMap: { [key in Network]: string[] } = {
    [Network.Mainnet]: ['https://free.rpc.fastnear.com', 'https://near.drpc.org', 'https://1rpc.io/near'],
    [Network.Stagenet]: ['https://free.rpc.fastnear.com', 'https://near.drpc.org', 'https://1rpc.io/near'],
    [Network.Testnet]: ['https://test.rpc.fastnear.com', 'https://near-testnet.drpc.org'],
  }
  return networkMap[network]
}

export const getDefaultNearblocksUrl = (network: Network): string => {
  const networkMap: { [key in Network]: string } = {
    [Network.Mainnet]: 'https://api.nearblocks.io',
    [Network.Stagenet]: 'https://api.nearblocks.io',
    [Network.Testnet]: 'https://api-testnet.nearblocks.io',
  }
  return networkMap[network]
}

/**
 * Resolve RPC URL list for a network.
 * Precedence: caller `clientUrls` → public defaults.
 * Pass **caller** params only (not a shallow-merge with defaults).
 */
export const resolveClientUrls = (network: Network, params: Pick<NearClientParams, 'clientUrls'> = {}): string[] => {
  const urls = params.clientUrls?.[network]
  if (urls && urls.length > 0) return urls
  return getDefaultClientUrls(network)
}

export const resolveNearblocksUrl = (
  network: Network,
  params: Pick<NearClientParams, 'nearblocksUrls'> = {},
): string => {
  return params.nearblocksUrls?.[network] ?? getDefaultNearblocksUrl(network)
}
