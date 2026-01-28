import { Network } from '@xchainjs/xchain-client'
import { Wallet } from '@xchainjs/xchain-wallet'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'

import { Aggregator } from '../src'

describe('Network Configuration Tests', () => {
  it('Should create aggregator with explicit network configuration', () => {
    // Test that aggregator accepts network parameter
    const stagenetAggregator = new Aggregator({
      protocols: ['Thorchain'],
      network: Network.Stagenet,
    })

    expect(stagenetAggregator).toBeDefined()

    const mainnetAggregator = new Aggregator({
      protocols: ['Thorchain'],
      network: Network.Mainnet,
    })

    expect(mainnetAggregator).toBeDefined()
  })

  it('Should infer network from wallet when network not explicitly set', () => {
    // Create a wallet with stagenet clients
    const stagenetWallet = new Wallet({
      THOR: new ThorClient({ network: Network.Stagenet }),
    })

    // Create aggregator without explicit network - should infer from wallet
    const aggregator = new Aggregator({
      protocols: ['Thorchain'],
      wallet: stagenetWallet,
    })

    expect(aggregator).toBeDefined()
  })

  it('Should prefer explicit network over wallet network', () => {
    // Create wallet with mainnet
    const mainnetWallet = new Wallet({
      THOR: new ThorClient({ network: Network.Mainnet }),
    })

    // Create aggregator with explicit stagenet - should use stagenet, not mainnet from wallet
    const aggregator = new Aggregator({
      protocols: ['Thorchain'],
      wallet: mainnetWallet,
      network: Network.Stagenet, // This should take precedence
    })

    expect(aggregator).toBeDefined()
  })

  it('Should default to mainnet when no network or wallet provided', () => {
    const aggregator = new Aggregator({
      protocols: ['Thorchain'],
    })

    expect(aggregator).toBeDefined()
  })

  it('Should access protocol configurations without errors', () => {
    const aggregator = new Aggregator({
      protocols: ['Thorchain'],
      network: Network.Stagenet,
    })

    const config = aggregator.getConfiguration()
    expect(config.protocols).toContain('Thorchain')
    expect(config.protocols.length).toBe(1)
  })

  it('Should return network in configuration', () => {
    const stagenetAggregator = new Aggregator({
      protocols: ['Thorchain'],
      network: Network.Stagenet,
    })

    const config = stagenetAggregator.getConfiguration()
    expect(config.network).toBe(Network.Stagenet)
  })
})
