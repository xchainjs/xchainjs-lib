# XChainJS Testing GUI - Design Document

## Overview

A web browser GUI for testing xchainjs-lib packages. Run locally via `yarn dev`, access at `localhost:3000`.

**Location**: `tools/testing-gui`
**Purpose**: Package validation - test all public XChainClient methods
**Network**: Mainnet only
**Signing**: Keystore (mnemonic phrase) only

---

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React 18 + TypeScript | Matches existing examples, excellent TS support |
| Build | Vite | Fast HMR, handles Node.js polyfills well (see `examples/frameworks/vite-example`) |
| State | React Context | Simple needs: wallet state, config, results |
| UI | Tailwind CSS + shadcn/ui | Already used in examples, minimal bundle |
| Routing | react-router-dom | Chain selection via URL |

---

## Project Structure

```
tools/testing-gui/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Chain selection
│   │   │   ├── Header.tsx           # Wallet status
│   │   │   └── ResultPanel.tsx      # Operation results
│   │   │
│   │   ├── wallet/
│   │   │   └── WalletConnect.tsx    # Mnemonic input
│   │   │
│   │   ├── operations/              # One component per XChainClient method
│   │   │   ├── GetAddress.tsx
│   │   │   ├── GetBalance.tsx
│   │   │   ├── GetFees.tsx
│   │   │   ├── Transfer.tsx
│   │   │   ├── GetTransactions.tsx
│   │   │   ├── ValidateAddress.tsx
│   │   │   └── ExplorerLinks.tsx
│   │   │
│   │   ├── thorchain/               # THORChain/Maya specific
│   │   │   ├── Deposit.tsx          # Swap/deposit with memo
│   │   │   └── InboundAddresses.tsx
│   │   │
│   │   ├── config/
│   │   │   └── ApiKeyConfig.tsx     # Provider API keys
│   │   │
│   │   └── ui/                      # shadcn/ui components
│   │
│   ├── contexts/
│   │   ├── WalletContext.tsx        # Mnemonic & network state
│   │   └── ConfigContext.tsx        # API keys (localStorage)
│   │
│   ├── hooks/
│   │   ├── useChainClient.ts        # Client instantiation
│   │   └── useOperation.ts          # Execute & track operations
│   │
│   ├── lib/
│   │   ├── chains/
│   │   │   └── index.ts             # Chain registry (20 chains)
│   │   └── clients/
│   │       └── factory.ts           # createClient(chainId, config)
│   │
│   └── types/
│       └── index.ts
```

---

## Supported Chains (20)

| Category | Chains |
|----------|--------|
| UTXO | BTC, LTC, BCH, DOGE, DASH, ZEC |
| EVM | ETH, ARB, AVAX, BSC, BASE |
| Cosmos | THOR, MAYA, GAIA, KUJI |
| Other | SOL, ADA, XRD, XRP, TRON |

---

## UI Layout

```
+----------------------------------------------------------+
| [Header] Wallet: 0x123...abc | Mainnet | [Connect/Disconnect] |
+----------------------------------------------------------+
|         |                                                 |
| Sidebar |  Chain: Bitcoin (BTC)                          |
| ------  |                                                 |
| UTXO    |  [Tabs: Address | Balance | Fees | Transfer |  |
|  BTC    |         History | Validate | Explorer]         |
|  LTC    |                                                 |
|  ...    |  +------------------------------------------+  |
| EVM     |  | Form for selected operation              |  |
|  ETH    |  | - Input fields                           |  |
|  ...    |  | - [Execute] button                       |  |
| Cosmos  |  +------------------------------------------+  |
|  THOR   |                                                 |
|  MAYA   |  +------------------------------------------+  |
|  ...    |  | Results Panel                            |  |
| Other   |  | Operation: getBalance                    |  |
|  SOL    |  | Status: Success | Time: 234ms            |  |
|  ...    |  | Result: { ... }                          |  |
|         |  +------------------------------------------+  |
+---------+-------------------------------------------------+
```

---

## Operations Per Chain

All chains implement `XChainClient` interface:

| Tab | Method | Inputs |
|-----|--------|--------|
| Address | `getAddress(walletIndex)` | walletIndex (default 0) |
| Balance | `getBalance(address, assets?)` | address, optional asset filter |
| Fees | `getFees()` | none |
| Transfer | `transfer(params)` | recipient, amount, memo, walletIndex |
| History | `getTransactions(params)` | address, limit, offset |
| Validate | `validateAddress(address)` | address string |
| Explorer | `getExplorerUrl/AddressUrl/TxUrl` | address or txId |

### THORChain/MAYAChain Additional

| Tab | Description | Inputs |
|-----|-------------|--------|
| Deposit | Swap/deposit via inbound | inbound address, amount, memo |
| Inbound | View inbound addresses | (fetched from thornode/mayanode) |

---

## Key Implementation Details

### Client Factory Pattern

```typescript
// src/lib/clients/factory.ts
import { Client as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
// ... other imports

export function createClient(chainId: string, config: ClientConfig): XChainClient {
  const { phrase, network } = config

  switch (chainId) {
    case 'BTC':
      return new BtcClient({ ...defaultBTCParams, network, phrase })
    case 'ETH':
      return new EthClient({ ...defaultEthParams, network, phrase })
    // ... all 20 chains
  }
}
```

### Wallet Context (Mnemonic Security)

```typescript
// src/contexts/WalletContext.tsx
// - Mnemonic stored in React state ONLY (memory)
// - Never persisted to localStorage
// - Cleared on page refresh or disconnect
// - Warning displayed: "Testing only - do not use with significant funds"
```

### Vite Config (Browser Polyfills)

Reference: `examples/frameworks/vite-example/vite.config.ts`

```typescript
// vite.config.ts
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: { global: 'globalThis' },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
    }
  }
})
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "@xchainjs/xchain-bitcoin": "workspace:*",
    "@xchainjs/xchain-litecoin": "workspace:*",
    "@xchainjs/xchain-bitcoincash": "workspace:*",
    "@xchainjs/xchain-doge": "workspace:*",
    "@xchainjs/xchain-dash": "workspace:*",
    "@xchainjs/xchain-zcash": "workspace:*",
    "@xchainjs/xchain-ethereum": "workspace:*",
    "@xchainjs/xchain-arbitrum": "workspace:*",
    "@xchainjs/xchain-avax": "workspace:*",
    "@xchainjs/xchain-bsc": "workspace:*",
    "@xchainjs/xchain-base": "workspace:*",
    "@xchainjs/xchain-cosmos": "workspace:*",
    "@xchainjs/xchain-thorchain": "workspace:*",
    "@xchainjs/xchain-mayachain": "workspace:*",
    "@xchainjs/xchain-kujira": "workspace:*",
    "@xchainjs/xchain-solana": "workspace:*",
    "@xchainjs/xchain-cardano": "workspace:*",
    "@xchainjs/xchain-radix": "workspace:*",
    "@xchainjs/xchain-ripple": "workspace:*",
    "@xchainjs/xchain-tron": "workspace:*",
    "@xchainjs/xchain-client": "workspace:*",
    "@xchainjs/xchain-crypto": "workspace:*",
    "@xchainjs/xchain-util": "workspace:*",
    "@xchainjs/xchain-thorchain-query": "workspace:*",
    "@xchainjs/xchain-mayachain-query": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.330.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.1.0",
    "vite-plugin-node-stdlib-browser": "^0.2.1",
    "typescript": "^5.3.0"
  }
}
```

---

## Running the Tool

```bash
# From monorepo root
yarn workspace testing-gui dev

# Or from tools/testing-gui
cd tools/testing-gui
yarn dev

# Opens at http://localhost:3000
```

---

## Critical Reference Files

| File | Purpose |
|------|---------|
| `packages/xchain-client/src/types.ts` | XChainClient interface definition |
| `examples/frameworks/vite-example/vite.config.ts` | Working browser polyfills config |
| `tools/txJammer/txJammer.ts` | Multi-chain client instantiation pattern |
| `examples/thorchain/transaction-transfer.ts` | Transfer example pattern |
| `packages/xchain-bitcoin/src/client.ts` | UTXO client implementation reference |
| `packages/xchain-ethereum/src/client.ts` | EVM client implementation reference |

---

## Implementation Order

1. **Scaffold** - Create `tools/testing-gui` with Vite + React + Tailwind
2. **Contexts** - WalletContext, ConfigContext
3. **Client Factory** - Chain registry + createClient function
4. **Layout** - Sidebar, Header, main content area
5. **Read Operations** - getAddress, getBalance, getFees, validateAddress, explorer URLs
6. **History** - getTransactions, getTransactionData
7. **Write Operations** - transfer (with confirmation dialog)
8. **THORChain/Maya** - Deposit form, inbound addresses display
9. **Polish** - Error handling, loading states, result formatting

---

## Verification

1. Run `yarn dev` from `tools/testing-gui`
2. Open `http://localhost:3000`
3. Connect wallet with test mnemonic
4. Select Bitcoin from sidebar
5. Test `getAddress` - should show derived address
6. Test `getBalance` - should query and display balance
7. Test `validateAddress` - should validate address format
8. Test `transfer` (with small amount) - should broadcast and return txHash
9. Repeat for 2-3 other chain types (ETH, THOR, SOL)
