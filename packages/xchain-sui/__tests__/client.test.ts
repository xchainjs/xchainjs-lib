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

    it('Should format SDK 2 execution status that uses message instead of description', () => {
      const message = formatGrpcExecutionFailure({
        success: false,
        error: {
          message: 'InsufficientCoinBalance',
          command: 0,
        },
      })
      expect(message).toBe('Transaction failed: InsufficientCoinBalance (command 0)')
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

    it('Should derive the same SLIP-10 address after the SDK 2 upgrade', async () => {
      const keyed = new Client({
        ...defaultSuiParams,
        phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      })
      // m/44'/784'/0'/0' via Ed25519Keypair.fromSecretKey. Same pubkey as SDK 1.45 (@noble/curves 1.9).
      await expect(keyed.getAddressAsync(0)).resolves.toBe(
        '0xdfd6914c9e8f2d2485eb34ce3a4997d15352cd9e2fca6425717815259aeb2459',
      )
    })

    it('Should construct a legacy JSON-RPC client', () => {
      expect(
        new Client({
          ...defaultSuiParams,
          transport: 'jsonRpc',
        }),
      ).toBeInstanceOf(Client)
    })
  })

  describe('Coin metadata', () => {
    const owner = '0xdfd6914c9e8f2d2485eb34ce3a4997d15352cd9e2fca6425717815259aeb2459'
    const usdc = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

    function jsonRpcClient(getCoinMetadata: () => Promise<{ decimals?: number } | null>) {
      const client = new Client({ ...defaultSuiParams, transport: 'jsonRpc' })
      const internals = client as unknown as {
        getJsonRpcClient(): Promise<{
          getBalance(): Promise<{ totalBalance: string }>
          getAllBalances(): Promise<{ coinType: string; totalBalance: string }[]>
          getCoinMetadata(): Promise<{ decimals?: number } | null>
        }>
      }
      internals.getJsonRpcClient = async () => ({
        getBalance: async () => ({ totalBalance: '5000000000' }),
        getAllBalances: async () => [{ coinType: usdc, totalBalance: '1000000' }],
        getCoinMetadata,
      })
      return client
    }

    it('Should keep a token when metadata reports its decimals', async () => {
      const client = jsonRpcClient(async () => ({ decimals: 6 }))
      const balances = await client.getBalance(owner)
      const token = balances.find((balance) => balance.asset.ticker === 'USDC')

      expect(token?.amount.decimal).toBe(6)
      expect(token?.amount.amount().toFixed(0)).toBe('1000000')
    })

    it('Should keep a token whose metadata decimals are zero', async () => {
      const client = jsonRpcClient(async () => ({ decimals: 0 }))
      const balances = await client.getBalance(owner)

      expect(balances.find((balance) => balance.asset.ticker === 'USDC')?.amount.decimal).toBe(0)
    })

    it('Should omit a token when JSON-RPC metadata is missing', async () => {
      const client = jsonRpcClient(async () => null)
      const balances = await client.getBalance(owner)

      expect(balances.map((balance) => balance.asset.ticker)).toEqual(['SUI'])
      expect(balances[0].amount.amount().toFixed(0)).toBe('5000000000')
    })

    it('Should omit a token when JSON-RPC metadata throws', async () => {
      const client = jsonRpcClient(async () => {
        throw Error('metadata down')
      })
      const balances = await client.getBalance(owner)

      expect(balances.map((balance) => balance.asset.ticker)).toEqual(['SUI'])
    })

    it('Should omit a token when GraphQL and gRPC metadata both fail', async () => {
      const client = new Client({ ...defaultSuiParams })
      const originalFetch = globalThis.fetch
      globalThis.fetch = async () => {
        throw Error('graphql down')
      }
      try {
        const internals = client as unknown as {
          requireGrpc(): {
            getBalance(): Promise<{ balance: { balance: string } }>
            listBalances(): Promise<{
              balances: { coinType: string; balance: string }[]
              hasNextPage: boolean
              cursor: null
            }>
            getCoinMetadata(): Promise<never>
          }
        }
        internals.requireGrpc = () => ({
          getBalance: async () => ({ balance: { balance: '5000000000' } }),
          listBalances: async () => ({
            balances: [{ coinType: usdc, balance: '1000000' }],
            hasNextPage: false,
            cursor: null,
          }),
          getCoinMetadata: async () => {
            throw Error('grpc metadata down')
          },
        })

        const balances = await client.getBalance(owner)

        expect(balances.map((balance) => balance.asset.ticker)).toEqual(['SUI'])
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it('Should omit a token when both metadata calls return no decimals', async () => {
      const client = new Client({ ...defaultSuiParams })
      const originalFetch = globalThis.fetch
      globalThis.fetch = (async () => ({
        ok: true,
        json: async () => ({ data: { coinMetadata: null } }),
      })) as typeof fetch
      try {
        const internals = client as unknown as {
          requireGrpc(): {
            getBalance(): Promise<{ balance: { balance: string } }>
            listBalances(): Promise<{
              balances: { coinType: string; balance: string }[]
              hasNextPage: boolean
              cursor: null
            }>
            getCoinMetadata(): Promise<{ coinMetadata: null }>
          }
        }
        internals.requireGrpc = () => ({
          getBalance: async () => ({ balance: { balance: '5000000000' } }),
          listBalances: async () => ({
            balances: [{ coinType: usdc, balance: '1000000' }],
            hasNextPage: false,
            cursor: null,
          }),
          getCoinMetadata: async () => ({ coinMetadata: null }),
        })

        const balances = await client.getBalance(owner)

        expect(balances.map((balance) => balance.asset.ticker)).toEqual(['SUI'])
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it('Should skip a history leg whose decimals are unknown', async () => {
      const client = new Client({ ...defaultSuiParams, transport: 'jsonRpc' })
      const internals = client as unknown as {
        getCoinDecimals(coinType: string): Promise<number | undefined>
        parseGraphqlTransactionNode(node: unknown): Promise<{
          from: { amount: { decimal: number } }[]
          to: { amount: { decimal: number } }[]
        }>
        parseJsonRpcTransaction(tx: unknown): Promise<{ from: { amount: { decimal: number } }[] }>
      }
      internals.getCoinDecimals = async (coinType) => (coinType === usdc ? undefined : 9)

      const graphqlTx = await internals.parseGraphqlTransactionNode({
        digest: 'd',
        effects: {
          timestamp: null,
          status: 'success',
          balanceChanges: {
            nodes: [
              { amount: '-1000000', coinType: { repr: usdc }, owner: { address: '0xsender' } },
              { amount: '1000000000', coinType: { repr: '0x2::sui::SUI' }, owner: { address: '0xrecipient' } },
            ],
          },
        },
      })
      const jsonTx = await internals.parseJsonRpcTransaction({
        digest: 'd',
        timestampMs: '1',
        balanceChanges: [{ coinType: usdc, amount: '-1000000', owner: { AddressOwner: '0xsender' } }],
      })

      expect(graphqlTx.from).toEqual([])
      expect(graphqlTx.to[0].amount.decimal).toBe(9)
      expect(jsonTx.from).toEqual([])
    })
  })
})
