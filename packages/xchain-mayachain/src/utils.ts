import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

const MAINNET_EXPLORER_URL = 'https://mayascan.org'

const STAGENET_EXPLORER_URL = 'https://stagenet.mayascan.org'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: 'https://stagenet.tendermint.mayachain.info',
    [Network.Mainnet]: 'https://tendermint.mayachain.info',
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/931'/0'/0/`,
  [Network.Stagenet]: `m/44'/931'/0'/0/`,
  [Network.Testnet]: `m/44'/931'/0'/0/`,
})

export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: MAINNET_EXPLORER_URL,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: STAGENET_EXPLORER_URL,
})

export const getExplorerAddressUrl = (address: Address): Record<Network, string> => ({
  [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/address/${address}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/address/${address}`,
})

export const getExplorerTxUrl = (tx: TxHash): Record<Network, string> => ({
  [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/tx/${tx}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/tx/${tx}`,
})
