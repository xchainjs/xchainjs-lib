import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

import { NearClientParams } from './types'

export const NEARChain = 'NEAR' as const

/** Native NEAR decimals (1 NEAR = 10^24 yoctoNEAR). */
export const NEAR_DECIMALS = 24

export const NEARAsset: Asset = {
  chain: NEARChain,
  ticker: 'NEAR',
  symbol: 'NEAR',
  type: AssetType.NATIVE,
}

/** Typical gas attached to a simple native Transfer action (~0.45 TGas). */
export const TRANSFER_GAS = BigInt('450000000000')

/** Gas attached to NEP-141 `ft_transfer` / NEP-145 `storage_deposit` (~30 TGas). */
export const FT_TRANSFER_GAS = BigInt('30000000000000')

/** 1 yoctoNEAR deposit required by NEP-141 `ft_transfer`. */
export const FT_TRANSFER_DEPOSIT = BigInt(1)

const mainnetExplorer = new ExplorerProvider(
  'https://nearblocks.io',
  'https://nearblocks.io/address/%%ADDRESS%%',
  'https://nearblocks.io/txns/%%TX_ID%%',
)

/**
 * Default client params.
 *
 * RPC / NearBlocks URLs are resolved in the Client from caller overrides with
 * public defaults as fallback. They are intentionally omitted here so spreading
 * `defaultNearParams` does not shadow consumer `clientUrls`.
 */
export const defaultNearParams: NearClientParams = {
  network: Network.Mainnet,
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/397'/",
    [Network.Testnet]: "m/44'/397'/",
    [Network.Stagenet]: "m/44'/397'/",
  },
  explorerProviders: {
    [Network.Mainnet]: mainnetExplorer,
    [Network.Testnet]: new ExplorerProvider(
      'https://testnet.nearblocks.io',
      'https://testnet.nearblocks.io/address/%%ADDRESS%%',
      'https://testnet.nearblocks.io/txns/%%TX_ID%%',
    ),
    [Network.Stagenet]: mainnetExplorer,
  },
}
