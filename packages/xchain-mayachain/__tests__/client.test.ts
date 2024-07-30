import { Network } from '@xchainjs/xchain-client'
import { AssetType, SynthAsset } from '@xchainjs/xchain-util'

import { AssetCacao, AssetMaya, Client } from '../src'

describe('Mayachain client', () => {
  describe('Instantiation', () => {
    it('Should throw error with invalid phrase', async () => {
      expect(() => {
        new Client({ phrase: 'invalid phrase', network: Network.Mainnet })
      }).toThrow()

      expect(() => {
        new Client({ phrase: 'invalid phrase', network: Network.Stagenet })
      }).toThrow()
    })

    it('Should not throw error on a client without a phrase', () => {
      expect(() => {
        new Client()
      }).not.toThrow()
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://mayascan.org')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('maya1fmecyfrrwsm98m59nv9y88urgur8p32g27kha6')).toBe(
          'https://mayascan.org/address/maya1fmecyfrrwsm98m59nv9y88urgur8p32g27kha6',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('BD912F73A50317A4A3567A4D3C66B1A53D25BA7B299BB4C1D254E2A45DA83279')).toBe(
          'https://mayascan.org/tx/BD912F73A50317A4A3567A4D3C66B1A53D25BA7B299BB4C1D254E2A45DA83279',
        )
      })
    })
    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('deprecated')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('https://mayascan.org')).toBe('deprecated')
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('BD912F73A50317A4A3567A4D3C66B1A53D25BA7B299BB4C1D254E2A45DA83279')).toBe(
          'deprecated',
        )
      })
    })
    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://stagenet.mayascan.org')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('smaya18z343fsdlav47chtkyp0aawqt6sgxsh3ctcu6u')).toBe(
          'https://stagenet.mayascan.org/address/smaya18z343fsdlav47chtkyp0aawqt6sgxsh3ctcu6u',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('796D37DBB13F1A7EB86720832A4F395729F9AAFC953DC576795BEEE3FC4EBEC6')).toBe(
          'https://stagenet.mayascan.org/tx/796D37DBB13F1A7EB86720832A4F395729F9AAFC953DC576795BEEE3FC4EBEC6',
        )
      })
    })
  })

  describe('Asset', () => {
    let client: Client
    beforeAll(() => {
      client = new Client()
    })

    it('Should get native asset', () => {
      const nativeAsset = client.getAssetInfo()
      expect(nativeAsset.asset).toEqual({ chain: 'MAYA', symbol: 'CACAO', ticker: 'CACAO', type: AssetType.NATIVE })
      expect(nativeAsset.decimal).toBe(10)
    })

    it('Should get denom for asset', () => {
      const synthBNBAsset: SynthAsset = { chain: 'BNB', symbol: 'BNB', ticker: 'BNB', type: AssetType.SYNTH }
      expect(client.getDenom(synthBNBAsset)).toEqual('bnb/bnb')
      expect(client.getDenom(AssetCacao)).toEqual('cacao')
    })
    it('Should get asset for denom', () => {
      expect(client.assetFromDenom('cacao')).toEqual(AssetCacao)
      expect(client.assetFromDenom('bnb/bnb')).toEqual({
        chain: 'BNB',
        symbol: 'BNB',
        type: AssetType.SYNTH,
        ticker: 'BNB',
      })
    })
    it('should get asset decimals', async () => {
      expect(client.getAssetDecimals(AssetCacao)).toBe(10)
      expect(client.getAssetDecimals(AssetMaya)).toBe(4)
    })
  })

  describe('Address', () => {
    describe('Mainnet', () => {
      it('Should validate address', () => {
        const client = new Client()
        expect(client.validateAddress('maya1ty0e5kry55rm7qd8g2uwp9y4rjfmmj6hfal0ul')).toBeTruthy()
        expect(client.validateAddress('0x42D5B09a92A31AfB875e1E40ae4b06f2A60890FC')).toBeFalsy()
      })
      it('Should change network and validate address', () => {
        const client = new Client({ network: Network.Stagenet })
        client.setNetwork(Network.Mainnet)
        expect(client.validateAddress('maya1ty0e5kry55rm7qd8g2uwp9y4rjfmmj6hfal0ul')).toBeTruthy()
      })
    })
    describe('Stagenet', () => {
      it('Should validate address', () => {
        const client = new Client({ network: Network.Stagenet })
        expect(client.validateAddress('smaya18z343fsdlav47chtkyp0aawqt6sgxsh3ctcu6u')).toBeTruthy()
        expect(client.validateAddress('0x42D5B09a92A31AfB875e1E40ae4b06f2A60890FC')).toBeFalsy()
      })
      it('Should change network and validate address', () => {
        const client = new Client()
        client.setNetwork(Network.Stagenet)
        expect(client.validateAddress('smaya18z343fsdlav47chtkyp0aawqt6sgxsh3ctcu6u')).toBeTruthy()
      })
    })
  })
})
