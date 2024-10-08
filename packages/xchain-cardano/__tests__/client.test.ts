import { Network } from '@xchainjs/xchain-client'
import { assetToString } from '@xchainjs/xchain-util'

import { Client, defaultAdaParams } from '../src'

describe('Cardano client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultAdaParams,
    })
  })

  describe('Asset', () => {
    it('Should get native asset', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('ADA.ADA')
      expect(assetInfo.decimal).toBe(6)
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://adastat.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            'addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
          ),
        ).toBe(
          'https://adastat.net/addresses/addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3')).toBe(
          'https://adastat.net/transactions/f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3',
        )
      })
    })

    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultAdaParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://preprod.cardanoscan.io/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('addr_test1vpws8zs83y2egkx28rg9cc97cdr46gsrpu8q8r0w8ylsq3saapj3k')).toBe(
          'https://preprod.cardanoscan.io/address/addr_test1vpws8zs83y2egkx28rg9cc97cdr46gsrpu8q8r0w8ylsq3saapj3k',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('dd941e610df9c7504be85153477012c254a6a5a46bb2142c62dea3f170f13faa')).toBe(
          'https://preprod.cardanoscan.io/transaction/dd941e610df9c7504be85153477012c254a6a5a46bb2142c62dea3f170f13faa',
        )
      })
    })

    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultAdaParams,
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://adastat.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            'addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
          ),
        ).toBe(
          'https://adastat.net/addresses/addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3')).toBe(
          'https://adastat.net/transactions/f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3',
        )
      })
    })
  })
})
