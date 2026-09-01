import { FeeType, Network } from '@xchainjs/xchain-client'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'

import {
  Client,
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
    it('Should reject memo', async () => {
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
  })
})
