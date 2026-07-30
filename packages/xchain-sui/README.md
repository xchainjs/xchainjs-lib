# `@xchainjs/xchain-sui`

## Modules

- `client` - Custom client for communicating with the [Sui](https://sui.io/) blockchain using [@mysten/sui](https://github.com/MystenLabs/sui/tree/main/sdk/typescript)

## Installation

```sh
yarn add @xchainjs/xchain-sui
```

## Network access (JSON-RPC deprecation)

Sui Foundation **disabled JSON-RPC on public fullnodes** (week of 2026-07-27). Full decommission is planned mid-October 2026.

See the [JSON-RPC migration guide](https://docs.sui.io/develop/accessing-data/json-rpc-migration).

This package defaults to:

| Role | Transport | Default mainnet URL |
| ---- | --------- | ------------------- |
| Balances, fees, coins, transfer execution | **gRPC** | `https://fullnode.mainnet.sui.io:443` |
| Transaction history / archival lookups | **GraphQL** | `https://graphql.mainnet.sui.io/graphql` |

`clientUrls` pointing at `fullnode.*.sui.io` still work: those hosts remain valid as **gRPC** base URLs. They no longer serve public JSON-RPC.

### Migration for apps (e.g. Asgardex)

```ts
// Before: JSON-RPC against Foundation fullnodes (broken on public mainnet)
clientUrls: {
  mainnet: 'https://fullnode.mainnet.sui.io',
  testnet: 'https://fullnode.testnet.sui.io',
}

// After: same URLs work with the default transport ('grpc').
// No URL change required if you only used Foundation fullnodes.
new Client({
  ...defaultSuiParams,
  clientUrls, // optional; defaults already use Foundation fullnode gRPC
  phrase,
})

// Optional: explicit GraphQL endpoint for history
new Client({
  ...defaultSuiParams,
  graphqlUrls: {
    mainnet: 'https://graphql.mainnet.sui.io/graphql',
    testnet: 'https://graphql.testnet.sui.io/graphql',
    stagenet: 'https://graphql.mainnet.sui.io/graphql',
  },
  phrase,
})

// Optional: private node that still enables JSON-RPC
new Client({
  ...defaultSuiParams,
  transport: 'jsonRpc',
  clientUrls: {
    mainnet: 'https://my-private-node.example/json-rpc',
    // ...
  },
  phrase,
})
```

Public Foundation endpoints are rate-limited and intended for development. Production apps should use a dedicated provider or self-hosted node.

## Usage

Read-only (no phrase):

```typescript
import { Client } from '@xchainjs/xchain-sui'

const client = new Client()
const balances = await client.getBalance('0x...')
```

Sign and transfer:

```typescript
import { Client, defaultSuiParams, SUIAsset } from '@xchainjs/xchain-sui'
import { Network } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

const client = new Client({
  ...defaultSuiParams,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase',
})

const address = await client.getAddressAsync()
const balances = await client.getBalance(address)

const txHash = await client.transfer({
  asset: SUIAsset,
  recipient: '0x...',
  amount: assetToBase(assetAmount('1', 9)), // 1 SUI (9 decimals)
})
```

### Default parameters

```typescript
const defaultSuiParams = {
  network: Network.Mainnet,
  transport: 'grpc',
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/784'/",
    [Network.Testnet]: "m/44'/784'/",
    [Network.Stagenet]: "m/44'/784'/",
  },
  // clientUrls / grpcUrls → Foundation fullnode gRPC
  // graphqlUrls → Foundation GraphQL
}
```

## Features

- Get native SUI and coin/token balances
- Generate addresses from a secret phrase (SLIP-10, coin type `784`)
- Transfer SUI and coins/tokens
- Get transaction details by digest (GraphQL, with fullnode fallback)
- Get address transaction history (GraphQL `affectedAddress`)
- Estimate fees (gas-based model)

**Note:** Memos are not supported for SUI transfers.

## Explorer

| Network  | Explorer |
| -------- | -------- |
| Mainnet  | https://suiscan.xyz/mainnet |
| Testnet  | https://suiscan.xyz/testnet |
| Stagenet | https://suiscan.xyz/mainnet (uses Mainnet explorer) |

## Documentation

More information about XChainJS clients can be found on [documentation](https://xchainjs.gitbook.io/xchainjs)
