# UTXO Expert Development Agent

## Overview

This guide provides expert-level insights for developing with XChainJS's UTXO (Unspent Transaction Output) ecosystem. XChainJS offers comprehensive support for UTXO-based blockchains with standardized interfaces, transaction building, and multi-provider data access patterns.

## UTXO Architecture in XChainJS

### Supported UTXO Chains

XChainJS supports multiple UTXO-based cryptocurrencies:

- **Bitcoin** (`xchain-bitcoin`) - P2WPKH (Bech32) and P2TR (Taproot) support
- **Litecoin** (`xchain-litecoin`) - Native SegWit implementation
- **Bitcoin Cash** (`xchain-bitcoincash`) - BCH with CashAddr format
- **Dogecoin** (`xchain-doge`) - DOGE with legacy P2PKH/P2SH addresses
- **Dash** (`xchain-dash`) - DASH with standard UTXO transactions
- **Zcash** (`xchain-zcash`) - ZEC with transparent addresses

### Core UTXO Packages

#### `xchain-utxo` - Core UTXO Framework
The foundation package providing shared UTXO functionality:

```typescript
import { 
  Client,
  UTXO,
  UtxoClientParams,
  PreparedTx,
  Witness,
  toBitcoinJS 
} from '@xchainjs/xchain-utxo'
```

#### `xchain-utxo-providers` - Data Providers
Multiple data providers for UTXO blockchain interaction:
- **HaskoinProvider**: Haskoin API integration
- **SochainProvider**: Sochain API with API key support
- **BlockcypherProvider**: BlockCypher API integration
- **BitgoProvider**: BitGo enterprise API
- **NownodesProvider**: Nownodes infrastructure

## UTXO Client Architecture

### Base Client Structure

All UTXO clients extend the base `UTXOClient`:

```typescript
import { Client as UTXOClient } from '@xchainjs/xchain-utxo'

export abstract class BitcoinClient extends UTXOClient {
  protected addressFormat: AddressFormat

  constructor(params: UtxoClientParams & { addressFormat?: AddressFormat }) {
    super(BTCChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.addressFormat = params.addressFormat || AddressFormat.P2WPKH
  }
}
```

### Client Configuration

#### Basic Bitcoin Configuration
```typescript
import { ClientKeystore as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { HaskoinProvider, SochainProvider } from '@xchainjs/xchain-utxo-providers'

const client = new BitcoinClient({
  network: Network.Mainnet,
  phrase: 'your twelve word mnemonic phrase here',
  addressFormat: AddressFormat.P2WPKH, // or AddressFormat.P2TR for Taproot
  dataProviders: [
    new HaskoinProvider(
      'https://api.haskoin.com/',
      'BTC',
      AssetBTC,
      8,
      HaskoinNetwork.BTC
    ),
    new SochainProvider(
      'https://sochain.com/api/v3',
      'your-api-key',
      'BTC',
      AssetBTC,
      8,
      SochainNetwork.BTC
    )
  ],
  explorerProviders: blockstreamExplorerProviders,
  feeBounds: { lower: 1, upper: 500 }
})
```

#### Advanced Multi-Provider Configuration
```typescript
const client = new BitcoinClient({
  network: Network.Mainnet,
  phrase: process.env.MNEMONIC_PHRASE,
  rootDerivationPaths: {
    mainnet: "m/84'/0'/0'/0/",  // Native SegWit
    stagenet: "m/84'/0'/0'/0/",
    testnet: "m/84'/1'/0'/0/"
  },
  dataProviders: [
    new HaskoinProvider(/* config */),
    new SochainProvider(/* config with API key */),
    new BlockcypherProvider(/* config */),
    new BitgoProvider(/* enterprise config */)
  ],
  feeBounds: { 
    lower: 1,      // 1 sat/byte minimum
    upper: 1000    // 1000 sat/byte maximum
  }
})
```

#### Taproot (P2TR) Configuration
```typescript
const taprootClient = new BitcoinClient({
  network: Network.Mainnet,
  addressFormat: AddressFormat.P2TR,
  rootDerivationPaths: {
    mainnet: "m/86'/0'/0'/0/",  // BIP86 Taproot derivation
    stagenet: "m/86'/0'/0'/0/",
    testnet: "m/86'/1'/0'/0/"
  },
  // ... other params
})
```

## UTXO-Specific Operations

### Address Generation and Validation

#### Address Generation by Format
```typescript
import { AddressFormat } from '@xchainjs/xchain-bitcoin'
import { validateAddress, btcNetwork, getPrefix } from '@xchainjs/xchain-bitcoin/utils'

// Generate P2WPKH address (Native SegWit)
const p2wpkhClient = new BitcoinClient({ 
  addressFormat: AddressFormat.P2WPKH 
})
const segwitAddress = await p2wpkhClient.getAddressAsync(0)
console.log(segwitAddress) // bc1q... format

// Generate P2TR address (Taproot)
const taprootClient = new BitcoinClient({ 
  addressFormat: AddressFormat.P2TR,
  rootDerivationPaths: {
    mainnet: "m/86'/0'/0'/0/"
  }
})
const taprootAddress = await taprootClient.getAddressAsync(0)
console.log(taprootAddress) // bc1p... format

// Validate addresses
const isValidSegwit = validateAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', Network.Mainnet)
const isValidTaproot = validateAddress('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', Network.Mainnet)
```

### UTXO Management

#### UTXO Scanning and Selection
```typescript
import { UTXO } from '@xchainjs/xchain-utxo'

class UTXOManager {
  constructor(private client: BitcoinClient) {}

  // Get all UTXOs for an address
  async getUTXOs(address: string, confirmedOnly: boolean = true): Promise<UTXO[]> {
    return await this.client.scanUTXOs(address, confirmedOnly)
  }

  // Get UTXOs with minimum confirmations
  async getConfirmedUTXOs(
    address: string, 
    minConfirmations: number = 6
  ): Promise<UTXO[]> {
    const allUTXOs = await this.getUTXOs(address, false)
    const currentBlock = await this.getCurrentBlockHeight()
    
    return allUTXOs.filter(utxo => {
      if (!utxo.height) return false // Unconfirmed
      return (currentBlock - utxo.height + 1) >= minConfirmations
    })
  }

  // Select optimal UTXOs for a transaction
  selectUTXOs(
    availableUTXOs: UTXO[], 
    targetAmount: number, 
    feeRate: number
  ): { inputs: UTXO[]; fee: number; change: number } {
    // Implementation using first-party UtxoSelector with multi-strategy approach
    const { UtxoSelector } = require('@xchainjs/xchain-utxo')
    const selector = new UtxoSelector()
    
    try {
      const result = selector.selectOptimal(availableUTXOs, targetAmount, feeRate)
      return { 
        inputs: result.inputs, 
        fee: result.fee, 
        change: result.changeAmount 
      }
    } catch (error) {
      // Handle selection failure
      throw new Error(`UTXO selection failed: ${error.message}`)
    }
  }

  private async getCurrentBlockHeight(): Promise<number> {
    // Implementation to get current block height from provider
    return 800000 // placeholder
  }
}
```

### Transaction Building

#### Manual Transaction Construction
```typescript
import * as Bitcoin from 'bitcoinjs-lib'
import { PreparedTx } from '@xchainjs/xchain-utxo'

class TransactionBuilder {
  constructor(
    private client: BitcoinClient,
    private network: Bitcoin.Network
  ) {}

  async buildTransaction(params: {
    fromAddress: string
    toAddress: string
    amount: number
    feeRate: number
    memo?: string
    walletIndex?: number
  }): Promise<PreparedTx> {
    const { fromAddress, toAddress, amount, feeRate, memo, walletIndex = 0 } = params

    // 1. Get UTXOs
    const utxos = await this.client.scanUTXOs(fromAddress, true)
    
    // 2. Select UTXOs
    const utxoManager = new UTXOManager(this.client)
    const { inputs, fee, change } = utxoManager.selectUTXOs(utxos, amount, feeRate)
    
    // 3. Build PSBT
    const psbt = new Bitcoin.Psbt({ network: this.network })
    
    // Add inputs
    for (const utxo of inputs) {
      if (utxo.witnessUtxo) {
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          witnessUtxo: utxo.witnessUtxo
        })
      } else if (utxo.txHex) {
        // Use full transaction hex when witnessUtxo is not available
        psbt.addInput({
          hash: utxo.hash,
          index: utxo.index,
          nonWitnessUtxo: Buffer.from(utxo.txHex, 'hex')
        })
      }
    }
    
    // Add output for recipient
    psbt.addOutput({
      address: toAddress,
      value: amount
    })
    
    // Add change output if needed
    if (change > 546) { // Dust threshold
      const changeAddress = await this.client.getAddressAsync(walletIndex)
      psbt.addOutput({
        address: changeAddress,
        value: change
      })
    }
    
    // Add OP_RETURN memo if provided
    if (memo) {
      const memoBuffer = this.client.compileMemo(memo)
      psbt.addOutput({
        script: Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, memoBuffer]),
        value: 0
      })
    }
    
    return {
      rawUnsignedTx: psbt.toBase64()
    }
  }

  async signAndBroadcast(rawUnsignedTx: string, walletIndex: number = 0): Promise<string> {
    // This would be implemented in the specific client
    // For example, in Bitcoin client:
    return await this.client.broadcastTx(rawUnsignedTx)
  }
}
```

#### High-Level Transaction Operations
```typescript
// Simple transfer
const txHash = await client.transfer({
  asset: AssetBTC,
  amount: baseAmount('50000000', 8), // 0.5 BTC
  recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  memo: 'Payment for services',
  feeRate: 10 // 10 sat/byte
})

// Prepare transaction without broadcasting
const preparedTx = await client.prepareTx({
  asset: AssetBTC,
  amount: baseAmount('10000000', 8), // 0.1 BTC
  recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  feeRate: 15
})

// Broadcast later
const txHash = await client.broadcastTx(preparedTx.rawUnsignedTx)
```

## Advanced UTXO Patterns

### Multi-Provider Round-Robin

```typescript
class MultiProviderUTXOClient {
  private providers: UtxoOnlineDataProviders[]
  private currentProviderIndex: number = 0

  constructor(providers: UtxoOnlineDataProviders[]) {
    this.providers = providers
  }

  async getBalanceWithFailover(address: string): Promise<Balance[]> {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.getNextProvider()
      
      try {
        return await provider.getBalance(address)
      } catch (error) {
        console.warn(`Provider failed: ${provider.constructor.name}`, error)
        
        if (i === this.providers.length - 1) {
          throw new Error('All providers failed')
        }
      }
    }
    
    throw new Error('No providers available')
  }

  async getUTXOsWithFailover(address: string): Promise<UTXO[]> {
    for (const provider of this.providers) {
      try {
        if ('getUnspentTxs' in provider) {
          return await provider.getUnspentTxs(address)
        }
      } catch (error) {
        console.warn(`UTXO provider failed: ${provider.constructor.name}`, error)
      }
    }
    
    throw new Error('No UTXO providers available')
  }

  private getNextProvider(): UtxoOnlineDataProviders {
    const provider = this.providers[this.currentProviderIndex]
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length
    return provider
  }
}
```

### Fee Optimization Strategies

```typescript
class UTXOFeeOptimizer {
  constructor(private client: BitcoinClient) {}

  async getOptimalFeeRate(): Promise<{ 
    conservative: number
    economic: number 
    priority: number 
  }> {
    try {
      const feeRates = await this.client.getFeeRates()
      
      return {
        conservative: Math.max(feeRates.average, 5), // At least 5 sat/byte
        economic: Math.max(feeRates.average * 0.8, 3), // 20% below average, min 3
        priority: Math.min(feeRates.fastest, 200) // Cap at 200 sat/byte
      }
    } catch (error) {
      // Fallback fee rates
      return {
        conservative: 10,
        economic: 5,
        priority: 20
      }
    }
  }

  estimateTransactionSize(
    inputCount: number,
    outputCount: number,
    addressFormat: AddressFormat = AddressFormat.P2WPKH
  ): number {
    const TX_EMPTY_SIZE = 4 + 1 + 1 + 4
    const TX_OUTPUT_BASE = 8 + 1
    const TX_OUTPUT_PUBKEYHASH = 25
    
    let inputSize: number
    
    switch (addressFormat) {
      case AddressFormat.P2WPKH:
        inputSize = 32 + 4 + 1 + 4 + (107 / 4) // SegWit discount
        break
      case AddressFormat.P2TR:
        inputSize = 32 + 4 + 1 + 4 + (64 / 4) // Taproot witness discount
        break
      default:
        inputSize = 32 + 4 + 1 + 4 + 107
    }
    
    const outputSize = TX_OUTPUT_BASE + TX_OUTPUT_PUBKEYHASH
    
    return Math.ceil(TX_EMPTY_SIZE + (inputCount * inputSize) + (outputCount * outputSize))
  }

  calculateOptimalChange(
    totalInput: number,
    amount: number,
    feeRate: number,
    estimatedSize: number
  ): { fee: number; change: number; shouldConsolidate: boolean } {
    const baseFee = Math.ceil(estimatedSize * feeRate)
    const change = totalInput - amount - baseFee
    
    const DUST_THRESHOLD = 546
    const CONSOLIDATION_THRESHOLD = 10000 // 0.0001 BTC
    
    if (change < DUST_THRESHOLD) {
      // No change output, add to fee
      return {
        fee: baseFee + change,
        change: 0,
        shouldConsolidate: false
      }
    }
    
    if (change < CONSOLIDATION_THRESHOLD) {
      // Small change, consider consolidation
      return {
        fee: baseFee,
        change,
        shouldConsolidate: true
      }
    }
    
    return {
      fee: baseFee,
      change,
      shouldConsolidate: false
    }
  }
}
```

### UTXO Consolidation

```typescript
class UTXOConsolidator {
  constructor(private client: BitcoinClient) {}

  async needsConsolidation(address: string): Promise<boolean> {
    const utxos = await this.client.scanUTXOs(address, true)
    
    // Consider consolidation if:
    // 1. More than 20 UTXOs
    // 2. Many small UTXOs (< 0.001 BTC each)
    // 3. Total UTXO management cost is high
    
    const CONSOLIDATION_THRESHOLD = 20
    const SMALL_UTXO_THRESHOLD = 100000 // 0.001 BTC in satoshis
    
    if (utxos.length > CONSOLIDATION_THRESHOLD) return true
    
    const smallUTXOs = utxos.filter(utxo => utxo.value < SMALL_UTXO_THRESHOLD)
    if (smallUTXOs.length > CONSOLIDATION_THRESHOLD / 2) return true
    
    return false
  }

  async consolidateUTXOs(
    address: string,
    targetAddress?: string,
    maxUTXOs: number = 50
  ): Promise<string> {
    const utxos = await this.client.scanUTXOs(address, true)
    const destination = targetAddress || address
    
    // Sort UTXOs by value (smallest first for consolidation)
    const sortedUTXOs = utxos
      .sort((a, b) => a.value - b.value)
      .slice(0, maxUTXOs)
    
    const totalValue = sortedUTXOs.reduce((sum, utxo) => sum + utxo.value, 0)
    
    // Estimate fee for consolidation transaction
    const estimatedSize = this.estimateConsolidationSize(sortedUTXOs.length, 1)
    const feeRates = await this.client.getFeeRates()
    const fee = Math.ceil(estimatedSize * feeRates.average)
    
    if (totalValue <= fee) {
      throw new Error('UTXOs value too small to cover consolidation fee')
    }
    
    const consolidatedAmount = totalValue - fee
    
    return await this.client.transfer({
      asset: this.client.getAssetInfo().asset,
      amount: baseAmount(consolidatedAmount, 8),
      recipient: destination,
      memo: 'UTXO consolidation',
      feeRate: feeRates.average
    })
  }

  private estimateConsolidationSize(inputCount: number, outputCount: number): number {
    // Simplified size calculation for consolidation
    const TX_OVERHEAD = 10
    const INPUT_SIZE = 148 // P2WPKH input size
    const OUTPUT_SIZE = 34  // P2WPKH output size
    
    return TX_OVERHEAD + (inputCount * INPUT_SIZE) + (outputCount * OUTPUT_SIZE)
  }
}
```

### Multi-Chain UTXO Portfolio Management

```typescript
class UTXOPortfolioManager {
  private clients: Map<string, any> = new Map()

  constructor() {
    this.initializeClients()
  }

  private initializeClients() {
    this.clients.set('BTC', new BitcoinClient({ network: Network.Mainnet }))
    this.clients.set('LTC', new LitecoinClient({ network: Network.Mainnet }))
    this.clients.set('BCH', new BitcoinCashClient({ network: Network.Mainnet }))
    this.clients.set('DOGE', new DogecoinClient({ network: Network.Mainnet }))
    this.clients.set('DASH', new DashClient({ network: Network.Mainnet }))
  }

  async getPortfolioBalances(addresses: { [chain: string]: string }): Promise<{
    [chain: string]: { balance: number; usd: number; utxoCount: number }
  }> {
    const portfolio: any = {}
    
    for (const [chain, client] of this.clients) {
      const address = addresses[chain]
      if (!address) continue
      
      try {
        const balances = await client.getBalance(address)
        const utxos = await client.scanUTXOs(address, true)
        
        const balance = balances[0]?.amount.amount().toNumber() || 0
        const usdPrice = await this.getUSDPrice(chain)
        const decimals = client.getAssetInfo().decimal
        
        portfolio[chain] = {
          balance: balance / Math.pow(10, decimals),
          usd: (balance / Math.pow(10, decimals)) * usdPrice,
          utxoCount: utxos.length
        }
      } catch (error) {
        console.error(`Error fetching ${chain} data:`, error)
        portfolio[chain] = { balance: 0, usd: 0, utxoCount: 0 }
      }
    }
    
    return portfolio
  }

  async optimizePortfolio(addresses: { [chain: string]: string }): Promise<{
    consolidationNeeded: string[]
    totalValue: number
    recommendations: string[]
  }> {
    const portfolio = await this.getPortfolioBalances(addresses)
    const consolidationNeeded: string[] = []
    const recommendations: string[] = []
    let totalValue = 0
    
    for (const [chain, data] of Object.entries(portfolio)) {
      totalValue += data.usd
      
      if (data.utxoCount > 20) {
        consolidationNeeded.push(chain)
        recommendations.push(`Consolidate ${data.utxoCount} UTXOs in ${chain}`)
      }
      
      if (data.usd > 0 && data.usd < 10 && data.utxoCount > 5) {
        recommendations.push(`Consider consolidating small ${chain} balance ($${data.usd.toFixed(2)})`)
      }
    }
    
    return { consolidationNeeded, totalValue, recommendations }
  }

  private async getUSDPrice(chain: string): Promise<number> {
    // Mock implementation - integrate with price API
    const prices: { [key: string]: number } = {
      'BTC': 45000,
      'LTC': 150,
      'BCH': 300,
      'DOGE': 0.08,
      'DASH': 100
    }
    return prices[chain] || 0
  }
}
```

## Data Provider Integration

### Custom Provider Implementation

```typescript
import { UtxoOnlineDataProvider, UTXO, Balance, Tx, TxsPage } from '@xchainjs/xchain-utxo-providers'

class CustomUTXOProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private apiKey: string
  private chain: Chain
  private asset: Asset

  constructor(baseUrl: string, apiKey: string, chain: Chain, asset: Asset) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.chain = chain
    this.asset = asset
  }

  async getBalance(address: string, confirmedOnly?: boolean): Promise<Balance[]> {
    const response = await fetch(
      `${this.baseUrl}/address/${address}/balance?confirmed=${confirmedOnly}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    )
    
    const data = await response.json()
    
    return [{
      asset: this.asset,
      amount: baseAmount(data.balance, this.getAssetDecimals())
    }]
  }

  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const response = await fetch(
      `${this.baseUrl}/address/${address}/utxos`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    )
    
    const utxos = await response.json()
    
    return utxos.map((utxo: any) => ({
      hash: utxo.txid,
      index: utxo.vout,
      value: utxo.value,
      height: utxo.height,
      witnessUtxo: utxo.witnessUtxo ? {
        script: Buffer.from(utxo.witnessUtxo.script, 'hex'),
        value: utxo.witnessUtxo.value
      } : undefined
    }))
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const { address, offset = 0, limit = 10 } = params || {}
    
    const response = await fetch(
      `${this.baseUrl}/address/${address}/transactions?offset=${offset}&limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    )
    
    const data = await response.json()
    
    return {
      total: data.total,
      txs: data.transactions.map((tx: any) => this.mapTransactionToTx(tx))
    }
  }

  async getTransactionData(txId: string, address: string): Promise<Tx> {
    const response = await fetch(
      `${this.baseUrl}/transaction/${txId}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    )
    
    const tx = await response.json()
    return this.mapTransactionToTx(tx)
  }

  async broadcastTx(txHex: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ txHex })
    })
    
    const data = await response.json()
    return data.txid
  }

  async getFeeRates(): Promise<FeeRates> {
    const response = await fetch(`${this.baseUrl}/fees`)
    const feeData = await response.json()
    
    return {
      fastest: feeData.fastest,
      fast: feeData.fast,
      average: feeData.average
    }
  }

  private mapTransactionToTx(rawTx: any): Tx {
    return {
      asset: this.asset,
      from: rawTx.inputs.map((input: any) => ({
        from: input.address,
        amount: baseAmount(input.value, this.getAssetDecimals())
      })),
      to: rawTx.outputs.map((output: any) => ({
        to: output.address,
        amount: baseAmount(output.value, this.getAssetDecimals())
      })),
      date: new Date(rawTx.timestamp * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid
    }
  }

  private getAssetDecimals(): number {
    return this.chain === 'BTC' ? 8 : 8 // Default to 8 decimals
  }
}
```

## Testing UTXO Implementations

### Unit Testing with Mocked Providers

```typescript
describe('UTXO Client Tests', () => {
  let mockProvider: any
  let client: BitcoinClient

  beforeEach(() => {
    mockProvider = {
      getBalance: jest.fn(),
      getUnspentTxs: jest.fn(),
      getTransactions: jest.fn(),
      broadcastTx: jest.fn(),
      getFeeRates: jest.fn()
    }

    client = new BitcoinClient({
      network: Network.Testnet,
      dataProviders: [mockProvider]
    })
  })

  test('should get UTXO balance correctly', async () => {
    mockProvider.getBalance.mockResolvedValue([{
      asset: AssetBTC,
      amount: baseAmount('100000000', 8) // 1 BTC
    }])

    const balance = await client.getBalance('tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
    
    expect(balance[0].amount.amount().toString()).toBe('100000000')
    expect(balance[0].asset).toEqual(AssetBTC)
  })

  test('should build transaction correctly', async () => {
    const mockUTXOs: UTXO[] = [{
      hash: 'a'.repeat(64),
      index: 0,
      value: 150000000, // 1.5 BTC
      height: 700000,
      witnessUtxo: {
        script: Buffer.from('00141234567890abcdef', 'hex'),
        value: 150000000
      }
    }]

    mockProvider.getUnspentTxs.mockResolvedValue(mockUTXOs)
    mockProvider.getFeeRates.mockResolvedValue({
      fastest: 50,
      fast: 25,
      average: 10
    })

    const preparedTx = await client.prepareTx({
      asset: AssetBTC,
      amount: baseAmount('50000000', 8), // 0.5 BTC
      recipient: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      feeRate: 10
    })

    expect(preparedTx.rawUnsignedTx).toBeDefined()
    expect(preparedTx.rawUnsignedTx.length).toBeGreaterThan(0)
  })

  test('should handle UTXO consolidation', async () => {
    // Create many small UTXOs
    const smallUTXOs: UTXO[] = Array.from({ length: 25 }, (_, i) => ({
      hash: i.toString().padStart(64, '0'),
      index: 0,
      value: 1000000, // 0.01 BTC each
      height: 700000 + i,
      witnessUtxo: {
        script: Buffer.from('00141234567890abcdef', 'hex'),
        value: 1000000
      }
    }))

    mockProvider.getUnspentTxs.mockResolvedValue(smallUTXOs)
    
    const consolidator = new UTXOConsolidator(client)
    const needsConsolidation = await consolidator.needsConsolidation('test-address')
    
    expect(needsConsolidation).toBe(true)
  })
})
```

### Integration Testing

```typescript
describe('UTXO Integration Tests', () => {
  let client: BitcoinClient

  beforeAll(() => {
    client = new BitcoinClient({
      network: Network.Testnet,
      phrase: process.env.TEST_PHRASE,
      dataProviders: [
        new HaskoinProvider(
          'https://api.haskoin.com/',
          'BTC',
          AssetBTC,
          8,
          HaskoinNetwork.BTCTEST
        )
      ]
    })
  })

  test('should perform full transaction flow', async () => {
    const address = await client.getAddressAsync(0)
    console.log('Test address:', address)

    // 1. Check balance
    const initialBalance = await client.getBalance(address)
    console.log('Initial balance:', initialBalance)

    // 2. Get UTXOs
    const utxos = await client.scanUTXOs(address, true)
    console.log('Available UTXOs:', utxos.length)

    if (utxos.length === 0 || initialBalance[0].amount.amount().toNumber() < 100000) {
      console.log('Insufficient balance for test')
      return
    }

    // 3. Send small amount
    const txHash = await client.transfer({
      asset: AssetBTC,
      amount: baseAmount('50000', 8), // 0.0005 BTC
      recipient: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      memo: 'Integration test'
    })

    console.log('Transaction hash:', txHash)
    expect(txHash).toBeDefined()
    expect(txHash.length).toBe(64)

    // 4. Verify transaction appears in history
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
    
    const transactions = await client.getTransactions({ address, limit: 5 })
    const sentTx = transactions.txs.find(tx => tx.hash === txHash)
    
    expect(sentTx).toBeDefined()
    expect(sentTx?.hash).toBe(txHash)
  }, 60000) // 60 second timeout
})
```

## Performance Optimization

### UTXO Caching Strategy

```typescript
class UTXOCache {
  private cache = new Map<string, { 
    utxos: UTXO[]
    timestamp: number
    ttl: number 
  }>()
  
  private balanceCache = new Map<string, { 
    balance: Balance[]
    timestamp: number 
  }>()

  setUTXOs(address: string, utxos: UTXO[], ttl: number = 300000): void {
    this.cache.set(address, {
      utxos,
      timestamp: Date.now(),
      ttl
    })
  }

  getUTXOs(address: string): UTXO[] | null {
    const entry = this.cache.get(address)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(address)
      return null
    }

    return entry.utxos
  }

  setBalance(address: string, balance: Balance[]): void {
    this.balanceCache.set(address, {
      balance,
      timestamp: Date.now()
    })
  }

  getBalance(address: string): Balance[] | null {
    const entry = this.balanceCache.get(address)
    if (!entry) return null

    // Balance cache TTL: 60 seconds
    if (Date.now() - entry.timestamp > 60000) {
      this.balanceCache.delete(address)
      return null
    }

    return entry.balance
  }

  invalidateAddress(address: string): void {
    this.cache.delete(address)
    this.balanceCache.delete(address)
  }
}
```

## Best Practices for UTXO Development

### 1. Efficient UTXO Management
```typescript
// Always check for consolidation needs
async function checkConsolidationNeeds(client: BitcoinClient, address: string): Promise<boolean> {
  const utxos = await client.scanUTXOs(address, true)
  return utxos.length > 20 || utxos.filter(u => u.value < 10000).length > 10
}

// Use appropriate confirmation levels
const CONFIRMATION_LEVELS = {
  small: 1,    // < $100
  medium: 3,   // < $1000
  large: 6     // > $1000
}
```

### 2. Fee Strategy Implementation
```typescript
// Dynamic fee calculation
async function calculateDynamicFee(
  client: BitcoinClient,
  priority: 'low' | 'medium' | 'high'
): Promise<number> {
  const rates = await client.getFeeRates()
  
  switch (priority) {
    case 'low':
      return Math.max(rates.average * 0.5, 1)
    case 'medium':
      return rates.average
    case 'high':
      return Math.min(rates.fastest, rates.average * 2)
  }
}
```

### 3. Error Handling Strategies
```typescript
class UTXOErrorHandler {
  static async handleTransactionError(error: any, retryCount: number = 3): Promise<void> {
    if (error.message.includes('insufficient')) {
      throw new Error('Insufficient balance for transaction')
    }
    
    if (error.message.includes('fee too low')) {
      if (retryCount > 0) {
        // Implement retry with higher fee
        await new Promise(resolve => setTimeout(resolve, 5000))
        // Retry with 20% higher fee
      } else {
        throw new Error('Transaction fee too low after retries')
      }
    }
    
    if (error.message.includes('double spend')) {
      throw new Error('UTXO already spent - refresh UTXOs and retry')
    }

    throw error
  }
}
```

### 4. Address Format Compatibility
```typescript
// Handle different address formats
function normalizeAddress(address: string, network: Network): string {
  // Convert legacy formats to modern formats where possible
  if (address.startsWith('1') || address.startsWith('3')) {
    console.warn('Legacy address format detected, consider upgrading to Bech32')
  }
  
  return address
}
```

This comprehensive UTXO Expert Development Agent guide provides the foundation for building robust, efficient, and scalable UTXO-based applications using XChainJS. The modular architecture and comprehensive provider ecosystem make it ideal for enterprise blockchain applications requiring reliable UTXO transaction management.