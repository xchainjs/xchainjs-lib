import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

import { SUIClientParams } from './types'

export const SUIChain = 'SUI' as const

export const SUI_DECIMALS = 9

export const SUIAsset: Asset = {
  chain: SUIChain,
  ticker: 'SUI',
  symbol: 'SUI',
  type: AssetType.NATIVE,
}

export const SUI_TYPE_TAG = '0x2::sui::SUI'

/** Gas budget estimate for a simple transfer (in MIST). */
export const DEFAULT_GAS_BUDGET = 10_000_000

const mainnetExplorer = new ExplorerProvider(
  'https://suiscan.xyz/mainnet',
  'https://suiscan.xyz/mainnet/account/%%ADDRESS%%',
  'https://suiscan.xyz/mainnet/tx/%%TX_ID%%',
)

/**
 * Default client params.
 *
 * Endpoint URLs are resolved in the Client constructor from caller overrides
 * (`grpcUrls` / `clientUrls` / `graphqlUrls`) with Foundation public defaults
 * as fallback. They are intentionally omitted here so spreading
 * `defaultSuiParams` does not shadow consumer `clientUrls` with baked-in
 * `grpcUrls` (shallow merge would otherwise ignore custom endpoints).
 */
export const defaultSuiParams: SUIClientParams = {
  network: Network.Mainnet,
  transport: 'grpc',
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/784'/",
    [Network.Testnet]: "m/44'/784'/",
    [Network.Stagenet]: "m/44'/784'/",
  },
  explorerProviders: {
    [Network.Mainnet]: mainnetExplorer,
    [Network.Testnet]: new ExplorerProvider(
      'https://suiscan.xyz/testnet',
      'https://suiscan.xyz/testnet/account/%%ADDRESS%%',
      'https://suiscan.xyz/testnet/tx/%%TX_ID%%',
    ),
    [Network.Stagenet]: mainnetExplorer,
  },
}
