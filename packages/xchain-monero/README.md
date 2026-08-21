# `@xchainjs/xchain-monero`

Monero (XMR) client for XChainJS — a pure JavaScript implementation with no WASM dependencies.

## Status

Address derivation, **balance**, **history**, and **transfer** against a local `monerod` work via `monero-wallet-rpc`. Fee estimates still come from the daemon (per-byte; the suite Fees tab is not a full tx fee). The JS RingCT builder + LWS path remains as a fallback and is not what xchain-suite uses.

## Overview

This package implements the standard XChainJS `XChainClient` interface.

Key design decisions:

- **Pure JS** — `@noble/curves`, `@noble/hashes`, and `micro-key-producer`. No native modules or WASM, so it runs in Node.js and the browser.
- **SLIP-10 key derivation** — spend/view keys come from a BIP-39 mnemonic at `m/44'/128'/account'`. This is **not** a Monero 25-word seed. A `monero-wallet-cli` wallet created with the official seed will not share this address.
- **`monerod` has no wallet state.** The daemon will not return a balance. You need wallet-rpc (preferred for a local node), LWS, or a short client-side scan.
- **Balance lookup order** — `walletRpcUrls` → `lwsUrls` → JSON daemon scan (only if the range is ≤ 5,000 blocks).

## Installation

```bash
yarn add @xchainjs/xchain-monero
```

## Usage (local node)

```typescript
import { Client, defaultXMRParams } from '@xchainjs/xchain-monero'
import { Network } from '@xchainjs/xchain-client'

const client = new Client({
  ...defaultXMRParams,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase here',
  restoreHeight: 3626700, // wallet creation height; do not start at 0
  daemonUrls: {
    ...defaultXMRParams.daemonUrls,
    [Network.Mainnet]: ['http://127.0.0.1:18081'],
  },
  walletRpcUrls: {
    [Network.Mainnet]: ['http://127.0.0.1:18088'],
    [Network.Testnet]: [],
    [Network.Stagenet]: [],
  },
})

const address = await client.getAddressAsync()
const balances = await client.getBalance(address)

const txHash = await client.transfer({
  recipient: '8... or 4...',
  amount: baseAmount(1000000000000, 12), // 1 XMR
})
```

On first `getBalance`, the client calls wallet-rpc `generate_from_keys` (or `open_wallet` if that file already exists), waits until the wallet height catches `monerod`, then reads `get_balance`. The first sync from `restoreHeight` to tip can take several minutes; later calls are fast.

## Running a local node

You need **two** processes: `monerod` (chain) and `monero-wallet-rpc` (wallet). Official binaries: [getmonero.org/downloads](https://www.getmonero.org/downloads/).

### 1. `monerod`

A pruned node is enough. Bind RPC to localhost only.

```bash
monerod \
  --prune-blockchain \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 18081 \
  --restricted-rpc 0 \
  --non-interactive
```

Wait until it is synced (`get_info.synchronized === true`). Unrestricted RPC is required for wallet restore.

### 2. `monero-wallet-rpc`

Leave this with `--wallet-dir` and no wallet preloaded. The client creates/opens a wallet from the BIP-39 keys over RPC.

```bash
mkdir -p /path/to/xchain-wallets

monero-wallet-rpc \
  --daemon-address 127.0.0.1:18081 \
  --trusted-daemon \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 18088 \
  --disable-rpc-login \
  --rpc-ssl disabled \
  --wallet-dir /path/to/xchain-wallets \
  --disable-rpc-ban \
  --no-initial-sync
```

Do not point this at an existing official-seed wallet if you are testing the XChainJS client. That wallet is a different key scheme.

### Browser / xchain-suite

Browsers cannot call `127.0.0.1:18081` / `18088` directly (CORS). xchain-suite proxies:

| Browser path | Upstream |
|---|---|
| `/xmr-daemon` | `http://127.0.0.1:18081` |
| `/xmr-wallet` | `http://127.0.0.1:18088` |

See [tools/xchain-suite/README.md](../../tools/xchain-suite/README.md#monero-local-node).

## Architecture

```
src/
├── client.ts          # XChainClient implementation
├── const.ts           # Chain constants, default params
├── types.ts           # Client parameter types
├── utils.ts           # Address derivation, key helpers
├── walletRpc.ts       # monero-wallet-rpc (balance against a local node)
├── lws.ts             # MyMonero-compatible Light Wallet Server API
├── daemon.ts          # Monero daemon RPC client
├── scanner.ts         # Bounded JSON daemon scan fallback
└── tx/
    ├── builder.ts     # Transaction construction
    ├── serialize.ts   # Binary serialization
    ├── decoySelection.ts  # Ring member (decoy) selection
    └── types.ts       # Transaction types
```

## License

MIT
