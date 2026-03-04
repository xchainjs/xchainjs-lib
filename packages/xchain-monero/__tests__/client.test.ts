import { Network } from '@xchainjs/xchain-client'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'

import { Client, defaultXMRParams } from '../src'

describe('Monero client', () => {
  describe('Asset', () => {
    let client: Client

    beforeAll(() => {
      client = new Client()
    })

    it('Should get native asset', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetToString(assetInfo.asset)).toBe('XMR.XMR')
      expect(assetInfo.decimal).toBe(12)
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client()
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://xmrchain.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
          ),
        ).toBe(
          'https://xmrchain.net/search?value=44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('abc123def456789012345678901234567890123456789012345678901234abcd')).toBe(
          'https://xmrchain.net/tx/abc123def456789012345678901234567890123456789012345678901234abcd',
        )
      })
    })

    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultXMRParams,
          network: Network.Testnet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://stagenet.xmrchain.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            '55AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
          ),
        ).toBe(
          'https://stagenet.xmrchain.net/search?value=55AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('abc123def456789012345678901234567890123456789012345678901234abcd')).toBe(
          'https://stagenet.xmrchain.net/tx/abc123def456789012345678901234567890123456789012345678901234abcd',
        )
      })
    })

    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          ...defaultXMRParams,
          network: Network.Stagenet,
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://xmrchain.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
          ),
        ).toBe(
          'https://xmrchain.net/search?value=44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('abc123def456789012345678901234567890123456789012345678901234abcd')).toBe(
          'https://xmrchain.net/tx/abc123def456789012345678901234567890123456789012345678901234abcd',
        )
      })
    })
  })

  describe('Addresses', () => {
    let client: Client
    beforeAll(() => {
      client = new Client()
    })

    it('Should not get address without phrase', async () => {
      await expect(async () => client.getAddressAsync()).rejects.toThrow(/Phrase must be provided/)
    })

    it('Should not get address sync method not be implemented', () => {
      expect(() => client.getAddress()).toThrow('Sync method not supported')
    })

    it('Should get full derivation path with account 0', () => {
      expect(client.getFullDerivationPath(0)).toBe(`m/44'/128'/0'`)
    })

    it('Should get full derivation path with account 1', () => {
      expect(client.getFullDerivationPath(1)).toBe(`m/44'/128'/1'`)
    })

    it('Should validate standard mainnet address as valid', () => {
      expect(
        client.validateAddress(
          '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
        ),
      ).toBeTruthy()
    })

    it('Should validate subaddress as valid', () => {
      expect(
        client.validateAddress(
          '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H',
        ),
      ).toBeTruthy()
    })

    it('Should validate integrated address as valid', () => {
      expect(
        client.validateAddress(
          '4LL9oSLmtpccfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRj5UzqtReoS44qo9mtmXCqY45DJ852K5Jv2bYXZKKQePHES9khPK',
        ),
      ).toBeTruthy()
    })

    it('Should validate address as invalid - wrong length', () => {
      expect(client.validateAddress('fakeAddress')).toBeFalsy()
    })

    it('Should validate address as invalid - wrong prefix', () => {
      expect(
        client.validateAddress(
          '14AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
        ),
      ).toBeFalsy()
    })

    it('Should validate address as invalid - invalid characters', () => {
      expect(
        client.validateAddress(
          '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQ0EP3A',
        ),
      ).toBeFalsy()
    })

    it('Should get address with phrase', async () => {
      const clientWithPhrase = new Client({
        ...defaultXMRParams,
        phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      })
      const address = await clientWithPhrase.getAddressAsync()
      expect(address).toBe(
        '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
      )
    })
  })

  describe('Balances', () => {
    it('Should get balance', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      })
      const balances = await client.getBalance(
        '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
      )
      expect(balances.length).toBe(1)
      expect(assetToString(balances[0].asset)).toBe('XMR.XMR')
      expect(balances[0].amount.decimal).toBe(12)
      expect(balances[0].amount.amount().toString()).toBe('5000000000000')
    })
  })

  describe('Transactions', () => {
    it('Should get transaction data', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      })
      const tx = await client.getTransactionData('fakeTxHash')
      expect(tx.hash).toBe('fakeTxHash')
      expect(assetToString(tx.asset)).toBe('XMR.XMR')
      expect(tx.type).toBe('transfer')
    })
  })

  describe('Fees', () => {
    it('Should get fees', async () => {
      const client = new Client()
      const fees = await client.getFees()
      expect(fees.average.amount().toString()).toBe('20000000')
      expect(fees.fast.amount().toString()).toBe('20000000')
      expect(fees.fastest.amount().toString()).toBe('20000000')
    })
  })

  describe('Unsupported', () => {
    it('Should throw on prepareTx', async () => {
      const client = new Client()
      await expect(client.prepareTx({ recipient: 'addr', amount: baseAmount(1, 12) })).rejects.toThrow(
        'prepareTx is not supported for Monero',
      )
    })
  })
})
