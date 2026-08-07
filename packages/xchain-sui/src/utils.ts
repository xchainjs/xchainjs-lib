import { Network } from '@xchainjs/xchain-client'

import { SUIClientParams } from './types'

export const getSuiNetwork = (network: Network): 'mainnet' | 'testnet' => {
  const networkMap: { [key in Network]: 'mainnet' | 'testnet' } = {
    [Network.Mainnet]: 'mainnet',
    [Network.Stagenet]: 'mainnet',
    [Network.Testnet]: 'testnet',
  }
  return networkMap[network]
}

/**
 * Default gRPC fullnode base URLs (Sui Foundation public nodes).
 * JSON-RPC on these hosts is deprecated; use gRPC instead.
 */
export const getDefaultGrpcUrl = (network: Network): string => {
  const networkMap: { [key in Network]: string } = {
    [Network.Mainnet]: 'https://fullnode.mainnet.sui.io:443',
    [Network.Stagenet]: 'https://fullnode.mainnet.sui.io:443',
    [Network.Testnet]: 'https://fullnode.testnet.sui.io:443',
  }
  return networkMap[network]
}

/**
 * Default GraphQL RPC URLs (Sui Foundation public GraphQL).
 * Used for historical transaction queries (fullnode gRPC retention is limited).
 */
export const getDefaultGraphqlUrl = (network: Network): string => {
  const networkMap: { [key in Network]: string } = {
    [Network.Mainnet]: 'https://graphql.mainnet.sui.io/graphql',
    [Network.Stagenet]: 'https://graphql.mainnet.sui.io/graphql',
    [Network.Testnet]: 'https://graphql.testnet.sui.io/graphql',
  }
  return networkMap[network]
}

/**
 * Resolve primary (gRPC / JSON-RPC) URL for a network.
 *
 * Precedence: `grpcUrls` → `clientUrls` → Foundation default.
 * Pass **caller** params only (not a shallow-merge with defaults) so consumer
 * `clientUrls` are not shadowed by baked-in default `grpcUrls`.
 */
export const resolvePrimaryUrl = (
  network: Network,
  params: Pick<SUIClientParams, 'grpcUrls' | 'clientUrls'> = {},
): string => {
  return params.grpcUrls?.[network] ?? params.clientUrls?.[network] ?? getDefaultGrpcUrl(network)
}

/**
 * Resolve GraphQL URL for a network.
 * Precedence: `graphqlUrls` → Foundation default.
 */
export const resolveGraphqlUrl = (network: Network, params: Pick<SUIClientParams, 'graphqlUrls'> = {}): string => {
  return params.graphqlUrls?.[network] ?? getDefaultGraphqlUrl(network)
}

/**
 * @deprecated Use {@link getDefaultGrpcUrl}. Kept for callers that still import
 * the old name; returns the gRPC fullnode URL (not JSON-RPC).
 */
export const getDefaultClientUrl = getDefaultGrpcUrl

/**
 * JSON.stringify that never throws on BigInt (common in Sui gRPC/protobuf).
 * BigInts are converted to decimal strings.
 */
export const safeJsonStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v))
  } catch {
    // Circular refs or other exotic values — fall back without throwing.
    return String(value)
  }
}

/**
 * gRPC `ExecutionStatus` may be a protobuf object (`{ success, error }`) or an
 * enum number depending on decoder path. Only treat object `{ success: false }`
 * as failure (same rule as before).
 */
export const isGrpcExecutionFailure = (status: unknown): boolean => {
  return Boolean(
    status && typeof status === 'object' && 'success' in status && (status as { success?: boolean }).success === false,
  )
}

/**
 * Build a human-readable message for a failed gRPC execution status.
 * Prefers `error.description` when present; otherwise safe-stringifies the
 * whole status (handles BigInt fields such as `error.command`).
 */
export const formatGrpcExecutionFailure = (status: unknown): string => {
  if (status && typeof status === 'object') {
    const error = (status as { error?: { description?: string; command?: bigint | number | string } }).error
    if (error?.description) {
      const command =
        error.command !== undefined && error.command !== null ? ` (command ${error.command.toString()})` : ''
      return `Transaction failed: ${error.description}${command}`
    }
  }
  return `Transaction failed: ${safeJsonStringify(status)}`
}
