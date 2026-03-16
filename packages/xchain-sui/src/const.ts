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

const mainnetExplorer = new ExplorerProvider(
  'https://suiscan.xyz/mainnet',
  'https://suiscan.xyz/mainnet/account/%%ADDRESS%%',
  'https://suiscan.xyz/mainnet/tx/%%TX_ID%%',
)

export const defaultSuiParams: SUIClientParams = {
  network: Network.Mainnet,
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
