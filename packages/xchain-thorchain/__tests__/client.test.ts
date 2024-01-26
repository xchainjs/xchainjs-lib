import { Network } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

import { AssetRuneNative as AssetRUNE, Client } from '../'

describe('Thorchain client', () => {
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
        expect(client.getExplorerUrl()).toBe('https://runescan.io')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('thor17gw75axcnr8747pkanye45pnrwk7p9c3cqncsv')).toBe(
          'https://runescan.io/address/thor17gw75axcnr8747pkanye45pnrwk7p9c3cqncsv',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('19CB7A460869BE9EF7711BE82980A384816F58B5B1B16D67F55443B8470865E7')).toBe(
          'https://runescan.io/tx/19CB7A460869BE9EF7711BE82980A384816F58B5B1B16D67F55443B8470865E7',
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
        expect(client.getExplorerAddressUrl('thor17gw75axcnr8747pkanye45pnrwk7p9c3cqncsv')).toBe('deprecated')
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('19CB7A460869BE9EF7711BE82980A384816F58B5B1B16D67F55443B8470865E7')).toBe(
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
        expect(client.getExplorerUrl()).toBe('https://runescan.io/?network=stagenet')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('sthor1g6pnmnyeg48yc3lg796plt0uw50qpp7humfggz')).toBe(
          'https://runescan.io/address/sthor1g6pnmnyeg48yc3lg796plt0uw50qpp7humfggz?network=stagenet',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('852D04CA5944611DB4F71002CAAD4F2E480742143BB5FA75FFADB0D41429BE28')).toBe(
          'https://runescan.io/tx/852D04CA5944611DB4F71002CAAD4F2E480742143BB5FA75FFADB0D41429BE28?network=stagenet',
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
      expect(nativeAsset.asset).toEqual({ chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', synth: false })
      expect(nativeAsset.decimal).toBe(8)
    })

    it('Should get denom for asset', () => {
      const synthBNBAsset: Asset = { chain: 'BNB', symbol: 'BNB', ticker: 'BNB', synth: true }
      expect(client.getDenom(synthBNBAsset)).toEqual('bnb/bnb')
      expect(client.getDenom(AssetRUNE)).toEqual('rune')
    })
    it('Should get asset for denom', () => {
      expect(client.assetFromDenom('rune')).toEqual(AssetRUNE)
      expect(client.assetFromDenom('bnb/bnb')).toEqual({ chain: 'BNB', symbol: 'BNB', ticker: 'BNB', synth: true })
    })
    it('should get asset decimals', async () => {
      expect(client.getAssetDecimals(AssetRUNE)).toBe(8)
    })
  })

  describe('Address', () => {
    describe('Mainnet', () => {
      it('Should validate address', () => {
        const client = new Client()
        expect(client.validateAddress('thor1k2e50ws3d9lce9ycr7ppaazx3ygaa7lxj8kkny')).toBeTruthy()
        expect(client.validateAddress('0x42D5B09a92A31AfB875e1E40ae4b06f2A60890FC')).toBeFalsy()
      })
    })
    describe('Stagenet', () => {
      it('Should validate address', () => {
        const client = new Client({ network: Network.Stagenet, prefix: 'sthor' })
        expect(client.validateAddress('sthor17gw75axcnr8747pkanye45pnrwk7p9c3ve0wxj')).toBeTruthy()
        expect(client.validateAddress('0x42D5B09a92A31AfB875e1E40ae4b06f2A60890FC')).toBeFalsy()
      })
    })
  })
})
