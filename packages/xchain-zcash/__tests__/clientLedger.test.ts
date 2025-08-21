import { ClientLedger, defaultZECParams } from '../src'

// Mock transport for testing
const mockTransport = {
  exchange: jest.fn(),
  setExchangeTimeout: jest.fn(),
  close: jest.fn(),
}

describe('Zcash Ledger Client', () => {
  let client: ClientLedger

  beforeEach(() => {
    client = new ClientLedger({
      ...defaultZECParams,
      transport: mockTransport,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create a ClientLedger instance', () => {
      expect(client).toBeInstanceOf(ClientLedger)
    })

    it('should throw error for sync getAddress method', () => {
      expect(() => client.getAddress()).toThrow('Sync method not supported for Ledger')
    })
  })

  describe('Address Operations', () => {
    it('should have getApp method', async () => {
      expect(client.getApp).toBeDefined()
      expect(typeof client.getApp).toBe('function')
    })

    it('should have getAddressAsync method', async () => {
      expect(client.getAddressAsync).toBeDefined()
      expect(typeof client.getAddressAsync).toBe('function')
    })
  })

  describe('Transaction Operations', () => {
    it('should have transfer method', () => {
      expect(client.transfer).toBeDefined()
      expect(typeof client.transfer).toBe('function')
    })

    it('should throw error when transport is not properly configured', async () => {
      const mockAmount = {
        amount: () => ({ toNumber: () => 1000000 }),
      }

      const transferParams = {
        recipient: 't1d4ZFodUN3sJz1zL6SfKSV6kmkwYm8N5s9',
        amount: mockAmount,
        memo: 'test',
      }

      // Since we're using a mock transport, it should fail at the transport level
      await expect(client.transfer(transferParams as Parameters<typeof client.transfer>[0])).rejects.toThrow(
        'this.transport.send is not a function',
      )
    })
  })

  describe('Network and Asset Info', () => {
    it('should inherit getAssetInfo from base client', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetInfo).toBeDefined()
      expect(assetInfo.asset).toBeDefined()
      expect(assetInfo.decimal).toBeDefined()
    })

    it('should inherit validateAddress from base client', () => {
      // Test with a valid Zcash testnet address format
      const isValid = client.validateAddress('t1d4ZFodUN3sJz1zL6SfKSV6kmkwYm8N5s9')
      expect(typeof isValid).toBe('boolean')
    })
  })

  describe('Fee Operations', () => {
    it('should inherit fee methods from base client', async () => {
      expect(client.getFees).toBeDefined()
      expect(typeof client.getFees).toBe('function')
    })

    it('should throw error for fee rates (Zcash uses flat fees)', async () => {
      await expect(client.getFeeRates()).rejects.toThrow('Error Zcash has flat fee. Fee rates not supported')
    })

    it('should throw error for fees with rates', async () => {
      await expect(client.getFeesWithRates()).rejects.toThrow('Error Zcash has flat fee. Fee rates not supported')
    })
  })
})
