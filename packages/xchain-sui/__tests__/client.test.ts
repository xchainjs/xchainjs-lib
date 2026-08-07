import { Network } from '@xchainjs/xchain-client'
import { assetToString } from '@xchainjs/xchain-util'

import {
  Client,
  defaultSuiParams,
  formatGrpcExecutionFailure,
  getDefaultGraphqlUrl,
  getDefaultGrpcUrl,
  isGrpcExecutionFailure,
  resolveGraphqlUrl,
  resolvePrimaryUrl,
  safeJsonStringify,
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

  describe('gRPC execution status error reporting', () => {
    it('Should stringify objects that contain BigInt without throwing', () => {
      const status = {
        success: false,
        error: {
          description: 'InsufficientGas',
          command: 2n,
        },
      }
      expect(() => JSON.stringify(status)).toThrow(/BigInt/)
      expect(safeJsonStringify(status)).toContain('2')
      expect(safeJsonStringify(status)).toContain('InsufficientGas')
    })

    it('Should treat only object success:false as failure', () => {
      expect(isGrpcExecutionFailure({ success: false })).toBe(true)
      expect(isGrpcExecutionFailure({ success: true })).toBe(false)
      expect(isGrpcExecutionFailure(undefined)).toBe(false)
      // enum-style number — leave as non-failure (same as pre-fix behavior)
      expect(isGrpcExecutionFailure(0)).toBe(false)
      expect(isGrpcExecutionFailure(1)).toBe(false)
    })

    it('Should format failure using description and BigInt command without TypeError', () => {
      const status = {
        success: false,
        error: {
          description: 'InsufficientCoinBalance',
          command: 0n,
        },
      }
      const message = formatGrpcExecutionFailure(status)
      expect(message).toContain('Transaction failed')
      expect(message).toContain('InsufficientCoinBalance')
      expect(message).toContain('command 0')
      expect(() => {
        if (isGrpcExecutionFailure(status)) {
          throw Error(formatGrpcExecutionFailure(status))
        }
      }).toThrow(/InsufficientCoinBalance/)
    })

    it('Should not duplicate command id when description already includes it', () => {
      const message = formatGrpcExecutionFailure({
        success: false,
        error: {
          description: 'InsufficientCoinBalance in command 0',
          command: 0n,
        },
      })
      expect(message).toBe('Transaction failed: InsufficientCoinBalance in command 0')
    })

    it('Should fall back to safe stringify when description is missing', () => {
      const status = { success: false, error: { command: 7n, kind: 3 } }
      const message = formatGrpcExecutionFailure(status)
      expect(message.startsWith('Transaction failed:')).toBe(true)
      expect(message).toContain('7')
      expect(() => {
        throw Error(formatGrpcExecutionFailure(status))
      }).not.toThrow(/serialize a BigInt/)
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
