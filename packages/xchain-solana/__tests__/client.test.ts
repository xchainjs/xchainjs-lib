import { Network, TxType } from '@xchainjs/xchain-client'
import { AnyAsset, Asset, TokenAsset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'

import { Client, defaultSolanaParams } from '../src'

describe('Solana client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultSolanaParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  describe('Asset', () => {
    it('Should get native asset', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('SOL.SOL')
      expect(assetInfo.decimal).toBe(9)
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://explorer.solana.com/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT')).toBe(
          'https://explorer.solana.com/address/DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
          ),
        ).toBe(
          'https://explorer.solana.com/tx/qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
        )
      })
    })
    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultSolanaParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://explorer.solana.com/?cluster=testnet')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('AKYxN3oot9NTMq1W1eG1nHD4BaVnhR8rsYzDcqpkWSjD')).toBe(
          'https://explorer.solana.com/address/AKYxN3oot9NTMq1W1eG1nHD4BaVnhR8rsYzDcqpkWSjD?cluster=testnet',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'rAzjs4YRHHm6qSGe3EZzfwfW4WUpDx6RyK11iPL752Z1nAzGQCdxdCbSo6ZDKdwYZXuPojE1fwtirGjVvLLXPub',
          ),
        ).toBe(
          'https://explorer.solana.com/tx/rAzjs4YRHHm6qSGe3EZzfwfW4WUpDx6RyK11iPL752Z1nAzGQCdxdCbSo6ZDKdwYZXuPojE1fwtirGjVvLLXPub?cluster=testnet',
        )
      })
    })
    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultSolanaParams,
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://explorer.solana.com/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT')).toBe(
          'https://explorer.solana.com/address/DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT',
        )
      })
      it('Should get transaction url', () => {
        expect(
          client.getExplorerTxUrl(
            'qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
          ),
        ).toBe(
          'https://explorer.solana.com/tx/qnZzcK9tWBtgTbSirrCKZ59AYmZa6Dr9qQ6Ned1a4hxa171wevawknoyiBUz9cu3HssUw9W11JRVTFtwwJo3mxS',
        )
      })
    })
  })

  describe('Addresses', () => {
    it('Should not get address without phrase', () => {
      expect(async () => await client.getAddressAsync()).rejects.toThrowError('Phrase must be provided')
    })

    it('Should not get address sync method not be implemented', () => {
      expect(() => client.getAddress()).toThrow('Sync method not supported')
    })

    it('Should get full derivation path with account 0', () => {
      expect(client.getFullDerivationPath(0)).toBe(`m/44'/501'/0'`)
    })

    it('Should get full derivation path with account 1', () => {
      expect(client.getFullDerivationPath(1)).toBe(`m/44'/501'/1'`)
    })

    it('Should validate address as valid', () => {
      expect(client.validateAddress('G72oBA9cRYUzR8Q9oLvJcNRx5ovcDGFvHsbZKp1BT75W')).toBeTruthy()
    })

    it('Should validate address as invalid', () => {
      expect(client.validateAddress('fakeAddress')).toBeFalsy()
    })
  })

  describe('Balances', () => {
    it('Should get all balances', async () => {
      const balances = await client.getBalance('94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v')
      expect(balances.length).toBe(3)
      expect(assetToString(balances[0].asset)).toBe('SOL.SOL')
      expect(balances[0].amount.decimal).toBe(9)
      expect(balances[0].amount.amount().toString()).toBe('1000000000')
      expect(assetToString(balances[1].asset)).toBe('SOL.KYOTO-8zMTcsEFiB12NKrM5QXWL5pw1QMNJrAhH6Kh278YWFRY')
      expect(balances[1].amount.decimal).toBe(6)
      expect(balances[1].amount.amount().toString()).toBe('756181')
      expect(assetToString(balances[2].asset)).toBe('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
      expect(balances[2].amount.decimal).toBe(6)
      expect(balances[2].amount.amount().toString()).toBe('54587')
    })

    it('Should get balances filtering assets', async () => {
      const balances = await client.getBalance('94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v', [
        assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
      ])
      expect(balances.length).toBe(2)
      expect(assetToString(balances[0].asset)).toBe('SOL.SOL')
      expect(balances[0].amount.decimal).toBe(9)
      expect(balances[0].amount.amount().toString()).toBe('1000000000')
      expect(assetToString(balances[1].asset)).toBe('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
      expect(balances[1].amount.decimal).toBe(6)
      expect(balances[1].amount.amount().toString()).toBe('54587')
    })
  })

  describe('Transactions', () => {
    it('Should get native transaction', async () => {
      const tx = await client.getTransactionData('fakeNativeSignature')
      expect(tx.hash).toBe('fakeNativeSignature')
      expect(assetToString(tx.asset)).toBe('SOL.SOL')
      expect(tx.date.getTime()).toBe(1724933679000)
      expect(tx.type).toBe(TxType.Transfer)
      expect(tx.from.length).toBe(1)
      expect(tx.from[0].from).toBe('DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s')
      expect(tx.from[0].asset).toBeDefined()
      expect(assetToString(tx.from[0].asset as Asset)).toBe('SOL.SOL')
      expect(tx.from[0].amount.amount().toString()).toBe('5005000')
      expect(tx.from[0].amount.decimal).toBe(9)
      expect(tx.to.length).toBe(1)
      expect(tx.to[0].to).toBe('FH6wye9tmorZMXLisVx9ZpZXDKvcSgasJtJoCXizSn36')
      expect(tx.to[0].asset).toBeDefined()
      expect(assetToString(tx.to[0].asset as Asset)).toBe('SOL.SOL')
      expect(tx.to[0].amount.amount().toString()).toBe('5000000')
      expect(tx.to[0].amount.decimal).toBe(9)
    })

    it('Should get token transaction', async () => {
      const tx = await client.getTransactionData('fakeTokenSignature')
      expect(tx.hash).toBe('fakeTokenSignature')
      expect(assetToString(tx.asset)).toBe('SOL.SOL')
      expect(tx.date.getTime()).toBe(1724758709000)
      expect(tx.type).toBe(TxType.Transfer)
      expect(tx.from.length).toBe(2)
      expect(tx.from[0].from).toBe('AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy')
      expect(tx.from[0].asset).toBeDefined()
      expect(assetToString(tx.from[0].asset as AnyAsset)).toBe('SOL.SOL')
      expect(tx.from[0].amount.amount().toString()).toBe('2054280')
      expect(tx.from[0].amount.decimal).toBe(9)
      expect(tx.from[1].from).toBe('AaZkwhkiDStDcgrU37XAj9fpNLrD8Erz5PNkdm4k5hjy')
      expect(tx.from[1].asset).toBeDefined()
      expect(assetToString(tx.from[1].asset as AnyAsset)).toBe('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
      expect(tx.from[1].amount.amount().toString()).toBe('25009340')
      expect(tx.from[1].amount.decimal).toBe(6)
      expect(tx.to.length).toBe(2)
      expect(tx.to[0].to).toBe('BfJjcYwnm8JmYg1AxquTHqtc35DJFt3swfQKEGbGj3CU')
      expect(tx.to[0].asset).toBeDefined()
      expect(assetToString(tx.to[0].asset as AnyAsset)).toBe('SOL.SOL')
      expect(tx.to[0].amount.amount().toString()).toBe('2039280')
      expect(tx.to[0].amount.decimal).toBe(9)
      expect(tx.to[1].to).toBe('DTHVAEEC6cJyHsmYYmCQvX2eEtgoXSeyGoRhLZvcf62s')
      expect(tx.to[1].asset).toBeDefined()
      expect(assetToString(tx.to[1].asset as AnyAsset)).toBe('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
      expect(tx.to[1].amount.amount().toString()).toBe('25009340')
      expect(tx.to[1].amount.decimal).toBe(6)
    })
  })
})
