import { Network } from '@xchainjs/xchain-client'

import { defaultArbParams } from '../src/const'

describe('Arbitrum defaults', () => {
  it('points testnet at Arbitrum Sepolia', () => {
    const provider = defaultArbParams.dataProviders[0]?.[Network.Testnet] as { baseUrl: string } | undefined
    const rpc = defaultArbParams.providers[Network.Testnet] as { _getConnection: () => { url: string } }

    expect(provider?.baseUrl).toBe('https://api.routescan.io/v2/network/testnet/evm/421614/etherscan')
    expect(rpc._getConnection().url).toBe('https://sepolia-rollup.arbitrum.io/rpc')
    expect(defaultArbParams.explorerProviders[Network.Testnet].getExplorerUrl()).toBe('https://sepolia.arbiscan.io/')
  })
})
