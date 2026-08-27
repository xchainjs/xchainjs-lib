import { Network } from '@xchainjs/xchain-client'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'

import { Client, defaultXMRParams, TYPICAL_TX_WEIGHT } from '../src'

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
        expect(client.getExplorerUrl()).toBe('https://stagenet.xmrchain.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
          ),
        ).toBe(
          'https://stagenet.xmrchain.net/search?value=44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('abc123def456789012345678901234567890123456789012345678901234abcd')).toBe(
          'https://stagenet.xmrchain.net/tx/abc123def456789012345678901234567890123456789012345678901234abcd',
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
      expect(() => client.getAddress()).toThrow(/Phrase must be provided/)
      await expect(async () => client.getAddressAsync()).rejects.toThrow(/Phrase must be provided/)
    })

    it('Should derive the same address sync and async', async () => {
      const withPhrase = new Client({ ...defaultXMRParams, phrase: TEST_PHRASE })
      expect(withPhrase.getAddress()).toBe(await withPhrase.getAddressAsync())
    })

    it('Should setPhrase and return the derived address', () => {
      const c = new Client()
      const address = c.setPhrase(TEST_PHRASE)
      expect(address).toBe(c.getAddress())
      expect(address.startsWith('4')).toBe(true)
    })

    it('Should clear wallet state on purgeClient', async () => {
      const c = new Client({ ...defaultXMRParams, phrase: TEST_PHRASE })
      expect(c.getAddress()).toBeTruthy()
      c.purgeClient()
      expect(() => c.getAddress()).toThrow(/Phrase must be provided/)
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

    it('Should reject a same-length address with a bad checksum', () => {
      const valid = '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR'
      const tampered = valid.slice(0, -1) + (valid.endsWith('R') ? 'N' : 'R')
      expect(client.validateAddress(tampered)).toBe(false)
      expect(client.validateAddress(valid)).toBe(true)
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

    it('Should throw when no LWS or daemon configured', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.getBalance('someAddress')).rejects.toThrow('No daemon URLs configured')
    })

    it('Should return balance from wallet RPC without falling back to daemon scan', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: ['https://daemon.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        restoreHeight: 3626700,
      })

      const address = await client.getAddressAsync()
      let created = false

      mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        const rawBody = typeof init?.body === 'string' ? init.body : '{}'
        const body = JSON.parse(rawBody) as { method?: string }
        if (url.includes('daemon.test')) {
          return {
            ok: true,
            json: async () => ({ result: { count: 3626705, status: 'OK' } }),
          }
        }
        switch (body.method) {
          case 'get_version':
            return { ok: true, json: async () => ({ result: { version: 65536 } }) }
          case 'get_address':
            if (!created) {
              return {
                ok: true,
                json: async () => ({
                  error: { code: -13, message: 'No wallet file' },
                }),
              }
            }
            return { ok: true, json: async () => ({ result: { address } }) }
          case 'open_wallet':
            return {
              ok: true,
              json: async () => ({
                error: { code: -1, message: 'Failed to open wallet' },
              }),
            }
          case 'generate_from_keys':
            created = true
            return {
              ok: true,
              json: async () => ({ result: { address, info: 'Wallet has been generated successfully.' } }),
            }
          case 'refresh':
            return { ok: true, json: async () => ({ result: { blocks_fetched: 5, received_money: false } }) }
          case 'get_height':
            return { ok: true, json: async () => ({ result: { height: 3626705 } }) }
          case 'get_balance':
            return {
              ok: true,
              // total > unlocked: getBalance must return unlocked (spendable)
              json: async () => ({ result: { balance: 2000000000000, unlocked_balance: 1500000000000 } }),
            }
          default:
            return { ok: false, status: 500, statusText: `unexpected ${body.method}` }
        }
      })

      const balances = await client.getBalance(address)

      expect(balances).toHaveLength(1)
      expect(balances[0].amount.amount().toString()).toBe('1500000000000')
      const detail = await client.getWalletBalanceDetail(address)
      expect(detail.total.amount().toString()).toBe('2000000000000')
      expect(detail.unlocked.amount().toString()).toBe('1500000000000')
      const walletCalls = mockFetch.mock.calls.filter((call) => String(call[0]).includes('wallet.test'))
      expect(walletCalls.length).toBeGreaterThan(0)
    })

    it('Should reject foreign addresses on the wallet RPC balance path', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.getBalance('someAddress')).rejects.toThrow(
        /can only return the balance for the unlocked wallet address/,
      )
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Should throw wallet RPC error without daemon fallback when wallet RPC is configured', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      const address = await client.getAddressAsync()
      mockFetch.mockResolvedValue({ ok: false, status: 502, statusText: 'Bad Gateway' })

      await expect(client.getBalance(address)).rejects.toThrow(/Wallet RPC error: 502/)
    })

    it('Should reject foreign addresses on the wallet RPC history path', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.getTransactions({ address: 'someAddress' })).rejects.toThrow(
        /can only return history for the unlocked wallet address/,
      )
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Should return history from wallet RPC without falling back to daemon scan', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: ['https://daemon.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        restoreHeight: 3626700,
      })

      mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        const rawBody = typeof init?.body === 'string' ? init.body : '{}'
        const body = JSON.parse(rawBody) as { method?: string }
        if (url.includes('daemon.test')) {
          return {
            ok: true,
            json: async () => ({ result: { count: 3626705, status: 'OK' } }),
          }
        }
        switch (body.method) {
          case 'get_version':
            return { ok: true, json: async () => ({ result: { version: 65536 } }) }
          case 'get_address':
            return {
              ok: true,
              json: async () => ({
                result: {
                  address:
                    '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
                },
              }),
            }
          case 'refresh':
            return { ok: true, json: async () => ({ result: { blocks_fetched: 0, received_money: false } }) }
          case 'get_height':
            return { ok: true, json: async () => ({ result: { height: 3626705 } }) }
          case 'get_transfers':
            return {
              ok: true,
              json: async () => ({
                result: {
                  in: [
                    {
                      txid: 'in_old',
                      timestamp: 1700000000,
                      height: 3626701,
                      amount: 1000000000000,
                      fee: 0,
                      type: 'in',
                      address: '4in',
                    },
                    {
                      txid: 'in_new',
                      timestamp: 1700001000,
                      height: 3626704,
                      amount: 2000000000000,
                      fee: 0,
                      type: 'in',
                      address: '4in',
                    },
                  ],
                  out: [
                    {
                      txid: 'out_mid',
                      timestamp: 1700000500,
                      height: 3626703,
                      amount: 500000000000,
                      fee: 20000,
                      type: 'out',
                      address: '4out',
                      destinations: [{ address: '4dest', amount: 500000000000 }],
                    },
                  ],
                },
              }),
            }
          default:
            return { ok: false, status: 500, statusText: `unexpected ${body.method}` }
        }
      })

      const address = await client.getAddressAsync()
      const result = await client.getTransactions({ address, limit: 10 })

      expect(result.total).toBe(3)
      expect(result.txs).toHaveLength(3)
      expect(result.txs.map((tx) => tx.hash)).toEqual(['in_new', 'out_mid', 'in_old'])
      expect(result.txs[0].to[0]?.amount.amount().toString()).toBe('2000000000000')
      expect(result.txs[1].from[0]?.from).toBe(address)
      expect(result.txs[1].to[0]?.to).toBe('4dest')
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
              id: 1,
              hash: 'tx1',
              timestamp: '2024-01-10T10:00:00Z',
              total_received: '1000000000000',
              total_sent: '0',
              height: 100,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: false,
              mixin: 15,
            },
            {
              id: 2,
              hash: 'tx2',
              timestamp: '2024-01-11T10:00:00Z',
              total_received: '2000000000000',
              total_sent: '0',
              height: 200,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: false,
              mixin: 15,
            },
            {
              id: 3,
              hash: 'tx3',
              timestamp: '2024-01-12T10:00:00Z',
              total_received: '3000000000000',
              total_sent: '0',
              height: 300,
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
      const result = await client.getTransactions({ address, offset: 1, limit: 1 })

      expect(result.total).toBe(3)
      expect(result.txs).toHaveLength(1)
      // Sorted newest first: tx3(300), tx2(200), tx1(100). Offset 1 = tx2
      expect(result.txs[0].hash).toBe('tx2')
    })

    it('Should throw when no LWS or daemon configured', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.getTransactions()).rejects.toThrow('No daemon URLs configured')
    })
  })

  describe('Transfer (wallet RPC)', () => {
    const dest = '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H'

    beforeEach(() => {
      mockFetch.mockReset()
    })

    it('Should transfer via wallet RPC without LWS', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: ['https://daemon.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        restoreHeight: 3626700,
      })

      const ownAddress = await client.getAddressAsync()

      mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        const rawBody = typeof init?.body === 'string' ? init.body : '{}'
        const body = JSON.parse(rawBody) as { method?: string }
        if (url.includes('daemon.test')) {
          return { ok: true, json: async () => ({ result: { count: 3626705, status: 'OK' } }) }
        }
        switch (body.method) {
          case 'get_version':
            return { ok: true, json: async () => ({ result: { version: 65536 } }) }
          case 'get_address':
            return { ok: true, json: async () => ({ result: { address: ownAddress } }) }
          case 'refresh':
            return { ok: true, json: async () => ({ result: { blocks_fetched: 0, received_money: false } }) }
          case 'get_height':
            return { ok: true, json: async () => ({ result: { height: 3626705 } }) }
          case 'get_balance':
            return {
              ok: true,
              json: async () => ({ result: { balance: 5000000000000, unlocked_balance: 5000000000000 } }),
            }
          case 'transfer':
            return { ok: true, json: async () => ({ result: { tx_hash: 'ef12'.repeat(16) } }) }
          default:
            return { ok: false, status: 500, statusText: `unexpected ${body.method}` }
        }
      })

      const txHash = await client.transfer({ recipient: dest, amount: baseAmount(1000000000000, 12) })
      expect(txHash).toBe('ef12'.repeat(16))

      const transferCall = mockFetch.mock.calls.find((call) => {
        const raw = call[1]?.body
        return typeof raw === 'string' && raw.includes('"transfer"')
      })
      expect(transferCall).toBeDefined()
      const payload = JSON.parse(String(transferCall?.[1]?.body)) as {
        params: { destinations: { amount: number; address: string }[] }
      }
      expect(payload.params.destinations[0]).toEqual({ amount: 1000000000000, address: dest })
    })

    it('Should refuse transfer when amount exceeds unlocked balance', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        daemonUrls: { [Network.Mainnet]: ['https://daemon.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        restoreHeight: 3626700,
      })

      const ownAddress = await client.getAddressAsync()

      mockFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        const rawBody = typeof init?.body === 'string' ? init.body : '{}'
        const body = JSON.parse(rawBody) as { method?: string }
        if (url.includes('daemon.test')) {
          return { ok: true, json: async () => ({ result: { count: 3626705, status: 'OK' } }) }
        }
        switch (body.method) {
          case 'get_version':
            return { ok: true, json: async () => ({ result: { version: 65536 } }) }
          case 'get_address':
            return { ok: true, json: async () => ({ result: { address: ownAddress } }) }
          case 'refresh':
            return { ok: true, json: async () => ({ result: { blocks_fetched: 0, received_money: false } }) }
          case 'get_height':
            return { ok: true, json: async () => ({ result: { height: 3626705 } }) }
          case 'get_balance':
            return {
              ok: true,
              json: async () => ({ result: { balance: 5000000000000, unlocked_balance: 100000000000 } }),
            }
          default:
            return { ok: false, status: 500, statusText: `unexpected ${body.method}` }
        }
      })

      await expect(client.transfer({ recipient: dest, amount: baseAmount(1000000000000, 12) })).rejects.toThrow(
        /Insufficient unlocked balance/,
      )
    })

    it('Should reject an invalid recipient before calling wallet RPC', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.transfer({ recipient: 'not-an-address', amount: baseAmount(1, 12) })).rejects.toThrow(
        'Invalid Monero recipient address',
      )
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Should refuse transfer when wallet RPC is not configured, even if LWS is', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        walletRpcUrls: { [Network.Mainnet]: [], [Network.Testnet]: [], [Network.Stagenet]: [] },
        lwsUrls: { [Network.Mainnet]: ['https://lws.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      await expect(client.transfer({ recipient: dest, amount: baseAmount(1, 12) })).rejects.toThrow(
        /requires monero-wallet-rpc/,
      )
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Fees', () => {
    beforeEach(() => {
      mockFetch.mockReset()
    })

    it('Should scale daemon fee-per-byte by typical tx weight', async () => {
      const client = new Client({
        ...defaultXMRParams,
        phrase: TEST_PHRASE,
        daemonUrls: { [Network.Mainnet]: ['https://daemon.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { fee: 20, quantization_mask: 10000, status: 'OK' } }),
      })

      const fees = await client.getFees()
      expect(fees.average.amount().toString()).toBe((20 * TYPICAL_TX_WEIGHT).toString())
      expect(fees.fast.amount().toString()).toBe((20 * TYPICAL_TX_WEIGHT).toString())
    })
  })

  describe('Unsupported methods', () => {
    it('Should throw on transfer without wallet RPC', async () => {
      const client = new Client()
      await expect(
        client.transfer({
          recipient: '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
          amount: baseAmount(1, 12),
        }),
      ).rejects.toThrow(/requires monero-wallet-rpc/)
    })

    it('Should throw on transfer without phrase when wallet RPC is configured', async () => {
      const client = new Client({
        ...defaultXMRParams,
        walletRpcUrls: { [Network.Mainnet]: ['https://wallet.test'], [Network.Testnet]: [], [Network.Stagenet]: [] },
      })
      await expect(
        client.transfer({
          recipient: '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR',
          amount: baseAmount(1, 12),
        }),
      ).rejects.toThrow(/Phrase must be provided/)
    })

    it('Should throw on prepareTx', async () => {
      const client = new Client()
      await expect(client.prepareTx({ recipient: 'addr', amount: baseAmount(1, 12) })).rejects.toThrow(
        'prepareTx is not supported for Monero',
      )
    })
  })
})
