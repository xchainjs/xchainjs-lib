import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

export const XRP_DECIMAL = 6

export const XRPL_DERIVATION_PATH = "m/44'/144'/0'/0/"

/**
 * Chain identifier for Ripple mainnet
 */
export const XRPChain = 'XRP' as const

/**
 * Base "chain" asset on Ripple main net.
 */
export const AssetXRP: Asset = { chain: XRPChain, symbol: 'XRP', ticker: 'XRP', type: AssetType.NATIVE }

// Explorer providers for Ripple
const XRP_MAINNET_EXPLORER = new ExplorerProvider(
  'https://livenet.xrpl.org/',
  'https://livenet.xrpl.org/accounts/%%ADDRESS%%',
  'https://livenet.xrpl.org/transactions/%%TX_ID%%',
)
const XRP_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.xrpl.org/',
  'https://testnet.xrpl.org/accounts/%%ADDRESS%%',
  'https://testnet.xrpl.org/transactions/%%TX_ID%%',
)

export const rippleExplorerProviders = {
  [Network.Testnet]: XRP_TESTNET_EXPLORER,
  [Network.Stagenet]: XRP_MAINNET_EXPLORER,
  [Network.Mainnet]: XRP_MAINNET_EXPLORER,
}

export type IdentifierString = `${string}:${string}`

export const XRPL_MAINNET = 'xrpl:0' as const
export const XRPL_TESTNET = 'xrpl:1' as const
export const XRPL_DEVNET = 'xrpl:2' as const

export const XRPL_NETWORKS = [XRPL_MAINNET, XRPL_TESTNET, XRPL_DEVNET] as const

export const XRPL_PROTOCOL_NETWORKS = [...XRPL_NETWORKS] as const

export type XRPLProtorcolNetwork = (typeof XRPL_PROTOCOL_NETWORKS)[number]

export function isXRPLNetworks(network: IdentifierString): network is XRPLProtorcolNetwork {
  return XRPL_PROTOCOL_NETWORKS.includes(network as XRPLProtorcolNetwork)
}

export type XRPLStandardIdentifier = `xrpl:${number}`
export type XRPLReserverdIdentifier = 'xrpl:mainnet' | 'xrpl:testnet' | 'xrpl:devnet'

export type XRPLIdentifierString = XRPLStandardIdentifier | XRPLReserverdIdentifier

export const getXRPLIdentifierByNetwork = (network: Network) => {
  if (network === Network.Mainnet) return 'xrpl:mainnet'
  if (network === Network.Stagenet) return 'xrpl:devnet'
  // testnet
  return 'xrpl:testnet'
}

export function convertNetworkToChainId(network: XRPLIdentifierString): `xrpl:${number}` {
  switch (network) {
    case 'xrpl:mainnet':
      return XRPL_MAINNET
    case 'xrpl:testnet':
      return XRPL_TESTNET
    case 'xrpl:devnet':
      return XRPL_DEVNET
  }
  return network
}

export function getNetworkWssEndpoint(network: XRPLIdentifierString): string | undefined {
  const chainId = convertNetworkToChainId(network)
  switch (chainId) {
    case XRPL_MAINNET:
      return 'wss://xrplcluster.com'
    case XRPL_TESTNET:
      return 'wss://s.altnet.rippletest.net:51233/'
    case XRPL_DEVNET:
      return 'wss://s.devnet.rippletest.net:51233/'
    default:
      return undefined
  }
}
