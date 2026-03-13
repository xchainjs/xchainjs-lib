# New Chain

Generate a scaffold plan for adding a new blockchain client to the xchainjs monorepo.

## Input

Chain name and optional details (e.g., "solana" or "solana evm-compatible"): $ARGUMENTS

## Instructions

1. **Parse the input.** Extract:
   - Chain name (first word): will become `xchain-<name>`
   - Optional chain family hint: "utxo", "evm", "cosmos", or standalone

2. **Determine the chain family.** If not specified, ask the user:
   - **UTXO-based** (like Bitcoin, Litecoin, Dogecoin): extends `xchain-utxo`, uses `xchain-utxo-providers`
   - **EVM-compatible** (like Ethereum, Avalanche, BSC): extends `xchain-evm`, uses `xchain-evm-providers`
   - **Cosmos SDK-based** (like THORChain, Maya): extends `xchain-cosmos-sdk`
   - **Standalone** (unique architecture): extends `xchain-client` directly

3. **Find an existing reference package** from the same family:
   - UTXO: use `packages/xchain-bitcoin/` as reference
   - EVM: use `packages/xchain-ethereum/` as reference
   - Cosmos: use `packages/xchain-thorchain/` as reference
   - Standalone: use `packages/xchain-solana/` or `packages/xchain-radix/` as reference

   Read the reference package's structure to understand the patterns.

4. **Generate the scaffold plan.** List every file that needs to be created:

   ```
   packages/xchain-<name>/
   ├── package.json              # With correct @xchainjs deps for the chain family
   ├── tsconfig.json             # Extends root tsconfig
   ├── rollup.config.js          # Standard dual CJS/ESM output
   ├── src/
   │   ├── index.ts              # Re-exports everything
   │   ├── client.ts             # Main client extending appropriate base
   │   ├── clientKeystore.ts     # Keystore wallet variant
   │   ├── clientLedger.ts       # Ledger hardware wallet variant (stub)
   │   ├── const.ts              # Chain ID, native asset, decimals, default fees, explorer URLs
   │   ├── types.ts              # Chain-specific types
   │   └── utils.ts              # Helpers (address validation, tx parsing, etc.)
   ├── __tests__/
   │   └── client.test.ts        # Unit tests with mocked providers
   └── __e2e__/
       └── client.test.ts        # E2E tests (optional, needs RPC access)
   ```

5. **Detail what each file should contain**, based on the reference package:
   - `const.ts`: Define `AssetInfo`, chain ID, decimals, default gas/fee, explorer URLs
   - `client.ts`: Extend the appropriate base class, implement required abstract methods
   - `clientKeystore.ts`: Implement `getAddress()`, `transfer()` using keystore
   - `types.ts`: Any chain-specific types needed

6. **List monorepo integration steps:**
   - The package will be auto-discovered by Yarn workspaces (glob: `packages/*`)
   - Add to Turborepo pipeline (already covered by `packages/*` glob)
   - Register the chain in `xchain-util` if adding a new `Chain` enum value
   - Add to `xchain-wallet` if it should be supported in the multi-chain wallet

7. **List the dependency chain** that will be needed:
   ```
   @xchainjs/xchain-client (always)
   @xchainjs/xchain-crypto (always)
   @xchainjs/xchain-util (always)
   @xchainjs/xchain-<family> (if UTXO/EVM/Cosmos)
   @xchainjs/xchain-<family>-providers (if UTXO/EVM)
   ```

8. **Create a checklist** the developer can follow:
   - [ ] Create package directory and files
   - [ ] Implement const.ts with chain constants
   - [ ] Implement client.ts extending base class
   - [ ] Implement clientKeystore.ts
   - [ ] Stub clientLedger.ts
   - [ ] Write unit tests
   - [ ] Run `yarn install` to link workspace deps
   - [ ] Run `yarn build --filter=@xchainjs/xchain-<name>` to verify build
   - [ ] Run tests
   - [ ] Create changeset: `yarn update-packages`
   - [ ] Add chain to xchain-util Chain enum (if new chain)

Present the plan clearly. Do NOT create the files — just present the plan for the user to review. Ask if they want you to proceed with scaffolding.
