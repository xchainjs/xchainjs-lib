import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'

import { AssetKUJI, DEFAULT_FEE } from './const'
/**
 * Returns default client URLs based on the network.
 *
 * @returns {Record<Network, string>} URLs for different networks.
 */
export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'https://kujira-testnet-rpc.polkachu.com/',
    [Network.Stagenet]: 'https://rpc.cosmos.directory/kujira/',
    [Network.Mainnet]: 'https://rpc.cosmos.directory/kujira/',
  }
}

/**
 * Returns default root derivation paths based on the network.
 *
 * @returns {RootDerivationPaths} Default root derivation paths for different networks.
 */
export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `44'/118'/0'/0/`,
  [Network.Testnet]: `44'/118'/0'/0/`,
  [Network.Stagenet]: `44'/118'/0'/0/`,
})

/**
 * Returns default explorers URLs based on the network.
 *
 * @returns {RootDerivationPaths} Default explorer URLs for different networks.
 */
export const getDefaultExplorers = (): RootDerivationPaths => ({
  [Network.Mainnet]: 'https://finder.kujira.network/kaiyo-1',
  [Network.Testnet]: 'https://finder.kujira.network/harpoon-4',
  [Network.Stagenet]: 'https://finder.kujira.network/kaiyo-1',
})

/**
 * Default configuration parameters for the KUJI client.
 */
export const defaultClientConfig: CosmosSdkClientParams = {
  chain: AssetKUJI.chain,
  network: Network.Mainnet,
  clientUrls: getDefaultClientUrls(),
  rootDerivationPaths: getDefaultRootDerivationPaths(),
  prefix: 'kujira',
  defaultDecimals: 6,
  defaultFee: DEFAULT_FEE,
  baseDenom: 'ukuji',
  registryTypes: [],
}
