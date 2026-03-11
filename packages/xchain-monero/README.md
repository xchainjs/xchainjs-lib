# `@xchainjs/xchain-monero`

Monero (XMR) client for XChainJS — a pure JavaScript implementation with no WASM dependencies.

## Overview

This package provides a Monero client that implements the standard XChainJS `XChainClient` interface. It supports address derivation, balance queries, transaction history, fee estimation, and transaction building/broadcasting.

Key design decisions:

- **Pure JS** — Uses `@noble/curves`, `@noble/hashes`, and `micro-key-producer` for all cryptographic operations. No native modules or WASM, so it works in both Node.js and browser environments.
- **MyMonero LWS** — Balance and UTXO queries go through a Light Wallet Server (LWS) API, defaulting to `api.mymonero.com`.
- **Monero Daemon RPC** — Fee estimation and transaction broadcasting use a standard Monero daemon node.
- **SLIP-10 key derivation** — Derives Monero spend/view keys from a BIP-39 mnemonic via SLIP-10 (`m/44'/128'/account'`).

## Installation

```bash
yarn add @xchainjs/xchain-monero
```

## Usage

```typescript
import { Client, defaultXMRParams } from '@xchainjs/xchain-monero'
import { Network } from '@xchainjs/xchain-client'

const client = new Client({
  ...defaultXMRParams,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase here',
})

// Get address
const address = await client.getAddressAsync()

// Get balance
const balances = await client.getBalance(address)

// Transfer
const txHash = await client.transfer({
  recipient: '4...',
  amount: baseAmount(1000000000000, 12), // 1 XMR
})
```

## Architecture

```
src/
├── client.ts          # XChainClient implementation
├── const.ts           # Chain constants, default params
├── types.ts           # Client parameter types
├── utils.ts           # Address derivation, key helpers
├── lws.ts             # MyMonero Light Wallet Server API
├── daemon.ts          # Monero daemon RPC client
└── tx/
    ├── builder.ts     # Transaction construction
    ├── serialize.ts   # Binary serialization
    ├── decoySelection.ts  # Ring member (decoy) selection
    └── types.ts       # Transaction types
```

## License

MIT
