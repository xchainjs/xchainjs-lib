import { Network } from '@xchainjs/xchain-client'
import { AssetType } from '@xchainjs/xchain-util'

import { AssetATOM, Client } from '../src'

describe('Cosmos client', () => {
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
        expect(client.getExplorerUrl()).toBe('https://bigdipper.live/cosmos')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('cosmos1p9axwnsmnzhn0haaerzae9y2adv8q2nslnyzz3')).toBe(
          'https://bigdipper.live/cosmos/accounts/cosmos1p9axwnsmnzhn0haaerzae9y2adv8q2nslnyzz3',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('D31925DD10D19AE2FEA4E8C88273238198B3503032540DBDB43080730B971DE4')).toBe(
          'https://bigdipper.live/cosmos/transactions/D31925DD10D19AE2FEA4E8C88273238198B3503032540DBDB43080730B971DE4',
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
        expect(client.getExplorerUrl()).toBe('https://explorer.theta-testnet.polypore.xyz')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('cosmos1ccd77j0v5xr0xjwkmypzd3mhldkwuv5pryefte')).toBe(
          'https://explorer.theta-testnet.polypore.xyz/accounts/cosmos1ccd77j0v5xr0xjwkmypzd3mhldkwuv5pryefte',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('1C238F65AED7A29E6144020A556A5F7D1412E12C62E4EA7FA9C14864600B23D6')).toBe(
          'https://explorer.theta-testnet.polypore.xyz/transactions/1C238F65AED7A29E6144020A556A5F7D1412E12C62E4EA7FA9C14864600B23D6',
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
        expect(client.getExplorerUrl()).toBe('https://bigdipper.live/cosmos')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('cosmos1p9axwnsmnzhn0haaerzae9y2adv8q2nslnyzz3')).toBe(
          'https://bigdipper.live/cosmos/accounts/cosmos1p9axwnsmnzhn0haaerzae9y2adv8q2nslnyzz3',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('D31925DD10D19AE2FEA4E8C88273238198B3503032540DBDB43080730B971DE4')).toBe(
          'https://bigdipper.live/cosmos/transactions/D31925DD10D19AE2FEA4E8C88273238198B3503032540DBDB43080730B971DE4',
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
      expect(nativeAsset.asset).toEqual({ chain: 'GAIA', symbol: 'ATOM', ticker: 'ATOM', type: AssetType.NATIVE })
      expect(nativeAsset.decimal).toBe(6)
    })

    it('Should get denom for asset', () => {
      expect(client.getDenom(AssetATOM)).toEqual('uatom')
    })
    it('Should get asset for denom', () => {
      expect(client.assetFromDenom('uatom')).toEqual(AssetATOM)
    })
    it('should get asset decimals', async () => {
      expect(client.getAssetDecimals(AssetATOM)).toBe(6)
    })
  })

  describe('Address', () => {
    describe('Mainnet', () => {
      it('Should validate address', () => {
        const client = new Client()
        expect(client.validateAddress('cosmos1ccd77j0v5xr0xjwkmypzd3mhldkwuv5pryefte')).toBeTruthy()
        expect(client.validateAddress('0x42D5B09a92A31AfB875e1E40ae4b06f2A60890FC')).toBeFalsy()
      })
      it('Should change network and validate address', () => {
        const client = new Client({ network: Network.Stagenet })
        client.setNetwork(Network.Mainnet)
        expect(client.validateAddress('cosmos1ccd77j0v5xr0xjwkmypzd3mhldkwuv5pryefte')).toBeTruthy()
      })
    })
    describe('Stagenet', () => {
      it('Should validate address', () => {
        const client = new Client({ network: Network.Stagenet })
        expect(client.validateAddress('cosmos1ccd77j0v5xr0xjwkmypzd3mhldkwuv5pryefte')).toBeTruthy()
        expect(client.validateAddress('0x42D5B09a92A31AfB875e1E40ae4b06f2A60890FC')).toBeFalsy()
      })
      it('Should change network and validate address', () => {
        const client = new Client()
        client.setNetwork(Network.Stagenet)
        expect(client.validateAddress('cosmos1ccd77j0v5xr0xjwkmypzd3mhldkwuv5pryefte')).toBeTruthy()
      })
    })
  })
})
