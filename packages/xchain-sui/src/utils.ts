import { Network } from '@xchainjs/xchain-client'

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
 * @deprecated Use {@link getDefaultGrpcUrl}. Kept for callers that still import
 * the old name; returns the gRPC fullnode URL (not JSON-RPC).
 */
export const getDefaultClientUrl = getDefaultGrpcUrl
