import { Network } from '@xchainjs/xchain-client'

import {
  AddressFormat,
  Client,
  defaultBTCParams,
  legacyDerivationPaths,
  nestedSegwitDerivationPaths,
  tapRootDerivationPaths,
} from '../src'

describe('Bitcoin Keystore client', () => {
  let knownPhrase: string

  beforeAll(() => {
    knownPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  })

  describe('Instantiation', () => {
    it('Should throw error with invalid phrase', async () => {
      expect(() => {
        new Client({ ...defaultBTCParams, phrase: 'invalid phrase', network: Network.Mainnet })
      }).toThrow()

      expect(() => {
        new Client({ ...defaultBTCParams, phrase: 'invalid phrase', network: Network.Testnet })
      }).toThrow()

      expect(() => {
        new Client({ ...defaultBTCParams, phrase: 'invalid phrase', network: Network.Stagenet })
      }).toThrow()
    })

    it('Should not throw error on a client without a phrase', () => {
      expect(() => {
        new Client()
      }).not.toThrow()
    })

    it('Should instantiate client with valid phrase', () => {
      expect(() => {
        new Client({
          ...defaultBTCParams,
          phrase: knownPhrase,
        })
      }).not.toThrow()
    })

    it('Should instantiate Taproot client with valid phrase', () => {
      expect(() => {
        new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2TR,
          rootDerivationPaths: tapRootDerivationPaths,
        })
      }).not.toThrow()
    })

    it('Should not instantiate Taproot client due to wrong paths', () => {
      expect(() => {
        new Client({ ...defaultBTCParams, phrase: 'invalid phrase', network: Network.Mainnet })
      }).toThrow()
    })

    it('Should instantiate legacy (P2PKH) client with valid phrase', () => {
      expect(() => {
        new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2PKH,
          rootDerivationPaths: legacyDerivationPaths,
          phrase: knownPhrase,
        })
      }).not.toThrow()
    })

    it('Should not instantiate legacy client with non-44 paths', () => {
      expect(() => {
        new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2PKH,
          rootDerivationPaths: defaultBTCParams.rootDerivationPaths,
        })
      }).toThrow()
    })

    it('Should instantiate nested segwit (P2SH-P2WPKH) client with valid phrase', () => {
      expect(() => {
        new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2SH_P2WPKH,
          rootDerivationPaths: nestedSegwitDerivationPaths,
          phrase: knownPhrase,
        })
      }).not.toThrow()
    })

    it('Should not instantiate nested segwit client with non-49 paths', () => {
      expect(() => {
        new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2SH_P2WPKH,
          rootDerivationPaths: defaultBTCParams.rootDerivationPaths,
        })
      }).toThrow()
    })
  })

  describe('Address', () => {
    describe('Default client', () => {
      let client: Client
      let knownAddress: string

      beforeAll(() => {
        client = new Client({
          ...defaultBTCParams,
          phrase: knownPhrase,
        })
        knownAddress = 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu'
      })

      it('Should generate address', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe(knownAddress)
      })
    })

    describe('Taproot client', () => {
      let client: Client
      let knownAddress: string

      beforeAll(() => {
        client = new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2TR,
          rootDerivationPaths: tapRootDerivationPaths,
          phrase: knownPhrase,
        })
        knownAddress = 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr'
      })

      it('Should generate address', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe(knownAddress)
      })
    })

    describe('Legacy (P2PKH) client', () => {
      let client: Client

      beforeAll(() => {
        client = new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2PKH,
          rootDerivationPaths: legacyDerivationPaths,
          phrase: knownPhrase,
        })
      })

      // BIP44 m/44'/0'/0'/0/0 for the standard "abandon..." test mnemonic
      it('Should generate legacy address', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe('1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA')
      })
    })

    describe('Nested segwit (P2SH-P2WPKH) client', () => {
      let client: Client

      beforeAll(() => {
        client = new Client({
          ...defaultBTCParams,
          addressFormat: AddressFormat.P2SH_P2WPKH,
          rootDerivationPaths: nestedSegwitDerivationPaths,
          phrase: knownPhrase,
        })
      })

      // BIP49 m/49'/0'/0'/0/0 for the standard "abandon..." test mnemonic
      it('Should generate nested segwit address', async () => {
        const address = await client.getAddressAsync()
        expect(address).toBe('37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf')
      })
    })
  })
})
