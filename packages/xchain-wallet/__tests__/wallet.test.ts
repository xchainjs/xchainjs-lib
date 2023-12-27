import { Client as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'

import { Wallet } from '../'

describe('Wallet', () => {
  describe('Instantiation', () => {
    it('Should instantiate with no clients', () => {
      const wallet = new Wallet({})
      expect(wallet).not.toBeNull()
    })
    it('Should instantiate with multiple clients', () => {
      expect(
        new Wallet({
          BTC: new BtcClient({ ...defaultBTCParams, network: Network.Testnet }),
          ETH: new EthClient({ ...defaultEthParams, network: Network.Testnet }),
        }),
      ).toBeDefined()
    })
    it('Should not instantiate because of network mismatch', () => {
      expect(() => {
        new Wallet({
          BTC: new BtcClient({ ...defaultBTCParams, network: Network.Mainnet }),
          ETH: new EthClient({ ...defaultEthParams, network: Network.Testnet }),
        })
      }).toThrow('Clients not working on the same network')
    })
  })

  describe('Client management', () => {
    let wallet: Wallet
    beforeEach(() => {
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBTCParams, network: Network.Testnet }),
        ETH: new EthClient({ ...defaultEthParams, network: Network.Testnet }),
      })
    })

    it('Should get network', () => {
      expect(wallet.getNetwork()).toBe(Network.Testnet)
    })
    it('Should set network', () => {
      wallet.setNetwork(Network.Mainnet)
      expect(wallet.getNetwork()).toBe(Network.Mainnet)
    })
    it('Should add client', () => {
      expect(wallet.addClient('THOR', new ThorClient({ network: Network.Testnet }))).toBeTruthy()
    })
    it('Should not add client because it is already added', () => {
      expect(wallet.addClient('BTC', new BtcClient({ ...defaultBTCParams, network: Network.Testnet }))).toBeFalsy()
    })
    it('Should not add client because of network mismatch', () => {
      expect(() => {
        wallet.addClient('THOR', new ThorClient({ network: Network.Mainnet }))
      }).toThrow(`Trying to add client in different network. Expected ${Network.Testnet} but got ${Network.Mainnet}`)
    })
    it('Should purge client', () => {
      expect(wallet.purgeClient('BTC')).toBeTruthy()
    })
    it('Should not purge client because it is not added', () => {
      expect(wallet.purgeClient('THOR')).toBeFalsy()
    })
    it('Should purge wallet', () => {
      expect(wallet.purgeWallet()).toBeTruthy()
    })
  })
})
