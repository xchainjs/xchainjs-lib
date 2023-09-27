import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'

import { AssetKUJI, DEFAULT_FEE } from './const'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'https://test-rpc-kujira.mintthemoon.xyz/',
    [Network.Stagenet]: 'https://rpc.cosmos.directory/kujira/',
    [Network.Mainnet]: 'https://rpc.cosmos.directory/kujira/',
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `44'/118'/0'/0/`,
  [Network.Testnet]: `44'/118'/0'/0/`,
  [Network.Stagenet]: `44'/118'/0'/0/`,
})

export const getDefaultExplorers = (): RootDerivationPaths => ({
  [Network.Mainnet]: 'https://finder.kujira.network/kaiyo-1',
  [Network.Testnet]: 'https://finder.kujira.network/harpoon-4',
  [Network.Stagenet]: 'https://finder.kujira.network/kaiyo-1',
})

export const defaultClientConfig: CosmosSdkClientParams = {
  chain: AssetKUJI.chain,
  clientUrls: getDefaultClientUrls(),
  rootDerivationPaths: getDefaultRootDerivationPaths(),
  prefix: 'kujira',
  defaultDecimals: 6,
  defaultFee: DEFAULT_FEE,
  baseDenom: 'ukuji',
}
