import { Network } from '@xchainjs/xchain-client'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'

import { Client, defaultXMRParams } from '../src'

// Mock fetch globally for LWS tests
const mockFetch = jest.fn()
global.fetch = mockFetch

const TEST_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('Monero client (pure JS)', () => {
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
            '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
          ),
        ).toBe(
          'https://xmrchain.net/search?value=44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
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
            '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
          ),
        ).toBe(
          'https://xmrchain.net/search?value=44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
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
          '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
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
        phrase: TEST_PHRASE,
      })
      const address = await clientWithPhrase.getAddressAsync()
      expect(address).toBe(
        '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
      )
    })
  })

  describe('Balance (LWS)', () => {
    beforeEach(() => {
      mockFetch.mockReset()
    })

    it('Should return correct balance from LWS', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: ['https://lws.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      // login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ new_address: true, generated_locally: false, start_height: 0 }),
      })
      // getAddressInfo
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locked_funds: '0',
          total_received: '10000000000000',
          total_sent: '3000000000000',
          scanned_height: 3000000,
          scanned_block_height: 3000000,
          start_height: 0,
          transaction_height: 0,
          blockchain_height: 3000001,
          spent_outputs: [],
        }),
      })

      const address = await client.getAddressAsync()
      const balances = await client.getBalance(address)

      expect(balances).toHaveLength(1)
      expect(balances[0].asset.chain).toBe('XMR')
      // 10 - 3 = 7 XMR in piconero
      expect(balances[0].amount.amount().toString()).toBe('7000000000000')
    })

    it('Should throw when no LWS configured', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.getBalance('someAddress')).rejects.toThrow('No LWS URLs configured')
    })

    it('Should try next LWS URL on failure', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: {
          [Network.Mainnet]: ['https://lws1.test', 'https://lws2.test'],
          [Network.Testnet]: [],
          [Network.Stagenet]: [],
        },
      })

      // First URL fails
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })
      // Second URL succeeds: login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ new_address: true, generated_locally: false, start_height: 0 }),
      })
      // Second URL succeeds: getAddressInfo
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locked_funds: '0',
          total_received: '1000000000000',
          total_sent: '0',
          scanned_height: 100,
          scanned_block_height: 100,
          start_height: 0,
          transaction_height: 0,
          blockchain_height: 101,
          spent_outputs: [],
        }),
      })

      const address = await client.getAddressAsync()
      const balances = await client.getBalance(address)
      expect(balances[0].amount.amount().toString()).toBe('1000000000000')
    })
  })

  describe('Transactions (LWS)', () => {
    beforeEach(() => {
      mockFetch.mockReset()
    })

    it('Should return paginated, sorted history', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: ['https://lws.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      // login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ new_address: true, generated_locally: false, start_height: 0 }),
      })
      // getAddressTxs
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_received: '5000000000000',
          scanned_height: 3000000,
          scanned_block_height: 3000000,
          start_height: 0,
          blockchain_height: 3000001,
          transactions: [
            {
              id: 1,
              hash: 'older_tx',
              timestamp: '2024-01-10T10:00:00Z',
              total_received: '2000000000000',
              total_sent: '0',
              height: 2999990,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: false,
              mixin: 15,
            },
            {
              id: 2,
              hash: 'newer_tx',
              timestamp: '2024-01-15T10:00:00Z',
              total_received: '3000000000000',
              total_sent: '0',
              height: 2999999,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: false,
              mixin: 15,
            },
          ],
        }),
      })

      const address = await client.getAddressAsync()
      const result = await client.getTransactions({ address, limit: 10 })

      expect(result.total).toBe(2)
      expect(result.txs).toHaveLength(2)
      // Newest first
      expect(result.txs[0].hash).toBe('newer_tx')
      expect(result.txs[1].hash).toBe('older_tx')
    })

    it('Should filter mempool transactions', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: ['https://lws.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      // login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ new_address: true, generated_locally: false, start_height: 0 }),
      })
      // getAddressTxs
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_received: '5000000000000',
          scanned_height: 3000000,
          scanned_block_height: 3000000,
          start_height: 0,
          blockchain_height: 3000001,
          transactions: [
            {
              id: 1,
              hash: 'confirmed_tx',
              timestamp: '2024-01-10T10:00:00Z',
              total_received: '2000000000000',
              total_sent: '0',
              height: 2999990,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: false,
              mixin: 15,
            },
            {
              id: 2,
              hash: 'mempool_tx',
              timestamp: '2024-01-15T10:00:00Z',
              total_received: '3000000000000',
              total_sent: '0',
              height: 0,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: true,
              mixin: 15,
            },
          ],
        }),
      })

      const address = await client.getAddressAsync()
      const result = await client.getTransactions({ address, limit: 10 })

      expect(result.total).toBe(1)
      expect(result.txs).toHaveLength(1)
      expect(result.txs[0].hash).toBe('confirmed_tx')
    })

    it('Should apply offset and limit pagination', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: ['https://lws.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      // login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ new_address: true, generated_locally: false, start_height: 0 }),
      })
      // getAddressTxs - 3 txs
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_received: '6000000000000',
          scanned_height: 3000000,
          scanned_block_height: 3000000,
          start_height: 0,
          blockchain_height: 3000001,
          transactions: [
            {
              id: 1, hash: 'tx1', timestamp: '2024-01-10T10:00:00Z',
              total_received: '1000000000000', total_sent: '0',
              height: 100, spent_outputs: [], payment_id: '', coinbase: false, mempool: false, mixin: 15,
            },
            {
              id: 2, hash: 'tx2', timestamp: '2024-01-11T10:00:00Z',
              total_received: '2000000000000', total_sent: '0',
              height: 200, spent_outputs: [], payment_id: '', coinbase: false, mempool: false, mixin: 15,
            },
            {
              id: 3, hash: 'tx3', timestamp: '2024-01-12T10:00:00Z',
              total_received: '3000000000000', total_sent: '0',
              height: 300, spent_outputs: [], payment_id: '', coinbase: false, mempool: false, mixin: 15,
            },
          ],
        }),
      })

      const address = await client.getAddressAsync()
      const result = await client.getTransactions({ address, offset: 1, limit: 1 })

      expect(result.total).toBe(3)
      expect(result.txs).toHaveLength(1)
      // Sorted newest first: tx3(300), tx2(200), tx1(100). Offset 1 = tx2
      expect(result.txs[0].hash).toBe('tx2')
    })

    it('Should throw when no LWS configured', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.getTransactions()).rejects.toThrow('No LWS URLs configured')
    })
  })

  describe('Unsupported methods', () => {
    it('Should throw on transfer without phrase', async () => {
      const client = new Client()
      await expect(client.transfer({ recipient: 'addr', amount: baseAmount(1, 12) })).rejects.toThrow()
    })

    it('Should throw on prepareTx', async () => {
      const client = new Client()
      await expect(client.prepareTx({ recipient: 'addr', amount: baseAmount(1, 12) })).rejects.toThrow(
        'prepareTx is not supported for Monero',
      )
    })
  })
})
