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
| **Other** | Solana (SOL), Radix (XRD), Cardano (ADA), Ripple (XRP) |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# From the xchainjs-lib root directory
pnpm install

# Navigate to xchain-suite
cd tools/xchain-suite

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
pnpm preview
```

## Usage

### Connect Wallet
1. Click the wallet icon in the header
2. Enter your BIP-39 mnemonic phrase
3. Select network (Mainnet/Testnet/Stagenet)

> **Security Note**: This tool stores your mnemonic in memory only. Never use mainnet wallets with significant funds for testing.

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

## Browser Compatibility

This app runs entirely in the browser. Some notes:

- **Buffer polyfill** - Included for Node.js compatibility
- **WASM support** - Enabled for Cardano (vite-plugin-wasm)
- **Top-level await** - Enabled for async module loading

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Test in browser with `pnpm dev`
4. Submit a PR

## License

MIT - See the root xchainjs-lib repository for full license.
