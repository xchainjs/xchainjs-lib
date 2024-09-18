import { Network } from '@xchainjs/xchain-client'

import { Client, defaultBTCParams } from '../src'

describe('Bitcoin client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client()
  })

  describe('Address', () => {
    it('Should validate p2wpkh address', () => {
      const isValid = client.validateAddress('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu')
      expect(isValid).toBeTruthy()
    })

    it('Should validate p2tr address', () => {
      const isValid = client.validateAddress('bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr')
      expect(isValid).toBeTruthy()
    })
  })

  describe('Explorers', () => {
    let knownAddress: string
    let knownTx: string

    beforeAll(() => {
      knownAddress = 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu'
      knownTx = '3a130f7b0d517ea7209c1d08e0fdf2ab33f35a7e3fd0c8f141026fdc95a05b88'
    })

    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://blockstream.info/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl(knownAddress)).toBe(
          'https://blockstream.info/address/bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl(knownTx)).toBe(
          'https://blockstream.info/tx/3a130f7b0d517ea7209c1d08e0fdf2ab33f35a7e3fd0c8f141026fdc95a05b88',
        )
      })
    })

    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultBTCParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://blockstream.info/testnet/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl(knownAddress)).toBe(
          'https://blockstream.info/testnet/address/bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl(knownTx)).toBe(
          'https://blockstream.info/testnet/tx/3a130f7b0d517ea7209c1d08e0fdf2ab33f35a7e3fd0c8f141026fdc95a05b88',
        )
      })
    })
    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultBTCParams,
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://blockstream.info/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl(knownAddress)).toBe(
          'https://blockstream.info/address/bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl(knownTx)).toBe(
          'https://blockstream.info/tx/3a130f7b0d517ea7209c1d08e0fdf2ab33f35a7e3fd0c8f141026fdc95a05b88',
        )
      })
    })
  })
})
