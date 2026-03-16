import { Network } from '@xchainjs/xchain-client'

export const getSuiNetwork = (network: Network): 'mainnet' | 'testnet' => {
  const networkMap: { [key in Network]: 'mainnet' | 'testnet' } = {
    [Network.Mainnet]: 'mainnet',
    [Network.Stagenet]: 'mainnet',
    [Network.Testnet]: 'testnet',
  }
  return networkMap[network]
}

export const getDefaultClientUrl = (network: Network): string => {
  const networkMap: { [key in Network]: string } = {
    [Network.Mainnet]: 'https://fullnode.mainnet.sui.io:443',
    [Network.Stagenet]: 'https://fullnode.mainnet.sui.io:443',
    [Network.Testnet]: 'https://fullnode.testnet.sui.io:443',
  }
  return networkMap[network]
}
