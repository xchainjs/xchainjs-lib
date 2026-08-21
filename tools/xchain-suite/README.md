# XChain Suite

A browser-based developer suite for XChainJS packages. Test chain clients, execute swaps, manage liquidity, and interact with THORChain/MAYAChain protocols.

## Features

### Chain Operations
- **Address** - Generate and view wallet addresses
- **Balance** - Check native and token balances
- **Fees** - View current network fee estimates
- **Transfer** - Send tokens to any address
- **Deposit** - Make protocol deposits with custom memos (THOR/MAYA only)
- **History** - View transaction history
- **Validate** - Validate address formats
- **Prepare Tx** - Generate unsigned transactions

### DeFi Features
- **Swap** - Cross-chain swaps via THORChain and MAYAChain AMMs
  - Streaming swaps supported
  - Quote comparison between protocols
- **Pools** - View pool statistics for both protocols
  - TVL, Volume, APY metrics
  - Pool status (Available, Staged, Suspended, Halted)
  - Quick actions to Swap or Add Liquidity
- **Liquidity** - Add and withdraw liquidity from pools
- **Trade Assets** - Manage L1 trade assets on THORChain
- **RUNEPool** - Deposit and withdraw from RUNEPool
- **THORNode/MAYANode** - Query node information
- **THORName/MAYAName** - Lookup naming service registrations
  - Estimated expiry dates
  - Chain aliases
  - Owner lookup
- **Router Approval** - Approve ERC-20 tokens for router contracts

## Supported Chains

| Category | Chains |
|----------|--------|
| **UTXO** | Bitcoin (BTC), Bitcoin Cash (BCH), Litecoin (LTC), Dogecoin (DOGE), Dash (DASH), Zcash (ZEC) |
| **EVM** | Ethereum (ETH), Avalanche (AVAX), BNB Smart Chain (BSC), Arbitrum (ARB) |
| **Cosmos** | Cosmos Hub (GAIA), THORChain (THOR), MAYAChain (MAYA), Kujira (KUJI) |
| **Other** | Monero (XMR), Solana (SOL), Radix (XRD), Cardano (ADA), Ripple (XRP) |

## Getting Started

### Prerequisites
- Node.js 18+
- Yarn 4 (this monorepo uses `packageManager: yarn@4.9.2`)

### Installation

```bash
# From the xchainjs-lib root directory
yarn install

# Navigate to xchain-suite
cd tools/xchain-suite

# Start development server
yarn dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
yarn build
yarn preview
```

## Usage

### Connect Wallet
1. Click **Connect Wallet** in the header
2. Choose one of:
   - **Connect Ledger** (BTC + ETH via WebHID) — unlock the device, approve the browser prompt, open the Bitcoin or Ethereum app
   - **Quick Connect** — temporary keystore or mnemonic (not saved)
   - **Create / Import** — encrypted keystore stored in browser localStorage

#### Ledger (BTC + ETH)
- Browser: Chrome / Edge (WebHID)
- On the Ledger connect screen, pick:
  - **BTC address format**: native SegWit, Taproot, legacy (`1…`), or nested SegWit (`3…`)
  - **ETH derivation**: default BIP44 or Ledger Live account path
  - **Account index**: BIP account slot (e.g. `m/84'/0'/N'/0/…`); ignored for Ledger Live ETH — use wallet index on Get Address
  - **Custom root path** (optional): full override such as `m/84'/0'/5'/0/` or `m/44'/60'/{index}'/0/0`
- Only **BTC** and **ETH** chain pages work in Ledger mode; other chains error with a clear message

> **Security Note**: Phrase mode stores your mnemonic in memory only. Never use mainnet wallets with significant funds for testing.

## Monero (local node)

`monerod` stores the chain, not wallets. The suite shows an XMR balance by talking to **`monero-wallet-rpc`**, which scans with the BIP-39 view key against your local daemon.

That address is **not** a `monero-wallet-cli` wallet. Official Monero seeds are 25 words; the suite derives XMR via SLIP-10 `m/44'/128'/0'` from the same BIP-39 phrase as every other chain.

Full client notes: [`packages/xchain-monero/README.md`](../../packages/xchain-monero/README.md).

### 1. Run `monerod`

Pruned is fine. Bind RPC to localhost. Wait until it is synced.

```bash
monerod \
  --prune-blockchain \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 18081 \
  --restricted-rpc 0 \
  --non-interactive
```

Check:

```bash
curl -s http://127.0.0.1:18081/json_rpc \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":"0","method":"get_info"}'
```

You want `"synchronized": true` and `"restricted": false`.

### 2. Run `monero-wallet-rpc`

`yarn dev` starts this automatically if it finds the binary (`MONERO_WALLET_RPC`, or `monero-wallet-rpc` on `PATH`). Wallet files default to `~/.cache/xchain-suite/monero-wallets` (`MONERO_WALLET_DIR`). Otherwise start it yourself:

```bash
export MONERO_WALLET_RPC=/path/to/monero-wallet-rpc
export MONERO_WALLET_DIR=/path/to/xchain-wallets

mkdir -p "$MONERO_WALLET_DIR"

"$MONERO_WALLET_RPC" \
  --daemon-address 127.0.0.1:18081 \
  --trusted-daemon \
  --rpc-bind-ip 127.0.0.1 \
  --rpc-bind-port 18088 \
  --disable-rpc-login \
  --rpc-ssl disabled \
  --wallet-dir "$MONERO_WALLET_DIR" \
  --disable-rpc-ban \
  --no-initial-sync
```

Use a **dedicated** `--wallet-dir`. Do not reuse an official-seed wallet directory.

### 3. Point the suite at it

Vite already proxies the browser to localhost:

| Path | Process |
|---|---|
| `/xmr-daemon` | `monerod` `:18081` |
| `/xmr-wallet` | `monero-wallet-rpc` `:18088` |

Optional, in `tools/xchain-suite/.env`:

```bash
# Wallet creation / first-scan height. Use when the suite address was first funded.
VITE_XMR_RESTORE_HEIGHT=3626700
```

Then `yarn dev`, open http://localhost:3000, unlock, and wait for the XMR card. The first sync from `VITE_XMR_RESTORE_HEIGHT` to tip can take a few minutes. Later unlocks reuse the wallet file under `MONERO_WALLET_DIR`.

**History:** Chain → XMR → History uses the same wallet-rpc wallet (`get_transfers`). Incoming senders are hidden (Monero). Outgoing destinations show when this wallet created the spend.

**Transfer:** Chain → XMR → Transfer also uses wallet-rpc (`transfer`). Do not send your entire unlocked balance — the daemon still takes a fee. Incoming outputs need ~10 confirmations before they can be spent. Send a small test amount first.

If the card says **No balance**, the suite SLIP-10 address is empty. Send a test amount from any Monero wallet **to the address shown on the XMR card**.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| `ENOSPC: System limit for number of file watchers` | Linux inotify cap. Suite polls instead of watching `packages/*/lib`. Restart `yarn dev` after pulling that change, or `sudo sysctl -w fs.inotify.max_user_watches=524288`. |
| XMR card errors about wallet RPC | `monero-wallet-rpc` is not on `:18088`. Start it or set `MONERO_WALLET_RPC`. |
| First load spins for a long time | Expected. wallet-rpc is scanning from restore height. |
| Balance is 0 / No balance | Different address than your official Monero wallet. Check the address on the card. |

### Making a Swap
1. Navigate to **Swap** in the sidebar
2. Select source and destination assets
3. Enter amount to swap
4. Review quotes from THORChain and MAYAChain
5. Click swap and confirm the transaction

### Custom Deposits (THOR/MAYA)
1. Navigate to a chain page (THORChain or MAYAChain)
2. Click the **Deposit** tab
3. Enter amount and memo
4. Use "Common Memos" dropdown for templates
5. Confirm and execute

#### Common Memo Formats
```
# THORName/MAYAName
~:{name}:{chain}:{address}:{owner}:{preferredAsset}

# Add Liquidity
+:{pool}:{affiliate}:{affiliateBps}

# Withdraw Liquidity
-:{pool}:{basisPoints}

# Swap
=:{destAsset}:{destAddress}:{limit}:{affiliate}:{affiliateBps}

# Streaming Swap
=:{destAsset}:{destAddress}:{limit}/{interval}/{quantity}

# RUNEPool
POOL+              # Deposit
POOL-:{basisPoints} # Withdraw

# Trade Assets
TRADE+:{address}   # Deposit
TRADE-:{address}   # Withdraw
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, Layout
│   ├── operations/      # Chain operations (Transfer, Deposit, etc.)
│   ├── swap/            # Swap-related components
│   └── ui/              # Reusable UI components
├── contexts/
│   ├── WalletContext    # Wallet state management
│   └── ConfigContext    # App configuration
├── hooks/
│   ├── useChainClient   # Chain client factory
│   ├── useAggregator    # Swap aggregator
│   ├── useOperation     # Async operation handler
│   └── usePrices        # Price fetching
├── lib/
│   ├── chains/          # Chain metadata
│   ├── clients/         # Client factory
│   └── swap/            # Swap service
└── pages/               # Route pages
```

## Adding a New Chain

1. Add the package to `package.json`:
   ```json
   "@xchainjs/xchain-newchain": "workspace:*"
   ```

2. Update `src/lib/clients/factory.ts`:
   ```typescript
   import { Client as NewChainClient, defaultNewChainParams } from '@xchainjs/xchain-newchain'

   case 'NEWCHAIN':
     return new NewChainClient({ ...defaultNewChainParams, network, phrase })
   ```

3. Add to `src/components/layout/Sidebar.tsx`:
   ```typescript
   { id: 'NEWCHAIN', name: 'New Chain' }
   ```

4. Add to `src/lib/chains/index.ts`:
   ```typescript
   { id: 'NEWCHAIN', name: 'New Chain', symbol: 'NEW', decimals: 8 }
   ```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Affiliate

Swap and quote operations use `xc` as the affiliate address with `0` basis points. This is used for quoting/tracking purposes only and does not charge any fee.

## Browser Compatibility

This app runs entirely in the browser. Some notes:

- **Buffer polyfill** - Included for Node.js compatibility
- **WASM support** - Enabled for Cardano (vite-plugin-wasm)
- **Top-level await** - Enabled for async module loading

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Test in browser with `yarn dev`
4. Submit a PR

## License

MIT - See the root xchainjs-lib repository for full license.
