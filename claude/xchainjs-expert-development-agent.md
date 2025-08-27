# XChainJS Expert Development Agent

## Overview

XChainJS is a comprehensive TypeScript library for blockchain interoperability and DeFi development. This guide provides expert-level insights into the architecture, patterns, and best practices for developing with XChainJS.

## Architecture Overview

### Core Design Principles

1. **Chain Abstraction**: Unified interface across different blockchain networks
2. **Modularity**: Loosely coupled packages for specific functionalities
3. **Protocol Agnosticism**: Support for multiple blockchain protocols and networks
4. **Type Safety**: Full TypeScript support with comprehensive type definitions
5. **Consistency**: Standardized patterns across all chain implementations

### Package Structure

XChainJS follows a monorepo architecture with distinct package categories:

#### Client Packages (20+ chains)
- **UTXO-based**: Bitcoin, Litecoin, Bitcoin Cash, Dogecoin, Dash, ZCash
- **EVM-based**: Ethereum, Binance Smart Chain, Avalanche, Arbitrum, Base
- **Cosmos SDK**: Cosmos, THORChain, MAYAChain, Kujira
- **Other**: Solana, Cardano, Binance Chain, Radix, Ripple

#### Utility Packages
- `xchain-util`: Core utilities, asset handling, number formatting
- `xchain-client`: Base client interface and types
- `xchain-crypto`: Cryptographic functions, keystore management
- `xchain-utxo`: UTXO-specific utilities
- `xchain-evm`: EVM-specific utilities
- `xchain-cosmos-sdk`: Cosmos SDK utilities

#### Data Provider Packages
- `xchain-utxo-providers`: UTXO blockchain data providers
- `xchain-evm-providers`: EVM blockchain data providers

#### Protocol Packages
- **THORChain**: `xchain-thornode`, `xchain-midgard`, `xchain-thorchain-query`, `xchain-thorchain-amm`
- **MAYAChain**: `xchain-mayanode`, `xchain-mayamidgard`, `xchain-mayachain-query`, `xchain-mayachain-amm`

#### Power Tools
- `xchain-wallet`: Multi-chain wallet management
- `xchain-aggregator`: Cross-protocol swap aggregation

## Core Concepts

### Asset System

```typescript
// Asset representation follows a standardized format
type Asset = {
  chain: string    // Chain identifier (e.g., 'BTC', 'ETH')
  symbol: string   // Asset symbol (e.g., 'BTC', 'USDT')
  ticker: string   // Asset ticker
  synth?: boolean  // Synthetic asset flag
}

// Asset variants
type TokenAsset = Asset & { contract: string }  // ERC-20, BEP-20, etc.
type SynthAsset = Asset & { synth: true }       // Synthetic assets
type TradeAsset = Asset                         // Trade assets
```

### Network Abstraction

```typescript
enum Network {
  Mainnet = 'mainnet',
  Stagenet = 'stagenet', 
  Testnet = 'testnet'
}
```

All clients support multi-network operations with consistent configuration.

### Amount Handling

XChainJS uses `BaseAmount` for precise decimal handling:

```typescript
// Always use BaseAmount for internal calculations
import { BaseAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'

// Convert user input to BaseAmount
const amount = assetToBase(assetAmount('1.5', 8)) // 150000000 base units
```

### Client Interface

All blockchain clients implement the `XChainClient` interface:

```typescript
interface XChainClient {
  // Network management
  setNetwork(net: Network): void
  getNetwork(): Network
  
  // Address operations
  getAddress(walletIndex?: number): Address
  validateAddress(address: string): boolean
  
  // Wallet management
  setPhrase(phrase: string, walletIndex: number): Address
  
  // Balance operations
  getBalance(address: Address, assets?: AnyAsset[]): Promise<Balance[]>
  
  // Transaction operations
  getTransactions(params?: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string): Promise<Tx>
  transfer(params: TxParams): Promise<TxHash>
  prepareTx(params: TxParams): Promise<PreparedTx>
  broadcastTx(txHex: string): Promise<TxHash>
  
  // Fee estimation
  getFees(options?: FeeEstimateOptions): Promise<Fees>
  
  // Utility
  getExplorerUrl(): string
  getAssetInfo(): AssetInfo
  purgeClient(): void
}
```

## Development Patterns

### Client Initialization

```typescript
import { Client } from '@xchainjs/xchain-bitcoin'

const client = new Client({ 
  network: Network.Mainnet,
  phrase: 'your twelve word mnemonic phrase here',
  feeBounds: { lower: 1, upper: 500 }
})
```

### Multi-Chain Wallet

```typescript
import { Wallet } from '@xchainjs/xchain-wallet'

const wallet = new Wallet({
  BTC: new BitcoinClient({ network }),
  ETH: new EthereumClient({ network }),
  THOR: new ThorchainClient({ network })
})

// Unified balance checking
const balances = await wallet.getBalances()
```

### Cross-Chain Swaps

```typescript
import { Aggregator } from '@xchainjs/xchain-aggregator'

const aggregator = new Aggregator({
  protocols: [Protocol.THORCHAIN_AMM, Protocol.MAYACHAIN_AMM],
  affiliate: { 
    address: 'your-address',
    basisPoints: 50 // 0.5% fee
  }
})

const quote = await aggregator.estimateSwap({
  fromAsset: AssetBTC,
  toAsset: AssetETH,
  amount: new CryptoAmount(amount, AssetBTC),
  fromAddress: 'source-address',
  destinationAddress: 'destination-address'
})
```

### Error Handling

```typescript
try {
  const txHash = await client.transfer({
    asset: AssetBTC,
    amount: assetToBase(assetAmount('0.1')),
    recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  })
} catch (error) {
  if (error.message.includes('Insufficient funds')) {
    // Handle insufficient balance
  } else if (error.message.includes('Invalid address')) {
    // Handle address validation error
  }
  throw error
}
```

## Advanced Features

### Keystore Management

```typescript
import { encryptToKeyStore, decryptFromKeystore } from '@xchainjs/xchain-crypto'

// Create encrypted keystore
const keystore = await encryptToKeyStore(mnemonic, password)

// Decrypt keystore
const recoveredMnemonic = await decryptFromKeystore(keystore, password)
```

### Custom Data Providers

```typescript
import { UtxoProvider } from '@xchainjs/xchain-utxo-providers'

// Configure custom providers
const provider = new UtxoProvider({
  baseUrl: 'https://custom-api.com',
  apiKey: 'your-api-key'
})
```

### Streaming Operations

```typescript
// THORChain streaming swaps
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'

const thorchainAMM = new ThorchainAMM()

const streamingSwap = await thorchainAMM.doSwap({
  fromAsset: AssetBTC,
  destinationAsset: AssetETH,
  amount: cryptoAmount,
  destinationAddress: ethAddress,
  streamingInterval: 3,
  streamingQuantity: 10
})
```

## Best Practices

### 1. Amount Precision
- Always use `BaseAmount` for calculations
- Convert to display format only in UI layer
- Use `CryptoAmount` for asset-aware operations

### 2. Network Configuration
- Use environment variables for network selection
- Implement network-specific provider configurations
- Test across all supported networks

### 3. Error Handling
- Implement comprehensive error catching
- Provide meaningful error messages
- Handle network timeouts and retries

### 4. Security
- Never log private keys or mnemonics
- Use keystore encryption for persistent storage
- Validate all addresses before transactions

### 5. Performance
- Cache frequently accessed data
- Use connection pooling for multiple requests
- Implement rate limiting for API calls

### 6. Testing
- Write tests for all chain operations
- Use testnet/stagenet for development
- Mock external API calls in unit tests

## Common Integration Patterns

### DeFi Protocol Integration

```typescript
// Liquidity provision example
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'

const amm = new ThorchainAMM(wallet)

// Add liquidity
const addLiquidityTx = await amm.addLiquidityPosition({
  asset: AssetBTC,
  amount: cryptoAmount
})

// Check position
const position = await amm.getLiquidityPosition({
  asset: AssetBTC,
  address: wallet.getAddress('BTC')
})
```

### Portfolio Management

```typescript
class Portfolio {
  constructor(private wallet: Wallet) {}
  
  async getTotalValue(): Promise<CryptoAmount> {
    const balances = await this.wallet.getBalances()
    
    // Convert all balances to USD equivalent
    const values = await Promise.all(
      balances.map(balance => 
        this.convertToUSD(balance.amount, balance.asset)
      )
    )
    
    return values.reduce((total, value) => total.plus(value))
  }
}
```

### Transaction Monitoring

```typescript
class TxMonitor {
  async waitForConfirmation(txHash: string, client: XChainClient): Promise<Tx> {
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      try {
        return await client.getTransactionData(txHash)
      } catch (error) {
        await this.delay(10000) // Wait 10 seconds
        attempts++
      }
    }
    
    throw new Error('Transaction confirmation timeout')
  }
}
```

## Development Environment Setup

### Prerequisites
```bash
node >= 16
yarn >= 1.4.0
```

### Building from Source
```bash
git clone https://github.com/xchainjs/xchainjs-lib
cd xchainjs-lib
yarn install
yarn build
```

### Running Tests
```bash
yarn test           # Unit tests
yarn e2e           # End-to-end tests
yarn lint          # Code linting
```

## Troubleshooting

### Common Issues

1. **Gas/Fee Estimation Failures**
   - Check network congestion
   - Verify sufficient balance for fees
   - Use fee bounds configuration

2. **Address Validation Errors**
   - Ensure correct network format
   - Validate against chain-specific rules
   - Check for testnet vs mainnet addresses

3. **Transaction Timeouts**
   - Implement retry mechanisms
   - Use appropriate timeout values
   - Monitor network status

4. **Provider Rate Limiting**
   - Implement exponential backoff
   - Use multiple providers
   - Cache responses when possible

## Community and Support

- **Documentation**: https://xchainjs.gitbook.io/xchainjs
- **Discord**: Community discussions and support
- **Telegram**: Real-time developer chat
- **GitHub**: Issues, feature requests, contributions

## Contributing

XChainJS welcomes contributions. Key areas:
- New chain integrations
- Protocol implementations  
- Bug fixes and optimizations
- Documentation improvements
- Test coverage expansion

Follow the established patterns and maintain consistency across implementations.