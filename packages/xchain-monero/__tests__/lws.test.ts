import * as lws from '../src/lws'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('LWS Client', () => {
  const url = 'https://api.mymonero.com'
  const address = '44jKQv6ZKMd5ecLLmkNJGi7azgSptEq8ki7TFiat1TfLfdDQ1tQ7ZYa3cRh7X2uRwvLDjddWh97ajeyhR2seKSECQeDx1WR'
  const viewKey = 'aabbccdd'.repeat(8) // 64-char hex

  describe('login', () => {
    it('Should send correct POST body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ new_address: true, generated_locally: false, start_height: 0 }),
      })

      const result = await lws.login(url, address, viewKey)

      expect(mockFetch).toHaveBeenCalledWith(`${url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          view_key: viewKey,
          create_account: true,
          generated_locally: false,
        }),
      })
      expect(result.new_address).toBe(true)
    })

    it('Should throw on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
      await expect(lws.login(url, address, viewKey)).rejects.toThrow('LWS error: 500')
    })
  })

  describe('getAddressInfo', () => {
    it('Should parse balance correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locked_funds: '0',
          total_received: '5000000000000',
          total_sent: '2000000000000',
          scanned_height: 3000000,
          scanned_block_height: 3000000,
          start_height: 0,
          transaction_height: 0,
          blockchain_height: 3000001,
          spent_outputs: [],
        }),
      })

      const result = await lws.getAddressInfo(url, address, viewKey)

      expect(result.total_received).toBe('5000000000000')
      expect(result.total_sent).toBe('2000000000000')
      expect(result.scanned_height).toBe(3000000)
    })
  })

  describe('getAddressTxs', () => {
    it('Should parse transaction list', async () => {
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
              hash: 'abc123',
              timestamp: '2024-01-15T10:30:00Z',
              total_received: '3000000000000',
              total_sent: '0',
              height: 2999998,
              spent_outputs: [],
              payment_id: '',
              coinbase: false,
              mempool: false,
              mixin: 15,
            },
            {
              id: 2,
              hash: 'def456',
              timestamp: '2024-01-16T12:00:00Z',
              total_received: '2000000000000',
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

      const result = await lws.getAddressTxs(url, address, viewKey)

      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].hash).toBe('abc123')
      expect(result.transactions[1].hash).toBe('def456')
      expect(result.transactions[0].total_received).toBe('3000000000000')
    })
  })

  describe('getUnspentOuts', () => {
    it('Should parse unspent outputs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          amount: '3000000000000',
          outputs: [
            {
              amount: '3000000000000',
              public_key: 'aa'.repeat(32),
              index: 0,
              global_index: 12345,
              tx_id: 1,
              tx_hash: 'abc123',
              tx_prefix_hash: 'abc123',
              tx_pub_key: 'bb'.repeat(32),
              timestamp: '2024-01-15T10:30:00Z',
              height: 2999998,
              rct: 'cc'.repeat(64),
            },
          ],
          per_byte_fee: 7700,
          fee_mask: 10000,
          fork_version: 16,
        }),
      })

      const result = await lws.getUnspentOuts(url, address, viewKey)

      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].amount).toBe('3000000000000')
      expect(result.per_byte_fee).toBe(7700)
    })
  })
})
