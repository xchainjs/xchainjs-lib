# `@xchainjs/xchain-monero`

Monero (XMR) client for XChainJS. Address derivation is pure JavaScript (no WASM). **Sending funds requires `monero-wallet-rpc`.**

## Status

This package is experimental. Treat it as a local-node adapter, not a general-purpose Monero wallet.

| Capability | How |
|---|---|
| Address from BIP-39 | Pure JS (SLIP-10). Not a 25-word `monero-wallet-cli` seed. Sync `getAddress` / `setPhrase` supported. |
| Balance / history | `walletRpcUrls` → `lwsUrls` → bounded daemon scan (≤ 5,000 blocks). Wallet-rpc `getBalance` returns **unlocked** (spendable); use `getWalletBalanceDetail` for total + unlocked. Address may be any HD index 0–20; each index is a separate wallet-rpc file. |
| Transfer | **`walletRpcUrls` only.** Uses `walletIndex` to open the matching wallet file. Refuses amounts above unlocked. Maps `feeOption` → priority. `prepareTx` / `broadcastTx` throw. |
| Fees | Daemon fee-per-byte × a typical 2-in/2-out weight for estimates. Transfer priority: Average→2, Fast→3, Fastest→4. |

A public `monerod` cannot answer “what is my balance?” or build a spend. Point the client at your own node plus `monero-wallet-rpc`.

## Overview

This package implements the standard XChainJS `XChainClient` interface.

Key design decisions:

- **Address crypto in JS** — `@noble/curves`, `@noble/hashes`, and `micro-key-producer`. No native modules or WASM.
- **SLIP-10 key derivation** — spend/view keys come from a BIP-39 mnemonic at `m/44'/128'/account'`. This is **not** a Monero 25-word seed. A `monero-wallet-cli` wallet created with the official seed will not share this address.
- **`monerod` has no wallet state.** The daemon will not return a balance.
- **Do not broadcast output from `tx/builder.ts`.** That path is not consensus-compatible.

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

# --disable-rpc-login is for localhost development only. Do not bind this
# process to a public interface.
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
├── utils.ts           # Address helpers, scalar ops
├── walletRpc.ts       # monero-wallet-rpc (balance / history / transfer)
├── lws.ts             # MyMonero-compatible Light Wallet Server API
├── daemon.ts          # Monero daemon RPC client
├── scanner.ts         # Bounded JSON daemon scan fallback
├── crypto/            # Address + primitive crypto (not a send path)
└── tx/                # Experimental RingCT builder (not exported from package root; not used by transfer())
```

## License

MIT
