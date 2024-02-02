import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'

const MAINNET_EXPLORER_URL = 'https://bigdipper.live/cosmos'

const TESTNET_EXPLORER_URL = 'https://explorer.theta-testnet.polypore.xyz'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'https://rpc.sentry-02.theta-testnet.polypore.xyz',
    [Network.Stagenet]: 'https://rpc.cosmos.directory/cosmoshub',
    [Network.Mainnet]: 'https://rpc.cosmos.directory/cosmoshub',
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
