import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

import { ADAClientParams } from './types'

/**
 * Cardano chain symbol
 */
export const ADAChain = 'ADA' as const

/**
 * Cardano native asset decimals
 */
export const ADA_DECIMALS = 6

/**
 * Cardano native asset
 */
export const ADAAsset: Asset = {
  chain: 'ADA',
  ticker: 'ADA',
  symbol: 'ADA',
  type: AssetType.NATIVE,
}

const mainnetExplorer = new ExplorerProvider(
  'https://adastat.net/',
  'https://adastat.net/addresses/%%ADDRESS%%',
  'https://adastat.net/transactions/%%TX_ID%%',
)

export const defaultAdaParams: ADAClientParams = {
  network: Network.Mainnet,
  rootDerivationPaths: {
    [Network.Mainnet]: "m/1852'/1815'/",
    [Network.Testnet]: "m/1852'/1815'/",
    [Network.Stagenet]: "m/1852'/1815'/",
  },
  explorerProviders: {
    [Network.Mainnet]: mainnetExplorer,
    [Network.Testnet]: new ExplorerProvider(
      'https://preprod.cardanoscan.io/',
      'https://preprod.cardanoscan.io/address/%%ADDRESS%%',
      'https://preprod.cardanoscan.io/transaction/%%TX_ID%%',
    ),
    [Network.Stagenet]: mainnetExplorer,
  },
}
