import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'
import { eqAsset } from '@xchainjs/xchain-util'
import axios from 'axios'

import { ATOM_DENOM, AssetATOM } from './const'
import { CompatibleAsset } from './types'

const MAINNET_EXPLORER_URL = 'https://www.mintscan.io/cosmos'
const TESTNET_EXPLORER_URL = 'https://explorer.theta-testnet.polypore.xyz'

export const getDefaultClientUrls = (): Record<Network, string[]> => {
  return {
    [Network.Testnet]: ['https://rpc.sentry-02.theta-testnet.polypore.xyz'],
    [Network.Stagenet]: ['https://cosmos-rpc.publicnode.com', 'https://rpc.cosmos.directory/cosmoshub'],
    [Network.Mainnet]: ['https://cosmos-rpc.publicnode.com', 'https://rpc.cosmos.directory/cosmoshub'],
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/118'/0'/0/`,
  [Network.Testnet]: `m/44'/118'/0'/0/`,
  [Network.Stagenet]: `m/44'/118'/0'/0/`,
})

export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: MAINNET_EXPLORER_URL,
  [Network.Testnet]: TESTNET_EXPLORER_URL,
  [Network.Stagenet]: MAINNET_EXPLORER_URL,
})

/** Currently only supports ATOM. */
export const getDenom = (asset: CompatibleAsset): string | null => {
  if (eqAsset(asset, AssetATOM)) return ATOM_DENOM
  return null
}

export const getChainId = async (url: string): Promise<string> => {
  const { data } = await axios.get<{ node_info: { network: string } }>(`${url}/node_info`)
  return data?.node_info?.network || Promise.reject('Could not parse chain id')
}

export const getPrefix = () => 'cosmos'
