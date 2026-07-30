# `@xchainjs/xchain-utxo`

## Modules

- `client` - Abstract base client for UTXO-based chains (Bitcoin, Litecoin, Dash, Dogecoin, Bitcoin Cash, etc.)
- `utxo-selector` - UTXO coin selection helpers
- `strategies` - Coin selection strategies (branch-and-bound, accumulative, largest-first, small-first, single-random-draw)
- `validators` - Transaction validation utilities
- `errors` - UTXO-specific error types
- `coininfo` / `toBitcoinJS` - Network parameter helpers for bitcoinjs-lib compatible coins

## Installation

```
yarn add @xchainjs/xchain-utxo
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-utxo`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-util @xchainjs/xchain-utxo-providers
```

## Overview

This package provides the shared abstract `Client` used by UTXO chain packages in XChainJS. Chain-specific packages (for example `@xchainjs/xchain-bitcoin` or `@xchainjs/xchain-dash`) extend this base class and supply network constants, address formats, transaction building, and data providers.

Typical responsibilities of the base UTXO client:

- Explorer URL helpers
- Balance and UTXO fetching via pluggable `UtxoOnlineDataProviders`
- Transaction history and fee estimation wiring
- UTXO selection strategies for building inputs
- Shared types (`UTXO`, `UtxoClientParams`, `PreparedTx`, etc.)

You generally do **not** instantiate this package directly in application code. Use a concrete chain client instead:

```typescript
import { Client, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
// or
import { Client, defaultDashParams } from '@xchainjs/xchain-dash'
```

## Usage (library / package authors)

When implementing a new UTXO chain client, extend the abstract `Client` and provide chain-specific logic:

```typescript
import { Client as UTXOClient, UtxoClientParams } from '@xchainjs/xchain-utxo'
import { Network } from '@xchainjs/xchain-client'

class Client extends UTXOClient {
  constructor(params: UtxoClientParams) {
    super('MYCHAIN', params)
  }

  // Implement abstract methods: address derivation, tx building, signing, etc.
}
```

### Coin selection strategies

```typescript
import {
  UtxoSelector,
  // strategies are re-exported from the package
} from '@xchainjs/xchain-utxo'
```

Strategies can be used when preparing transactions to control how inputs are chosen (fee efficiency, privacy, consolidating small UTXOs, etc.).

## Related packages

| Package | Role |
| ------- | ---- |
| [`@xchainjs/xchain-utxo-providers`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-utxo-providers) | Online data providers (BlockCypher, Sochain, BitGo, Haskoin, etc.) |
| [`@xchainjs/xchain-client`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-client) | Base XChain client interface |
| [`@xchainjs/xchain-bitcoin`](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bitcoin) | Example concrete UTXO client |

## Documentation

More information about XChainJS can be found on [documentation](https://xchainjs.gitbook.io/xchainjs)
