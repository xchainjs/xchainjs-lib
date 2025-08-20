import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import { ClientKeystore } from '../src/clientKeystore'
import { defaultXRPParams } from '../src/client'
import { AssetXRP } from '../src/const'

describe('XRP Client Integration Tests', () => {
  let client: ClientKeystore

  beforeEach(() => {
    client = new ClientKeystore({
      ...defaultXRPParams,
      network: Network.Testnet,
      phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    })
  })

  afterEach(async () => {
    // Clean up any open connections
    if (client) {
      try {
        const xrplClient = await (client as any).getXrplClient()
        if (xrplClient && xrplClient.isConnected()) {
          await xrplClient.disconnect()
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  describe('Transaction Preparation', () => {
    it('should prepare a basic payment transaction', async () => {
      const sender = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      const recipient = 'rDsbeomae3nMbSzKKXJkqnJNhTWfXBAw'
      const amount = baseAmount('1000000', 6) // 1 XRP

      const payment = await client.prepareTxForXrpl({
        sender,
        recipient,
        amount,
        asset: AssetXRP,
      })

      expect(payment.TransactionType).toBe('Payment')
      expect(payment.Account).toBe(sender)
      expect(payment.Destination).toBe(recipient)
      expect(payment.Amount).toBe('1000000')
    })

    it('should prepare a payment transaction with memo', async () => {
      const sender = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      const recipient = 'rDsbeomae3nMbSzKKXJkqnJNhTWfXBAw'
      const amount = baseAmount('2000000', 6) // 2 XRP
      const memo = 'Test memo'

      const payment = await client.prepareTxForXrpl({
        sender,
        recipient,
        amount,
        asset: AssetXRP,
        memo,
      })

      expect(payment.TransactionType).toBe('Payment')
      expect(payment.Account).toBe(sender)
      expect(payment.Destination).toBe(recipient)
      expect(payment.Amount).toBe('2000000')
      expect(payment.Memos).toBeDefined()
      expect(payment.Memos![0].Memo.MemoData).toBe(Buffer.from(memo, 'utf8').toString('hex'))
    })

    it('should not include memo when memo is empty', async () => {
      const sender = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      const recipient = 'rDsbeomae3nMbSzKKXJkqnJNhTWfXBAw'
      const amount = baseAmount('1000000', 6)

      const payment = await client.prepareTxForXrpl({
        sender,
        recipient,
        amount,
        asset: AssetXRP,
        memo: '',
      })

      expect(payment.Memos).toBeUndefined()
    })

    it('should not include memo when memo is whitespace only', async () => {
      const sender = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      const recipient = 'rDsbeomae3nMbSzKKXJkqnJNhTWfXBAw'
      const amount = baseAmount('1000000', 6)

      const payment = await client.prepareTxForXrpl({
        sender,
        recipient,
        amount,
        asset: AssetXRP,
        memo: '   ',
      })

      expect(payment.Memos).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should throw error for unsupported asset', async () => {
      const unsupportedAsset = {
        chain: 'ETH' as const,
        symbol: 'ETH',
        ticker: 'ETH',
        synth: false,
        type: 0,
      }

      await expect(
        client.transfer({
          recipient: 'rDsbeomae3nMbSzKKXJkqnJNhTWfXBAw',
          amount: baseAmount('1000000', 6),
          asset: unsupportedAsset,
        })
      ).rejects.toThrow('Asset not supported')
    })
  })

  describe('Mock Network Operations', () => {
    it('should handle network configuration correctly', () => {
      expect(client.getNetwork()).toBe(Network.Testnet)
      
      client.setNetwork(Network.Mainnet)
      expect(client.getNetwork()).toBe(Network.Mainnet)
      
      client.setNetwork(Network.Stagenet)
      expect(client.getNetwork()).toBe(Network.Stagenet)
    })

    it('should generate consistent addresses', () => {
      const address1 = client.getAddress(0)
      const address2 = client.getAddress(0)
      expect(address1).toBe(address2)
    })
  })
})