import { Network } from '@xchainjs/xchain-client'
import { ClientKeystore } from '../src/clientKeystore'
import { defaultXRPParams } from '../src/client'
import { AssetXRP, XRPChain } from '../src/const'

describe('XRP Client', () => {
  let client: ClientKeystore

  beforeEach(() => {
    client = new ClientKeystore({
      ...defaultXRPParams,
      phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    })
  })

  describe('Constructor & Network', () => {
    it('should initialize with default parameters', () => {
      const defaultClient = new ClientKeystore()
      expect(defaultClient.getNetwork()).toBe(Network.Mainnet)
    })

    it('should initialize with testnet', () => {
      const testnetClient = new ClientKeystore({
        ...defaultXRPParams,
        network: Network.Testnet,
      })
      expect(testnetClient.getNetwork()).toBe(Network.Testnet)
    })

    it('should change network', () => {
      client.setNetwork(Network.Testnet)
      expect(client.getNetwork()).toBe(Network.Testnet)
    })
  })

  describe('Chain and Asset', () => {
    it('should return correct native asset', () => {
      const assetInfo = client.getAssetInfo()
      expect(assetInfo.asset).toEqual(AssetXRP)
      expect(assetInfo.decimal).toBe(6)
    })
  })

  describe('Address Generation', () => {
    it('should generate valid address from phrase', () => {
      const address = client.getAddress(0)
      expect(address).toBeTruthy()
      expect(typeof address).toBe('string')
      expect(address.length).toBeGreaterThan(20)
    })

    it('should generate different addresses for different indices', () => {
      const address0 = client.getAddress(0)
      const address1 = client.getAddress(1)
      expect(address0).not.toBe(address1)
    })

    it('should validate XRP addresses correctly', () => {
      const validAddress = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      const invalidAddress = 'invalid_address'
      
      expect(client.validateAddress(validAddress)).toBe(true)
      expect(client.validateAddress(invalidAddress)).toBe(false)
    })
  })

  describe('Explorer URLs', () => {
    it('should get transaction explorer URL', () => {
      const txHash = '1234567890ABCDEF'
      const url = client.getExplorerTxUrl(txHash)
      expect(url).toContain(txHash)
      expect(url).toContain('livenet.xrpl.org')
    })

    it('should get address explorer URL', () => {
      const address = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      const url = client.getExplorerAddressUrl(address)
      expect(url).toContain(address)
      expect(url).toContain('livenet.xrpl.org')
    })

    it('should use testnet explorer for testnet', () => {
      client.setNetwork(Network.Testnet)
      const txHash = '1234567890ABCDEF'
      const url = client.getExplorerTxUrl(txHash)
      expect(url).toContain('testnet.xrpl.org')
    })
  })

  describe('Fee Estimation', () => {
    it('should throw error for fee rates (not supported)', async () => {
      await expect(client.getFeeRates()).rejects.toThrow('Ripple has flat fee. Fee rates not supported')
    })

    it('should estimate fees', async () => {
      const fees = await client.getFees()
      expect(fees).toBeDefined()
      expect(fees.fast).toBeDefined()
      expect(fees.fastest).toBeDefined()
      expect(fees.average).toBeDefined()
    })
  })
})