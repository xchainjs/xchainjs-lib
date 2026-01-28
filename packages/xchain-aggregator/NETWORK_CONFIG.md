# Network Configuration

The XChain Aggregator now supports network configuration to work with different environments (mainnet, stagenet, testnet).

## Usage

### Explicit Network Configuration

```typescript
import { Aggregator } from '@xchainjs/xchain-aggregator'
import { Network } from '@xchainjs/xchain-client'

// Configure aggregator for stagenet
const stagenetAggregator = new Aggregator({
  protocols: ['Thorchain', 'Mayachain'],
  network: Network.Stagenet
})

// Configure aggregator for mainnet
const mainnetAggregator = new Aggregator({
  protocols: ['Thorchain', 'Mayachain'],
  network: Network.Mainnet
})
```

### Network Inference from Wallet

```typescript
import { Wallet } from '@xchainjs/xchain-wallet'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'

// Create wallet with stagenet clients
const stagenetWallet = new Wallet({
  THOR: new ThorClient({ network: Network.Stagenet }),
  // ... other clients with Network.Stagenet
})

// Aggregator will automatically use stagenet
const aggregator = new Aggregator({
  protocols: ['Thorchain'],
  wallet: stagenetWallet
  // network will be inferred as Network.Stagenet
})
```

### Network Priority

The aggregator determines the network in the following priority order:

1. **Explicit `network` parameter** - highest priority
2. **Network from wallet clients** - if no explicit network set
3. **Default to mainnet** - fallback if neither above are available

```typescript
// Explicit network takes precedence over wallet
const aggregator = new Aggregator({
  protocols: ['Thorchain'],
  wallet: mainnetWallet,        // wallet has mainnet clients
  network: Network.Stagenet     // but this takes precedence
})
// Result: aggregator uses stagenet
```

## TRON Support

TRON pools are only available on stagenet, so to access TRON swaps:

```typescript
const tronAggregator = new Aggregator({
  protocols: ['Thorchain'],
  network: Network.Stagenet  // Required for TRON support
})

// Now you can quote TRON swaps
const tronQuotes = await tronAggregator.estimateSwap({
  fromAsset: AssetTRX,
  destinationAsset: AssetBTC,
  amount: new CryptoAmount(assetToBase(assetAmount('100', 6)), AssetTRX)
})
```

## Getting Current Configuration

```typescript
const config = aggregator.getConfiguration()
console.log('Current network:', config.network)
console.log('Active protocols:', config.protocols)
```

## Network Endpoints

The aggregator automatically uses the correct endpoints for each network:

- **Mainnet**: `https://thornode.ninerealms.com`
- **Stagenet**: `https://stagenet-thornode.ninerealms.com`
- **Testnet**: `https://testnet.thornode.thorchain.info`

## Supported Networks by Protocol

| Protocol  | Mainnet | Stagenet | Testnet |
|-----------|---------|----------|---------|
| Thorchain | ✅      | ✅       | ✅      |
| Mayachain | ✅      | ✅       | ✅      |
| Chainflip | ✅      | ❌       | ❌      |

*Note: Chainflip only supports mainnet*