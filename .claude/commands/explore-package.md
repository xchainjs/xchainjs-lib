# Explore Package

Provide a deep architectural overview of a package in the xchainjs monorepo.

## Input

Package identifier: $ARGUMENTS

## Instructions

1. **Resolve the package name.** The user may provide a short name like "bitcoin" or "thorchain-amm". Resolve it:
   - If it already starts with `xchain-`, use `packages/$ARGUMENTS`
   - Otherwise, try `packages/xchain-$ARGUMENTS`
   - If neither exists, glob for `packages/*$ARGUMENTS*` and ask the user to clarify if ambiguous

2. **Read key files.** For the resolved package, read:
   - `package.json` — name, version, dependencies, scripts
   - `src/index.ts` — public API surface (exports)
   - `src/client.ts` — main client class (if exists)
   - `src/const.ts` — constants, asset definitions, defaults (if exists)
   - `src/types.ts` — type definitions (if exists)
   - `src/utils.ts` — utility functions (if exists)
   - `tsconfig.json` — TypeScript configuration
   - `rollup.config.js` — build output config

3. **Identify the package category** and its role in the architecture:
   - **Core**: `xchain-client`, `xchain-crypto`, `xchain-util` — foundational types and interfaces
   - **Shared chain infra**: `xchain-utxo`, `xchain-evm`, `xchain-cosmos-sdk` — base classes for chain families
   - **Providers**: `xchain-utxo-providers`, `xchain-evm-providers` — pluggable data sources
   - **Blockchain clients**: `xchain-bitcoin`, `xchain-ethereum`, etc. — chain-specific implementations
   - **Query packages**: `xchain-thorchain-query`, `xchain-midgard-query` — cross-chain query logic
   - **High-level**: `xchain-thorchain-amm`, `xchain-aggregator`, `xchain-wallet` — application-level features
   - **API packages**: `xchain-thornode`, `xchain-mayanode`, `xchain-midgard`, `xchain-mayamidgard` — auto-generated from OpenAPI specs

4. **Analyze the client class hierarchy.** Most chain packages have:
   - A base/default client (often extends from `xchain-client` or a shared infra package)
   - `clientKeystore.ts` — keystore wallet variant
   - `clientLedger.ts` — Ledger hardware wallet variant

   Describe which base class it extends and what methods it overrides.

5. **Map internal dependencies.** List all `@xchainjs/*` packages it depends on, and which packages depend on IT (reverse deps). This shows where it sits in the dependency graph.

6. **Summarize the public API.** From `src/index.ts`, list the main exports:
   - Client classes
   - Type exports
   - Utility functions
   - Constants (default fees, asset definitions, etc.)

7. **Describe the test coverage.** List files in `__tests__/` and `__e2e__/` (if present), noting what aspects of the package are tested.

8. **Present the overview** in a structured format with sections for: Purpose, Architecture, Dependencies, Public API, Testing, and any Notable Patterns or Gotchas.
