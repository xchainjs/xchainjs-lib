import { Network } from '@xchainjs/xchain-client'
import { assetToString } from '@xchainjs/xchain-util'

import {
  Client,
  defaultSuiParams,
  getDefaultGraphqlUrl,
  getDefaultGrpcUrl,
  resolveGraphqlUrl,
  resolvePrimaryUrl,
} from '../src'

describe('Sui client', () => {
  describe('Asset', () => {
    it('Should get native asset', () => {
      const client = new Client()
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('SUI.SUI')
      expect(assetInfo.decimal).toBe(9)
    })
  })

  describe('Defaults (post JSON-RPC deprecation)', () => {
    it('Should default transport to grpc with Foundation fullnode and GraphQL URLs', () => {
      expect(defaultSuiParams.transport).toBe('grpc')
      // Endpoint maps are resolved in the client (not baked into defaultSuiParams)
      // so consumer clientUrls are not shadowed by default grpcUrls.
      expect(defaultSuiParams.clientUrls).toBeUndefined()
      expect(defaultSuiParams.grpcUrls).toBeUndefined()
      expect(getDefaultGrpcUrl(Network.Mainnet)).toContain('fullnode.mainnet.sui.io')
      expect(getDefaultGraphqlUrl(Network.Mainnet)).toContain('graphql.mainnet.sui.io')
      expect(resolvePrimaryUrl(Network.Mainnet)).toBe(getDefaultGrpcUrl(Network.Mainnet))
      expect(resolveGraphqlUrl(Network.Mainnet)).toBe(getDefaultGraphqlUrl(Network.Mainnet))
    })

    it('Should honor consumer clientUrls over defaults (Asgardex-style spread)', () => {
      const custom = 'https://my-private-node.example:443'
      // Typical consumer pattern: spread defaults then set clientUrls
      const url = resolvePrimaryUrl(Network.Mainnet, {
        ...defaultSuiParams,
        clientUrls: {
          [Network.Mainnet]: custom,
          [Network.Testnet]: custom,
          [Network.Stagenet]: custom,
        },
      })
      expect(url).toBe(custom)
    })

    it('Should prefer grpcUrls over clientUrls when both provided', () => {
      const url = resolvePrimaryUrl(Network.Mainnet, {
        grpcUrls: {
          [Network.Mainnet]: 'https://grpc.example',
          [Network.Testnet]: 'https://grpc.example',
          [Network.Stagenet]: 'https://grpc.example',
        },
        clientUrls: {
          [Network.Mainnet]: 'https://client.example',
          [Network.Testnet]: 'https://client.example',
          [Network.Stagenet]: 'https://client.example',
        },
      })
      expect(url).toBe('https://grpc.example')
    })

    it('Should honor graphqlUrls override', () => {
      const custom = 'https://graphql.example/graphql'
      expect(
        resolveGraphqlUrl(Network.Mainnet, {
          graphqlUrls: {
            [Network.Mainnet]: custom,
            [Network.Testnet]: custom,
            [Network.Stagenet]: custom,
          },
        }),
      ).toBe(custom)
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://suiscan.xyz/mainnet')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e')).toBe(
          'https://suiscan.xyz/mainnet/account/0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6')).toBe(
          'https://suiscan.xyz/mainnet/tx/3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6',
        )
      })
    })
    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultSuiParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://suiscan.xyz/testnet')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e')).toBe(
          'https://suiscan.xyz/testnet/account/0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6')).toBe(
          'https://suiscan.xyz/testnet/tx/3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6',
        )
      })
    })
    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultSuiParams,
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://suiscan.xyz/mainnet')
      })
    })
  })

  describe('Addresses', () => {
    let client: Client
    beforeAll(() => {
      client = new Client()
    })

    it('Should not get address without phrase', async () => {
      await expect(client.getAddressAsync()).rejects.toThrow(/Phrase must be provided/)
    })

    it('Should not get address sync method not be implemented', () => {
      expect(() => client.getAddress()).toThrow('Sync method not supported')
    })

    it('Should get full derivation path with account 0', () => {
      expect(client.getFullDerivationPath(0)).toBe(`m/44'/784'/0'/0'`)
    })

    it('Should get full derivation path with account 1', () => {
      expect(client.getFullDerivationPath(1)).toBe(`m/44'/784'/1'/0'`)
    })

    it('Should validate address as valid', () => {
      expect(client.validateAddress('0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e')).toBeTruthy()
    })

    it('Should validate address as invalid', () => {
      expect(client.validateAddress('fakeAddress')).toBeFalsy()
    })
  })
})
