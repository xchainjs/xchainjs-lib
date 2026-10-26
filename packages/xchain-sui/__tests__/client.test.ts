import { FeeOption, Network } from '@xchainjs/xchain-client'
import { Transaction } from '@mysten/sui/transactions'
import { TokenAsset, assetFromStringEx, assetToString, baseAmount } from '@xchainjs/xchain-util'

import {
  Client,
  SUI_TYPE_TAG,
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

  describe('Token coin type', () => {
    const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    const coinType = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
    const recipient = '0xdfd6914c9e8f2d2485eb34ce3a4997d15352cd9e2fca6425717815259aeb2459'
    const coin = {
      objectId: '0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e',
      version: '1',
      digest: '3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6',
      balance: 10_000_000_000n,
    }

    async function prepareToken(symbolCoinType: string): Promise<string[]> {
      const client = new Client({ ...defaultSuiParams, phrase, transport: 'jsonRpc' })
      const queried: string[] = []
      const internals = client as unknown as {
        getCoins(owner: string, type: string): Promise<(typeof coin)[]>
        getReferenceGasPrice(): Promise<bigint>
      }
      internals.getReferenceGasPrice = async () => 1000n
      internals.getCoins = async (_owner, type) => {
        queried.push(type)
        return [coin]
      }

      await client.prepareTx({
        walletIndex: 0,
        recipient,
        asset: assetFromStringEx(`SUI.USDC-${symbolCoinType}`) as TokenAsset,
        amount: baseAmount(1, 6),
      })
      return queried
    }

    it('Should query coins with the 0x coin type carried on the asset', async () => {
      await expect(prepareToken(coinType)).resolves.toEqual([SUI_TYPE_TAG, coinType])
    })

    it('Should restore 0x when the asset symbol omitted it', async () => {
      await expect(prepareToken(coinType.slice(2))).resolves.toEqual([SUI_TYPE_TAG, coinType])
    })
  })

  describe('Coin pages', () => {
    const owner = '0xdfd6914c9e8f2d2485eb34ce3a4997d15352cd9e2fca6425717815259aeb2459'
    const coinType = '0x2::sui::SUI'

    function coin(objectId: string) {
      return { objectId, version: '1', digest: '3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6' }
    }

    it('Should follow JSON-RPC getCoins cursors past the first page', async () => {
      const client = new Client({ ...defaultSuiParams, transport: 'jsonRpc' })
      const cursors: Array<string | null | undefined> = []
      const internals = client as unknown as {
        getJsonRpcClient(): Promise<{
          getCoins(args: { cursor?: string | null }): Promise<{
            data: { coinObjectId: string; version: string; digest: string }[]
            hasNextPage: boolean
            nextCursor: string | null
          }>
        }>
        getCoins(owner: string, type: string): Promise<{ objectId: string }[]>
      }
      internals.getJsonRpcClient = async () => ({
        getCoins: async ({ cursor }) => {
          cursors.push(cursor)
          if (!cursor) {
            return {
              data: [
                { coinObjectId: '0x01', version: '1', digest: 'd1' },
                { coinObjectId: '0x02', version: '2', digest: 'd2' },
              ],
              hasNextPage: true,
              nextCursor: '0x02',
            }
          }
          return {
            data: [{ coinObjectId: '0x03', version: '3', digest: 'd3' }],
            hasNextPage: false,
            nextCursor: null,
          }
        },
      })

      const coins = await internals.getCoins(owner, coinType)

      expect(coins.map((c) => c.objectId)).toEqual(['0x01', '0x02', '0x03'])
      expect(cursors).toEqual([undefined, '0x02'])
    })

    it('Should follow gRPC listCoins cursors past the first page', async () => {
      const client = new Client({ ...defaultSuiParams })
      const cursors: Array<string | null | undefined> = []
      const internals = client as unknown as {
        requireGrpc(): {
          listCoins(args: { cursor?: string | null }): Promise<{
            objects: { objectId: string; version: string; digest: string }[]
            hasNextPage: boolean
            cursor: string | null
          }>
        }
        getCoins(owner: string, type: string): Promise<{ objectId: string }[]>
      }
      internals.requireGrpc = () => ({
        listCoins: async ({ cursor }) => {
          cursors.push(cursor)
          if (!cursor) {
            return {
              objects: [coin('0x11'), coin('0x12')],
              hasNextPage: true,
              cursor: 'page-2',
            }
          }
          return {
            objects: [coin('0x13')],
            hasNextPage: false,
            cursor: null,
          }
        },
      })

      const coins = await internals.getCoins(owner, coinType)

      expect(coins.map((c) => c.objectId)).toEqual(['0x11', '0x12', '0x13'])
      expect(cursors).toEqual([undefined, 'page-2'])
    })

    it('Should stop when a page repeats its cursor', async () => {
      const client = new Client({ ...defaultSuiParams })
      let calls = 0
      const internals = client as unknown as {
        requireGrpc(): {
          listCoins(): Promise<{
            objects: { objectId: string; version: string; digest: string }[]
            hasNextPage: boolean
            cursor: string
          }>
        }
        getCoins(owner: string, type: string): Promise<{ objectId: string }[]>
      }
      internals.requireGrpc = () => ({
        listCoins: async () => {
          calls += 1
          return {
            objects: [coin('0x21')],
            hasNextPage: true,
            cursor: 'same',
          }
        },
      })

      const coins = await internals.getCoins(owner, coinType)

      expect(calls).toBe(2)
      expect(coins).toHaveLength(2)
    })

    it('Should stop once the largest coins cover the target', async () => {
      const client = new Client({ ...defaultSuiParams, transport: 'jsonRpc' })
      let calls = 0
      const internals = client as unknown as {
        getJsonRpcClient(): Promise<{
          getCoins(): Promise<{
            data: { coinObjectId: string; version: string; digest: string; balance: string }[]
            hasNextPage: boolean
            nextCursor: string | null
          }>
        }>
        getCoins(
          owner: string,
          type: string,
          options?: { maxCoins?: number; targetBalance?: bigint },
        ): Promise<{ objectId: string }[]>
      }
      internals.getJsonRpcClient = async () => ({
        getCoins: async () => {
          calls += 1
          return {
            data: [
              { coinObjectId: '0x01', version: '1', digest: 'd1', balance: '5' },
              { coinObjectId: '0x02', version: '1', digest: 'd2', balance: '40' },
              { coinObjectId: '0x03', version: '1', digest: 'd3', balance: '30' },
            ],
            hasNextPage: true,
            nextCursor: 'next',
          }
        },
      })

      const selected = await internals.getCoins(owner, coinType, { maxCoins: 256, targetBalance: 50n })

      expect(calls).toBe(1)
      expect(selected.map((c) => c.objectId)).toEqual(['0x02', '0x03'])
    })

    it('Should keep a later large coin and stay within the cap', async () => {
      const client = new Client({ ...defaultSuiParams })
      const pages = [
        {
          objects: [coin('0x01'), coin('0x02'), coin('0x03')].map((c) => ({ ...c, balance: '1' })),
          hasNextPage: true,
          cursor: 'page-2',
        },
        {
          objects: [{ ...coin('0x99'), balance: '100' }],
          hasNextPage: true,
          cursor: 'page-3',
        },
      ]
      let calls = 0
      const internals = client as unknown as {
        requireGrpc(): {
          listCoins(): Promise<(typeof pages)[number]>
        }
        getCoins(
          owner: string,
          type: string,
          options?: { maxCoins?: number; targetBalance?: bigint },
        ): Promise<{ objectId: string }[]>
      }
      internals.requireGrpc = () => ({
        listCoins: async () => {
          const page = pages[calls] ?? pages[pages.length - 1]
          calls += 1
          return page
        },
      })

      const selected = await internals.getCoins(owner, coinType, { maxCoins: 2, targetBalance: 50n })

      expect(calls).toBe(2)
      expect(selected.map((c) => c.objectId)).toEqual(['0x99'])
    })
  })

  describe('Gas budget', () => {
    const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    const recipient = '0xdfd6914c9e8f2d2485eb34ce3a4997d15352cd9e2fca6425717815259aeb2459'
    const coin = {
      objectId: '0x7d20dcdb2bca4f508ea9613994683eb4e76e9c4ed371169677c1be02aaf0b58e',
      version: '1',
      digest: '3Tsu2vJq1MbGZkPGSMBrcpBuNJ8qJcGh7ZJbHfY5mEV6',
      balance: 100_000_000_000n,
    }

    function clientWithGasPrice(gasPrice: bigint) {
      const client = new Client({ ...defaultSuiParams, phrase, transport: 'jsonRpc' })
      const internals = client as unknown as {
        getReferenceGasPrice(): Promise<bigint>
        getCoins(): Promise<(typeof coin)[]>
      }
      internals.getReferenceGasPrice = async () => gasPrice
      internals.getCoins = async () => [coin]
      return client
    }

    async function budgetOf(rawUnsignedTx: string): Promise<string> {
      const tx = Transaction.from(Uint8Array.from(Buffer.from(rawUnsignedTx, 'hex')))
      return String(tx.getData().gasData.budget)
    }

    it('Should reserve the flat budget when that is more than gasPrice * 2000', async () => {
      const client = clientWithGasPrice(BigInt(1000))
      const fees = await client.getFees()

      expect(fees[FeeOption.Average].amount().toFixed(0)).toBe('10000000')
      expect(fees[FeeOption.Fast].amount().toFixed(0)).toBe('10000000')
      expect(fees[FeeOption.Fastest].amount().toFixed(0)).toBe('10000000')

      const prepared = await client.prepareTx({
        walletIndex: 0,
        recipient,
        amount: baseAmount(1, 9),
      })
      await expect(budgetOf(prepared.rawUnsignedTx)).resolves.toBe('10000000')
    })

    it('Should reserve gasPrice * 2000 when that exceeds the flat budget', async () => {
      const client = clientWithGasPrice(BigInt(6000))
      const fees = await client.getFees()

      expect(fees[FeeOption.Average].amount().toFixed(0)).toBe('12000000')
      const prepared = await client.prepareTx({
        walletIndex: 0,
        recipient,
        amount: baseAmount(1, 9),
      })
      await expect(budgetOf(prepared.rawUnsignedTx)).resolves.toBe('12000000')
    })

    it('Should keep an explicit gas budget', async () => {
      const client = clientWithGasPrice(BigInt(1000))
      const prepared = await client.prepareTx({
        walletIndex: 0,
        recipient,
        amount: baseAmount(1, 9),
        gasBudget: baseAmount(4_000_000, 9),
      })
      await expect(budgetOf(prepared.rawUnsignedTx)).resolves.toBe('4000000')
    })

    it('Should refuse a send the selected SUI coins cannot cover', async () => {
      const client = new Client({ ...defaultSuiParams, phrase, transport: 'jsonRpc' })
      const internals = client as unknown as {
        getReferenceGasPrice(): Promise<bigint>
        getCoins(): Promise<(typeof coin)[]>
      }
      internals.getReferenceGasPrice = async () => 1000n
      internals.getCoins = async () => [{ ...coin, balance: 1n }]

      await expect(
        client.prepareTx({
          walletIndex: 0,
          recipient,
          amount: baseAmount(1_000_000_000, 9),
        }),
      ).rejects.toThrow('Insufficient SUI for the amount and gas budget')
    })
  })

  describe('gRPC history decimals', () => {
    const usdc = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

    it('Should keep each coin decimals when GraphQL history falls back to gRPC', async () => {
      const client = new Client({ ...defaultSuiParams })
      const lookedUp: string[] = []
      const internals = client as unknown as {
        getTransactionDataFromGraphql(): Promise<never>
        getCoinDecimals(coinType: string): Promise<number>
        requireGrpc(): {
          getTransaction(): Promise<{
            Transaction: {
              digest: string
              timestampMs: string
              balanceChanges: { coinType: string; address: string; amount: string }[]
            }
          }>
        }
      }
      internals.getTransactionDataFromGraphql = async () => {
        throw Error('graphql down')
      }
      internals.getCoinDecimals = async (coinType) => {
        lookedUp.push(coinType)
        return coinType === usdc ? 6 : 9
      }
      internals.requireGrpc = () => ({
        getTransaction: async () => ({
          Transaction: {
            digest: 'digest',
            timestampMs: '1700000000000',
            balanceChanges: [
              { coinType: '0x2::sui::SUI', address: '0xsender', amount: '-1000000000' },
              { coinType: usdc, address: '0xsender', amount: '-1000000' },
              { coinType: usdc, address: '0xrecipient', amount: '1000000' },
            ],
          },
        }),
      })

      const tx = await client.getTransactionData('digest')

      expect(tx.from[0].amount.decimal).toBe(9)
      expect(tx.from[0].amount.amount().toFixed(0)).toBe('1000000000')
      expect(tx.from[1].amount.decimal).toBe(6)
      expect(tx.from[1].amount.amount().toFixed(0)).toBe('1000000')
      expect(tx.to[0].amount.decimal).toBe(6)
      expect(tx.to[0].amount.amount().toFixed(0)).toBe('1000000')
      expect(lookedUp.filter((coinType) => coinType === usdc)).toEqual([usdc])
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
        parseCoreTransaction(
          digest: string,
          balanceChanges: { coinType: string; address: string; amount: string }[],
          timestamp: string,
        ): Promise<{ from: { amount: { decimal: number } }[]; to: { amount: { decimal: number } }[] }>
        parseGraphqlTransactionNode(node: unknown): Promise<{
          from: { amount: { decimal: number } }[]
          to: { amount: { decimal: number } }[]
        }>
        parseJsonRpcTransaction(tx: unknown): Promise<{ from: { amount: { decimal: number } }[] }>
      }
      internals.getCoinDecimals = async (coinType) => (coinType === usdc ? undefined : 9)

      const coreTx = await internals.parseCoreTransaction(
        'd',
        [
          { coinType: usdc, address: '0xsender', amount: '-1000000' },
          { coinType: '0x2::sui::SUI', address: '0xrecipient', amount: '1000000000' },
        ],
        '1',
      )
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

      expect(coreTx.from).toEqual([])
      expect(coreTx.to[0].amount.decimal).toBe(9)
      expect(graphqlTx.from).toEqual([])
      expect(graphqlTx.to[0].amount.decimal).toBe(9)
      expect(jsonTx.from).toEqual([])
    })
  })
})
