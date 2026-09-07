import { FeeType, Network } from '@xchainjs/xchain-client'
import { AssetType, TokenAsset, assetFromStringEx, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { Account } from 'near-api-js'

import {
  Client,
  FT_TRANSFER_DEPOSIT,
  FT_TRANSFER_GAS,
  NEARAsset,
  NEAR_DECIMALS,
  defaultNearParams,
  getDefaultClientUrls,
  getDefaultNearblocksUrl,
  isImplicitAccount,
  publicKeyToImplicitAccount,
  resolveClientUrls,
  resolveNearblocksUrl,
  validateNearAddress,
} from '../src'

const PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

/** Known implicit account for abandon…about at m/44'/397'/0' */
const ABANDON_IMPLICIT = '5510e2b44cae6eb807e3e0e45d579dda058c274abcba15e5cb84636f5d1ee412'

const WRAP_NEAR = assetFromStringEx('NEAR.wNEAR-wrap.near') as TokenAsset
const CIRCLE_USDC = assetFromStringEx(
  'NEAR.USDC-17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
) as TokenAsset

const mockNativeProvider = (amount: bigint = 0n) => ({
  viewAccount: jest.fn().mockResolvedValue({
    amount,
    locked: 0n,
    code_hash: '',
    storage_usage: 0,
    block_hash: '',
    block_height: 0,
  }),
  callFunction: jest.fn(),
})

describe('NEAR client', () => {
  describe('Asset', () => {
    it('Should get native asset', () => {
      const client = new Client()
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('NEAR.NEAR')
      expect(assetInfo.decimal).toBe(NEAR_DECIMALS)
      expect(assetInfo.decimal).toBe(24)
      expect(assetInfo.asset).toEqual(NEARAsset)
    })
  })

  describe('Defaults', () => {
    it('Should resolve public RPC and NearBlocks URLs', () => {
      expect(defaultNearParams.clientUrls).toBeUndefined()
      expect(getDefaultClientUrls(Network.Mainnet)[0]).toContain('fastnear.com')
      expect(getDefaultNearblocksUrl(Network.Mainnet)).toBe('https://api.nearblocks.io')
      expect(getDefaultNearblocksUrl(Network.Testnet)).toBe('https://api-testnet.nearblocks.io')
      expect(resolveClientUrls(Network.Mainnet)).toEqual(getDefaultClientUrls(Network.Mainnet))
      expect(resolveNearblocksUrl(Network.Testnet)).toBe(getDefaultNearblocksUrl(Network.Testnet))
    })

    it('Should honor consumer clientUrls', () => {
      const custom = ['https://my-near-rpc.example']
      expect(
        resolveClientUrls(Network.Mainnet, {
          clientUrls: {
            [Network.Mainnet]: custom,
            [Network.Testnet]: custom,
            [Network.Stagenet]: custom,
          },
        }),
      ).toEqual(custom)
    })
  })

  describe('Explorers', () => {
    it('Should return NearBlocks explorer URLs', () => {
      const client = new Client()
      expect(client.getExplorerUrl()).toBe('https://nearblocks.io')
      expect(client.getExplorerAddressUrl('alice.near')).toBe('https://nearblocks.io/address/alice.near')
      expect(client.getExplorerTxUrl('abc123')).toBe('https://nearblocks.io/txns/abc123')
    })

    it('Should use testnet explorers', () => {
      const client = new Client({ ...defaultNearParams, network: Network.Testnet })
      expect(client.getExplorerUrl()).toBe('https://testnet.nearblocks.io')
    })
  })

  describe('Address', () => {
    it('Should throw on sync getAddress', () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      expect(() => client.getAddress()).toThrow('Sync method not supported')
    })

    it('Should derive an implicit account from the phrase', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      expect(client.getFullDerivationPath(0)).toBe("m/44'/397'/0'")
      const address = await client.getAddressAsync(0)
      expect(isImplicitAccount(address)).toBe(true)
      expect(address).toBe(ABANDON_IMPLICIT)
    })

    it('Should map ed25519 public keys to implicit accounts', () => {
      const raw = Buffer.from(ABANDON_IMPLICIT, 'hex')
      expect(publicKeyToImplicitAccount(raw)).toBe(ABANDON_IMPLICIT)
      const slip10Style = Buffer.concat([Buffer.from([0]), raw])
      expect(publicKeyToImplicitAccount(slip10Style)).toBe(ABANDON_IMPLICIT)
    })

    it('Should reject getAddressAsync without phrase', async () => {
      const client = new Client()
      await expect(client.getAddressAsync()).rejects.toThrow('Phrase must be provided')
    })

    it('Should validate implicit and named accounts', () => {
      const client = new Client()
      const implicit = 'a'.repeat(64)
      expect(client.validateAddress(implicit)).toBe(true)
      expect(validateNearAddress('alice.near')).toBe(true)
      expect(validateNearAddress('bob.testnet')).toBe(true)
      expect(validateNearAddress('a')).toBe(false)
      expect(validateNearAddress('Alice.near')).toBe(false)
      expect(validateNearAddress('')).toBe(false)
      expect(validateNearAddress('not valid!')).toBe(false)
    })
  })

  describe('Balance / fees (mocked provider)', () => {
    it('Should return native balance from viewAccount', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const amount = BigInt('1000000000000000000000000') // 1 NEAR
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = {
        viewAccount: jest.fn().mockResolvedValue({
          amount,
          locked: 0n,
          code_hash: '',
          storage_usage: 0,
          block_hash: '',
          block_height: 0,
        }),
      }

      const balances = await client.getBalance('alice.near')
      expect(balances).toHaveLength(1)
      expect(assetToString(balances[0].asset)).toBe('NEAR.NEAR')
      expect(balances[0].amount.amount().toFixed(0)).toBe(amount.toString())
    })

    it('Should return zero balance when account does not exist', async () => {
      const client = new Client()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = {
        viewAccount: jest.fn().mockRejectedValue(new Error('Account does not exist')),
      }
      const balances = await client.getBalance('missing.near')
      expect(balances[0].amount.amount().toNumber()).toBe(0)
    })

    it('Should estimate flat transfer fees from gas price', async () => {
      const client = new Client()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = {
        viewGasPrice: jest.fn().mockResolvedValue({ gas_price: '100000000' }),
      }
      const fees = await client.getFees()
      expect(fees.type).toBe(FeeType.FlatFee)
      expect(fees.average.eq(fees.fast)).toBe(true)
      expect(fees.average.amount().gt(baseAmount(0, NEAR_DECIMALS).amount())).toBe(true)
    })
  })

  describe('Transfer guards', () => {
    it('Should reject memo on native transfers', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      await expect(
        client.transfer({
          recipient: 'alice.near',
          amount: baseAmount(1, NEAR_DECIMALS),
          memo: 'hi',
        }),
      ).rejects.toThrow('Memo is not supported')
    })

    it('Should reject invalid recipient', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      await expect(
        client.transfer({
          recipient: 'NOT VALID',
          amount: baseAmount(1, NEAR_DECIMALS),
        }),
      ).rejects.toThrow('Invalid recipient address')
    })

    it('Should reject non-NEAR token assets', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const ethUsdc = {
        chain: 'ETH',
        ticker: 'USDC',
        symbol: 'USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        type: AssetType.TOKEN,
      } as TokenAsset
      await expect(
        client.transfer({
          recipient: 'alice.near',
          amount: baseAmount(1, 6),
          asset: ethUsdc,
        }),
      ).rejects.toThrow('Asset chain must be NEAR')
    })
  })

  describe('NEP-141 balances (mocked)', () => {
    it('Should return native only when assets omitted', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const amount = BigInt('1000000000000000000000000')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = mockNativeProvider(amount)

      const balances = await client.getBalance('alice.near')
      expect(balances).toHaveLength(1)
      expect(assetToString(balances[0].asset)).toBe('NEAR.NEAR')
    })

    it('Should append wrap.near and USDC FT balances', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const provider = mockNativeProvider(BigInt('5000000000000000000000000'))
      provider.callFunction.mockImplementation(
        async ({ method, contractId }: { method: string; contractId: string }) => {
          if (method === 'ft_metadata') {
            if (contractId === 'wrap.near') {
              return { name: 'Wrapped NEAR', symbol: 'wNEAR', decimals: 24 }
            }
            return { name: 'USDC', symbol: 'USDC', decimals: 6 }
          }
          if (method === 'ft_balance_of') {
            if (contractId === 'wrap.near') return '1000000000000000000000000'
            return '2500000'
          }
          throw new Error(`unexpected method ${method}`)
        },
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = provider

      const balances = await client.getBalance('alice.near', [WRAP_NEAR, CIRCLE_USDC])
      expect(balances).toHaveLength(3)
      expect(assetToString(balances[0].asset)).toBe('NEAR.NEAR')
      expect(assetToString(balances[1].asset)).toBe(assetToString(WRAP_NEAR))
      expect(balances[1].amount.decimal).toBe(24)
      expect(balances[1].amount.amount().toFixed(0)).toBe('1000000000000000000000000')
      expect(assetToString(balances[2].asset)).toBe(assetToString(CIRCLE_USDC))
      expect(balances[2].amount.decimal).toBe(6)
      expect(balances[2].amount.amount().toFixed(0)).toBe('2500000')
    })

    it('Should return zero FT balance when unregistered / empty', async () => {
      const client = new Client()
      const provider = mockNativeProvider(0n)
      provider.callFunction.mockImplementation(async ({ method }: { method: string }) => {
        if (method === 'ft_metadata') return { name: 'USDC', symbol: 'USDC', decimals: 6 }
        if (method === 'ft_balance_of') return '0'
        throw new Error(`unexpected method ${method}`)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = provider

      const balances = await client.getBalance('missing.near', [CIRCLE_USDC])
      expect(balances).toHaveLength(2)
      expect(balances[1].amount.amount().toFixed(0)).toBe('0')
    })
  })

  describe('NEP-141 transfer / prepareTx (mocked)', () => {
    beforeEach(() => {
      Account.transfer.mockReset()
      Account.callFunction.mockReset()
      Account.createTransaction.mockReset()
      Account.createSignedTransaction.mockReset()
    })

    it('Should ft_transfer and auto storage_deposit when receiver unregistered', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const provider = mockNativeProvider()
      provider.callFunction.mockImplementation(async ({ method }: { method: string }) => {
        if (method === 'ft_metadata') return { name: 'USDC', symbol: 'USDC', decimals: 6 }
        if (method === 'storage_balance_of') return null
        if (method === 'storage_balance_bounds') return { min: '1250000000000000000000', max: null }
        throw new Error(`unexpected method ${method}`)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = provider

      Account.callFunction
        .mockResolvedValueOnce({ transaction: { hash: 'storage-hash' } }) // registerAccount
        .mockResolvedValueOnce({ transaction: { hash: 'ft-hash' } }) // ft_transfer

      const hash = await client.transfer({
        recipient: 'bob.near',
        amount: baseAmount(1_000_000, 6),
        asset: CIRCLE_USDC,
        memo: 'pay bob',
      })

      expect(hash).toBe('ft-hash')
      expect(Account.callFunction).toHaveBeenCalledTimes(2)
      expect(Account.callFunction).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          contractId: '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
          methodName: 'storage_deposit',
        }),
      )
      expect(Account.callFunction).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          contractId: '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
          methodName: 'ft_transfer',
          args: {
            amount: '1000000',
            receiver_id: 'bob.near',
            memo: 'pay bob',
          },
          gas: FT_TRANSFER_GAS,
          deposit: FT_TRANSFER_DEPOSIT,
        }),
      )
    })

    it('Should skip storage_deposit when receiver already registered', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const provider = mockNativeProvider()
      provider.callFunction.mockImplementation(async ({ method }: { method: string }) => {
        if (method === 'ft_metadata') return { name: 'wNEAR', symbol: 'wNEAR', decimals: 24 }
        if (method === 'storage_balance_of') return { total: '1250000000000000000000', available: '0' }
        if (method === 'storage_balance_bounds') return { min: '1250000000000000000000', max: null }
        throw new Error(`unexpected method ${method}`)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = provider

      Account.callFunction.mockResolvedValue({ transaction: { hash: 'wrap-ft-hash' } })

      const hash = await client.transfer({
        recipient: 'alice.near',
        amount: baseAmount('1000000000000000000000000', 24),
        asset: WRAP_NEAR,
      })

      expect(hash).toBe('wrap-ft-hash')
      expect(Account.callFunction).toHaveBeenCalledTimes(1)
      expect(Account.callFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          methodName: 'ft_transfer',
          args: {
            amount: '1000000000000000000000000',
            receiver_id: 'alice.near',
          },
        }),
      )
    })

    it('Should prepare FT tx with storage_deposit + ft_transfer actions', async () => {
      const client = new Client({ ...defaultNearParams, phrase: PHRASE })
      const provider = mockNativeProvider()
      provider.callFunction.mockImplementation(async ({ method }: { method: string }) => {
        if (method === 'ft_metadata') return { name: 'USDC', symbol: 'USDC', decimals: 6 }
        if (method === 'storage_balance_of') return null
        if (method === 'storage_balance_bounds') return { min: '1250000000000000000000', max: null }
        throw new Error(`unexpected method ${method}`)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).provider = provider

      Account.createTransaction.mockResolvedValue({
        encode: () => Buffer.from('unsigned-ft-tx'),
      })

      const prepared = await client.prepareTx({
        recipient: 'bob.near',
        amount: baseAmount(5, 6),
        asset: CIRCLE_USDC,
        memo: 'note',
      })

      expect(prepared.rawUnsignedTx).toBe(Buffer.from('unsigned-ft-tx').toString('base64'))
      expect(Account.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          receiverId: '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
          actions: [
            expect.objectContaining({
              functionCall: expect.objectContaining({
                methodName: 'storage_deposit',
                args: { account_id: 'bob.near', registration_only: true },
                deposit: BigInt('1250000000000000000000'),
              }),
            }),
            expect.objectContaining({
              functionCall: expect.objectContaining({
                methodName: 'ft_transfer',
                args: { amount: '5', receiver_id: 'bob.near', memo: 'note' },
                deposit: FT_TRANSFER_DEPOSIT,
                gas: FT_TRANSFER_GAS,
              }),
            }),
          ],
        }),
      )
    })
  })
})
