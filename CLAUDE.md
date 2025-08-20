# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

XChainJS is a comprehensive blockchain development toolkit consisting of a Yarn-managed monorepo with multiple packages that enable cross-chain interactions, wallet management, and protocol integrations. The library abstracts blockchain complexities while providing support for multiple protocols including THORChain, MAYAProtocol, and various blockchain networks.

## Development Commands

### Building
- `yarn build` - Build all packages using Turbo
- `yarn build:release` - Build all packages for release
- `yarn build:examples` - Build example projects
- `yarn build:tools` - Build development tools

### Testing
- `yarn test` - Run all tests across packages
- `yarn e2e` - Run end-to-end tests
- `yarn lint` - Run linting across all packages

### Package Management
- `yarn update-packages` - Create changesets for version management
- `yarn increase-packages` - Bump package versions using changesets
- `yarn publish-packages` - Build, test, and publish packages

### Maintenance
- `yarn clean` - Clean all build artifacts and Turbo cache
- `yarn clean:nodemodules` - Remove all node_modules directories
- `yarn check:trunk` - Run trunk code quality checks

## Monorepo Structure

The repository uses Yarn workspaces with three main workspace categories:
- `packages/*` - Core XChainJS packages
- `examples/*` - Example implementations and demos
- `tools/*` - Development and testing tools

### Core Package Categories

**Client Packages** (`xchain-*`): Blockchain-specific clients for transaction handling, fee estimation, and balance queries. Each client follows a consistent interface pattern.

**Utility Packages**:
- `xchain-client` - Base client interface and common functionality
- `xchain-crypto` - Cryptographic utilities and key management
- `xchain-util` - General utility functions
- `xchain-utxo` - UTXO-based blockchain utilities
- `xchain-evm` - Ethereum Virtual Machine utilities

**Protocol Packages**:
- THORChain: `xchain-thorchain`, `xchain-thornode`, `xchain-midgard`, `xchain-thorchain-query`, `xchain-thorchain-amm`
- MAYAChain: `xchain-mayachain`, `xchain-mayanode`, `xchain-mayamidgard`, `xchain-mayachain-query`, `xchain-mayachain-amm`

**High-Level Packages**:
- `xchain-wallet` - Multi-chain wallet management
- `xchain-aggregator` - Protocol aggregation for cross-chain operations

## Build System

- **Package Manager**: Yarn v4.2.2 with workspaces
- **Build Tool**: Turbo for monorepo task orchestration
- **Bundling**: Rollup for package builds
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Testing**: Jest for unit and integration tests

## Architecture Patterns

### Client Architecture
All blockchain clients extend a base client interface providing consistent methods for:
- Address generation and validation
- Transaction preparation and broadcasting
- Fee estimation
- Balance queries
- Transaction history

### Workspace Dependencies
Packages use `workspace:*` protocol for internal dependencies, ensuring version consistency across the monorepo.

### Testing Strategy
- Unit tests in `__tests__/` directories
- E2E tests in `__e2e__/` directories using separate Jest configurations
- Mocks in `__mocks__/` directories for external API calls

## Development Workflow

1. **Changesets**: Use `yarn update-packages` to create changesets describing changes
2. **Version Management**: Automated through changesets - never manually edit package versions
3. **Release Process**: `yarn publish-packages` handles the complete release pipeline
4. **Code Quality**: Husky pre-commit hooks run linting automatically

## Testing Individual Packages

To test a specific package:
```bash
cd packages/xchain-bitcoin
yarn test
```

To run E2E tests for a package:
```bash
cd packages/xchain-bitcoin
yarn e2e
```

## Key Development Notes

- All packages build to `lib/` directory with CommonJS, ESM, and TypeScript definitions
- Examples demonstrate real-world usage patterns for complex operations like swaps and liquidity provision
- The aggregator package enables protocol-agnostic operations across different AMMs and bridges
- Ledger hardware wallet support is available for compatible chains
- The library supports both mainnet and testnet configurations for all chains