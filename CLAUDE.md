# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Setup
nvm use                # Node 20.14
yarn install           # Yarn 4.9.2 (workspaces)

# Build
yarn build             # Build all packages (turbo, respects dependency order)
yarn build --filter=@xchainjs/xchain-bitcoin  # Build one package + its deps

# Test
yarn test              # All packages
yarn test --filter=@xchainjs/xchain-bitcoin    # One package
cd packages/xchain-bitcoin && yarn test        # Alt: run from package dir
cd packages/xchain-bitcoin && npx jest __tests__/client.test.ts  # Single test file

# E2E (some packages have __e2e__/ dirs)
cd packages/xchain-thorchain && yarn e2e

# Lint
yarn lint              # All packages
cd packages/xchain-bitcoin && yarn lint        # One package (auto-fixes)
```

Turbo caches in `.turbo/`. `test` and `build` depend on `build` of upstream packages (`^build` in turbo pipeline). If tests fail mysteriously, try `yarn build` first.

## Code Style

- Prettier: single quotes, no semicolons, trailing commas, 120 char width, 2-space indent
- ESLint with TypeScript plugin, configured in root `eslint.config.mjs`
- Pre-commit hook runs `yarn lint` via Husky

## Architecture

**Monorepo** with ~43 packages under `packages/`, managed by Yarn workspaces + Turborepo. Internal deps use `workspace:*`.

### Package Layers (dependency flows downward)

```
AMM / Aggregator / Wallet          (xchain-thorchain-amm, xchain-aggregator, xchain-wallet)
    ↓
Query packages                     (xchain-thorchain-query, xchain-midgard-query, ...)
    ↓
Blockchain clients                 (xchain-bitcoin, xchain-ethereum, xchain-thorchain, ...)
    ↓
Shared chain infra                 (xchain-utxo, xchain-evm, xchain-cosmos-sdk)
    ↓
Providers                          (xchain-utxo-providers, xchain-evm-providers)
    ↓
Core                               (xchain-client, xchain-crypto, xchain-util)
```

### API packages (auto-generated)

`xchain-thornode`, `xchain-mayanode`, `xchain-midgard`, `xchain-mayamidgard` are generated from OpenAPI specs. Don't hand-edit these.

### Common package structure

```
packages/xchain-<name>/
├── src/
│   ├── index.ts              # Public exports
│   ├── client.ts             # Main client (extends base from xchain-client)
│   ├── clientKeystore.ts     # Keystore variant
│   ├── clientLedger.ts       # Ledger hardware wallet variant
│   ├── const.ts              # Chain constants (asset defs, decimals, fees)
│   └── utils.ts
├── __tests__/                # Jest unit tests (ts-jest preset)
├── __e2e__/                  # Optional e2e tests
├── rollup.config.js          # Dual output: CJS (lib/index.js) + ESM (lib/index.esm.js)
└── tsconfig.json             # Extends root tsconfig.json
```

### Key patterns

- **Client variants**: Most chain packages expose 3 client classes (default/keystore/ledger) extending a shared base from `xchain-client`
- **Provider abstraction**: Data providers (balance, fees, tx history) are pluggable via `*-providers` packages
- **Asset representation**: Uses `Asset` type from `xchain-util` with chain/symbol/ticker fields; amounts use `BaseAmount`/`AssetAmount` wrappers around BigNumber

## Versioning & Releases

Uses [Changesets](https://github.com/changesets/changesets). To propose version bumps:

```bash
yarn update-packages   # Interactive: select packages, bump type, write changelog
```

This creates a changeset file in `.changeset/`. Include it in your PR. Don't manually edit package versions.

## Behavioral Guidelines

- State assumptions explicitly. If uncertain, ask.
- Minimum code that solves the problem. No speculative features or abstractions.
- Surgical changes only: don't "improve" adjacent code, match existing style.
- Remove imports/variables YOUR changes made unused; don't touch pre-existing dead code.
- Define verifiable success criteria before implementing. Every changed line should trace to the request.
