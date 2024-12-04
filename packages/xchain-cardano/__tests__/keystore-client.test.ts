import { Network } from '@xchainjs/xchain-client'

import { Client, defaultAdaParams } from '../src'

describe('Cardano client', () => {
  let knownPhrase: string

  beforeAll(() => {
    knownPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  })

  describe('Instantiation', () => {
    it('Should throw error with invalid phrase', async () => {
      expect(() => {
        new Client({
          phrase: 'invalid phrase',
          network: Network.Mainnet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      }).toThrow()

      expect(() => {
        new Client({
          ...defaultAdaParams,
          phrase: 'invalid phrase',
          network: Network.Testnet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      }).toThrow()

      expect(() => {
        new Client({
          ...defaultAdaParams,
          phrase: 'invalid phrase',
          network: Network.Stagenet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      }).toThrow()
    })

    it('Should not throw error on a client without a phrase', () => {
      expect(() => {
        new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      }).not.toThrow()
    })

    it('Should instantiate client with valid phrase', () => {
      expect(() => {
        new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
          phrase: knownPhrase,
        })
      }).not.toThrow()
    })
  })

  describe('Address', () => {
    let client: Client

    describe('Mainnet', () => {
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
          phrase: knownPhrase,
        })
      })

      it('Should generate account 0 address by default', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe(
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        )
      })

      it('Should generate account 1 address', async () => {
        const address = await client.getAddressAsync(1)
        expect(address).toBe(
          'addr1q9kjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsqj9j8fm',
        )
      })
    })

    describe('Stagenet', () => {
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
          network: Network.Stagenet,
          phrase: knownPhrase,
        })
      })

      it('Should generate account 0 address by default', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe(
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        )
      })

      it('Should generate account 1 address', async () => {
        const address = await client.getAddressAsync(1)
        expect(address).toBe(
          'addr1q9kjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsqj9j8fm',
        )
      })
    })

    describe('Testnet', () => {
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [],
          },
          network: Network.Testnet,
          phrase: knownPhrase,
        })
      })

      it('Should generate account 0 address by default', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe(
          'addr_test1qq8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mqkt5dmn',
        )
      })

      it('Should generate account 1 address', async () => {
        const address = await client.getAddressAsync(1)
        expect(address).toBe(
          'addr_test1qpkjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsq3n089y',
        )
      })
    })
  })
})
